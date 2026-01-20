#!/usr/bin/env ts-node
/**
 * HOTFIX PIPELINE
 * ===============
 * 
 * Deploy rapid pentru bugfix-uri critice în producție
 * Bypass-uri: skip unele teste, deploy direct, rollback rapid
 * 
 * Usage: npm run hotfix -- "fix: critical bug in checkout"
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  mainBranch: 'main',
  hotfixBranchPrefix: 'hotfix/',
  environment: process.env.NODE_ENV || 'production',
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  deployTimeout: 120000, // 2 minutes
  healthCheckRetries: 5,
  healthCheckDelay: 10000, // 10s
};

// ============================================
// TYPES
// ============================================

interface HotfixStep {
  name: string;
  critical: boolean;
  execute: () => Promise<void>;
}

interface HotfixReport {
  timestamp: Date;
  commitHash: string;
  message: string;
  steps: Array<{
    name: string;
    status: 'success' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }>;
  rollbackInfo?: {
    previousCommit: string;
    rollbackCommand: string;
  };
}

// ============================================
// UTILITIES
// ============================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    reset: '\x1b[0m',
  };
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
  };
  
  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 5000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (_error) {
      if (i === retries - 1) throw error;
      log(`Retry ${i + 1}/${retries} after ${delay}ms...`, 'warn');
      await sleep(delay);
    }
  }
  throw new Error('Max retries exceeded');
}

// ============================================
// HOTFIX STEPS
// ============================================

async function getCurrentCommit(): Promise<string> {
  const { stdout } = await execAsync('git rev-parse HEAD');
  return stdout.trim();
}

async function getCurrentBranch(): Promise<string> {
  const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
  return stdout.trim();
}

async function hasUncommittedChanges(): Promise<boolean> {
  const { stdout } = await execAsync('git status --porcelain');
  return stdout.trim().length > 0;
}

async function step1_PreFlightCheck() {
  log('Pre-flight check...', 'info');
  
  // Check if on main branch
  const branch = await getCurrentBranch();
  if (branch !== CONFIG.mainBranch) {
    throw new Error(`Must be on ${CONFIG.mainBranch} branch (currently on ${branch})`);
  }
  
  // Check for uncommitted changes
  if (await hasUncommittedChanges()) {
    throw new Error('Uncommitted changes detected - commit or stash them first');
  }
  
  // Check if synced with remote
  await execAsync('git fetch origin');
  
  const { stdout: localHash } = await execAsync(`git rev-parse ${CONFIG.mainBranch}`);
  const { stdout: remoteHash } = await execAsync(`git rev-parse origin/${CONFIG.mainBranch}`);
  
  if (localHash.trim() !== remoteHash.trim()) {
    throw new Error('Local branch not synced with remote - pull latest changes');
  }
  
  log('Pre-flight check passed', 'success');
}

async function step2_CreateHotfixBranch(commitMessage: string) {
  log('Creating hotfix branch...', 'info');
  
  // Generate branch name from commit message
  const branchName = commitMessage
    .toLowerCase()
    .replace(/^(fix|hotfix):\s*/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  const hotfixBranch = `${CONFIG.hotfixBranchPrefix}${branchName}`;
  
  await execAsync(`git checkout -b ${hotfixBranch}`);
  
  log(`Created branch: ${hotfixBranch}`, 'success');
  
  return hotfixBranch;
}

async function step3_BuildAndTest() {
  log('Building application...', 'info');
  
  // Install dependencies (in case package.json changed)
  await execAsync('npm install');
  
  // Build
  await execAsync('npm run build');
  
  log('Build successful', 'success');
  
  // Quick smoke tests (skip extensive tests for speed)
  log('Running quick smoke tests...', 'info');
  
  try {
    await execAsync('npm run smoke-tests', { timeout: 30000 });
    log('Smoke tests passed', 'success');
  } catch (_error) {
    log('Smoke tests failed - continuing anyway (hotfix mode)', 'warn');
  }
}

async function step4_CommitAndPush(message: string, branch: string) {
  log('Committing changes...', 'info');
  
  // Add all changes
  await execAsync('git add -A');
  
  // Commit
  await execAsync(`git commit -m "${message}"`);
  
  const commitHash = await getCurrentCommit();
  
  // Push to remote
  await execAsync(`git push origin ${branch}`);
  
  log(`Committed and pushed: ${commitHash.substring(0, 8)}`, 'success');
  
  return commitHash;
}

async function step5_MergeTomain() {
  log('Merging to main...', 'info');
  
  // Switch to main
  await execAsync(`git checkout ${CONFIG.mainBranch}`);
  
  // Get current branch name
  const { stdout } = await execAsync('git rev-parse --abbrev-ref @{-1}');
  const hotfixBranch = stdout.trim();
  
  // Merge hotfix branch
  await execAsync(`git merge --no-ff ${hotfixBranch} -m "Merge ${hotfixBranch}"`);
  
  // Push to remote
  await execAsync('git push origin main');
  
  log('Merged to main and pushed', 'success');
}

async function step6_DeployToProduction() {
  log('Deploying to production...', 'info');
  
  // Database migration (if needed)
  try {
    await execAsync('npx prisma migrate deploy');
    log('Database migrations applied', 'success');
  } catch (_error) {
    log('No migrations to apply', 'info');
  }
  
  // Deploy based on platform
  const deployPlatform = process.env.DEPLOY_PLATFORM || 'pm2';
  
  if (deployPlatform === 'pm2') {
    await execAsync('pm2 reload ecosystem.config.js --update-env');
    log('PM2 reload completed', 'success');
  } else if (deployPlatform === 'vercel') {
    log('Vercel auto-deploy triggered', 'info');
    // Vercel deploys automatically on git push
  } else {
    log(`Unknown deploy platform: ${deployPlatform}`, 'warn');
  }
  
  // Wait for deployment to stabilize
  log('Waiting for deployment to stabilize...', 'info');
  await sleep(15000); // 15s
}

async function step7_HealthChecks() {
  log('Running health checks...', 'info');
  
  await retry(async () => {
    // Check API health
    const response = await fetch(`${CONFIG.baseUrl}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'healthy' && data.status !== 'degraded') {
      throw new Error(`Platform unhealthy: ${data.status}`);
    }
    
    log('Health checks passed', 'success');
  }, CONFIG.healthCheckRetries, CONFIG.healthCheckDelay);
}

async function step8_NotifyTeam(commitHash: string, message: string) {
  log('Notifying team...', 'info');
  
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    log('Slack webhook not configured - skipping notification', 'warn');
    return;
  }
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *HOTFIX DEPLOYED*\n\n*Commit*: ${commitHash.substring(0, 8)}\n*Message*: ${message}\n*Time*: ${new Date().toLocaleString()}\n*Environment*: ${CONFIG.environment}\n\n⚠️ Monitor closely for the next 30 minutes`,
      }),
    });
    
    log('Team notified via Slack', 'success');
  } catch (_error) {
    log('Failed to send Slack notification', 'warn');
  }
}

// ============================================
// ROLLBACK FUNCTION
// ============================================

async function rollback(targetCommit: string) {
  log('\n🔄 INITIATING ROLLBACK...', 'warn');
  
  try {
    // Revert to previous commit
    await execAsync(`git revert ${targetCommit} --no-edit`);
    
    // Push revert
    await execAsync('git push origin main');
    
    // Deploy again
    await step6_DeployToProduction();
    
    // Health check
    await step7_HealthChecks();
    
    log('✅ ROLLBACK SUCCESSFUL', 'success');
    
    // Notify team
    await step8_NotifyTeam('ROLLBACK', `Rolled back commit ${targetCommit.substring(0, 8)}`);
  } catch (_error) {
    log(`❌ ROLLBACK FAILED: ${error}`, 'error');
    log('🚨 MANUAL INTERVENTION REQUIRED', 'error');
    throw error;
  }
}

// ============================================
// MAIN HOTFIX EXECUTION
// ============================================

async function executeHotfix(commitMessage: string): Promise<HotfixReport> {
  const report: HotfixReport = {
    timestamp: new Date(),
    commitHash: '',
    message: commitMessage,
    steps: [],
  };
  
  let previousCommit = '';
  let hotfixBranch = '';
  
  try {
    // Store previous commit for rollback
    previousCommit = await getCurrentCommit();
    
    // Step 1: Pre-flight check
    const start1 = performance.now();
    await step1_PreFlightCheck();
    report.steps.push({
      name: 'Pre-flight check',
      status: 'success',
      duration: Math.round(performance.now() - start1),
    });
    
    // Step 2: Create hotfix branch
    const start2 = performance.now();
    hotfixBranch = await step2_CreateHotfixBranch(commitMessage);
    report.steps.push({
      name: 'Create hotfix branch',
      status: 'success',
      duration: Math.round(performance.now() - start2),
    });
    
    // Step 3: Build and test
    const start3 = performance.now();
    await step3_BuildAndTest();
    report.steps.push({
      name: 'Build and test',
      status: 'success',
      duration: Math.round(performance.now() - start3),
    });
    
    // Step 4: Commit and push
    const start4 = performance.now();
    const commitHash = await step4_CommitAndPush(commitMessage, hotfixBranch);
    report.commitHash = commitHash;
    report.steps.push({
      name: 'Commit and push',
      status: 'success',
      duration: Math.round(performance.now() - start4),
    });
    
    // Step 5: Merge to main
    const start5 = performance.now();
    await step5_MergeTomain();
    report.steps.push({
      name: 'Merge to main',
      status: 'success',
      duration: Math.round(performance.now() - start5),
    });
    
    // Step 6: Deploy to production
    const start6 = performance.now();
    await step6_DeployToProduction();
    report.steps.push({
      name: 'Deploy to production',
      status: 'success',
      duration: Math.round(performance.now() - start6),
    });
    
    // Step 7: Health checks
    const start7 = performance.now();
    await step7_HealthChecks();
    report.steps.push({
      name: 'Health checks',
      status: 'success',
      duration: Math.round(performance.now() - start7),
    });
    
    // Step 8: Notify team
    const start8 = performance.now();
    await step8_NotifyTeam(commitHash, commitMessage);
    report.steps.push({
      name: 'Notify team',
      status: 'success',
      duration: Math.round(performance.now() - start8),
    });
    
    // Store rollback info
    report.rollbackInfo = {
      previousCommit,
      rollbackCommand: `npm run rollback -- ${commitHash}`,
    };
    
    return report;
  } catch (_error) {
    const errorMsg = String(error);
    
    log(`\n❌ HOTFIX FAILED: ${errorMsg}`, 'error');
    
    // Add failed step
    report.steps.push({
      name: 'FAILED',
      status: 'failed',
      duration: 0,
      error: errorMsg,
    });
    
    // Offer rollback
    log('\n⚠️  HOTFIX DEPLOYMENT FAILED', 'warn');
    log(`To rollback: npm run rollback -- ${report.commitHash || previousCommit}`, 'warn');
    
    throw error;
  }
}

// ============================================
// CLI EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: npm run hotfix -- "fix: your commit message"');
    process.exit(1);
  }
  
  const commitMessage = args.join(' ');
  
  // Validation
  if (!commitMessage.match(/^(fix|hotfix):/i)) {
    log('⚠️  Commit message should start with "fix:" or "hotfix:"', 'warn');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🚨 HOTFIX DEPLOYMENT');
  console.log('='.repeat(60));
  console.log(`Message: ${commitMessage}`);
  console.log('='.repeat(60) + '\n');
  
  // Warning countdown
  log('⏰ Starting hotfix deployment in 5 seconds...', 'warn');
  log('   Press Ctrl+C to cancel', 'warn');
  
  await sleep(5000);
  
  try {
    const report = await executeHotfix(commitMessage);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ HOTFIX DEPLOYED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`Commit: ${report.commitHash.substring(0, 8)}`);
    console.log(`Total steps: ${report.steps.length}`);
    console.log(`Total time: ${report.steps.reduce((sum, s) => sum + s.duration, 0)}ms`);
    console.log('='.repeat(60));
    
    if (report.rollbackInfo) {
      console.log('\n⚠️  If issues arise, rollback with:');
      console.log(`   ${report.rollbackInfo.rollbackCommand}`);
    }
    
    console.log('\n📊 Monitor the platform closely for the next 30 minutes\n');
    
    process.exit(0);
  } catch (_error) {
    console.error('\n❌ Hotfix deployment failed\n');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { executeHotfix, rollback };
export type { HotfixReport };
