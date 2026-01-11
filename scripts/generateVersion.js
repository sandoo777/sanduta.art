#!/usr/bin/env node
// Generate semantic version based on git commits
// scripts/generateVersion.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Semantic Versioning Generator
 * 
 * Generates version based on:
 * - Conventional Commits (feat, fix, BREAKING CHANGE)
 * - Current version in package.json
 * - Git history
 */

function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
  } catch (error) {
    return 'v0.0.0';
  }
}

function parseVersion(tag) {
  const match = tag.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return { major: 0, minor: 0, patch: 0 };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

function getCommitsSinceTag(tag) {
  try {
    const commits = execSync(`git log ${tag}..HEAD --pretty=format:"%s"`, {
      encoding: 'utf-8',
    }).split('\n').filter(Boolean);
    return commits;
  } catch (error) {
    // If no tag exists, get all commits
    try {
      const commits = execSync('git log --pretty=format:"%s"', {
        encoding: 'utf-8',
      }).split('\n').filter(Boolean);
      return commits;
    } catch (error) {
      return [];
    }
  }
}

function analyzeCommits(commits) {
  let hasMajorChange = false;
  let hasMinorChange = false;
  let hasPatchChange = false;

  commits.forEach((commit) => {
    const lower = commit.toLowerCase();
    
    // Check for breaking changes
    if (lower.includes('breaking change') || lower.includes('!:')) {
      hasMajorChange = true;
    }
    
    // Check for features
    else if (lower.startsWith('feat:') || lower.startsWith('feat(')) {
      hasMinorChange = true;
    }
    
    // Check for fixes
    else if (
      lower.startsWith('fix:') ||
      lower.startsWith('fix(') ||
      lower.startsWith('bugfix:') ||
      lower.startsWith('hotfix:')
    ) {
      hasPatchChange = true;
    }
    
    // Other changes count as patch
    else if (
      lower.startsWith('chore:') ||
      lower.startsWith('docs:') ||
      lower.startsWith('style:') ||
      lower.startsWith('refactor:') ||
      lower.startsWith('perf:') ||
      lower.startsWith('test:')
    ) {
      hasPatchChange = true;
    }
  });

  return { hasMajorChange, hasMinorChange, hasPatchChange };
}

function generateNewVersion(currentVersion, analysis) {
  let { major, minor, patch } = currentVersion;

  if (analysis.hasMajorChange) {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (analysis.hasMinorChange) {
    minor += 1;
    patch = 0;
  } else if (analysis.hasPatchChange) {
    patch += 1;
  } else {
    // No conventional commits, just increment patch
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

function updatePackageJson(version) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  packageJson.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.error(`Updated package.json to version ${version}`);
}

function main() {
  const args = process.argv.slice(2);
  const updatePackage = args.includes('--update-package');

  try {
    // Get last tag
    const lastTag = getLastTag();
    console.error(`Last tag: ${lastTag}`);

    // Parse current version
    const currentVersion = parseVersion(lastTag);
    console.error(`Current version: ${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);

    // Get commits since last tag
    const commits = getCommitsSinceTag(lastTag);
    console.error(`Commits since last tag: ${commits.length}`);

    if (commits.length === 0) {
      console.error('No new commits, keeping current version');
      console.log(`${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
      return;
    }

    // Analyze commits
    const analysis = analyzeCommits(commits);
    console.error('Commit analysis:', analysis);

    // Generate new version
    const newVersion = generateNewVersion(currentVersion, analysis);
    console.error(`New version: ${newVersion}`);

    // Update package.json if requested
    if (updatePackage) {
      updatePackageJson(newVersion);
    }

    // Output version (for CI/CD scripts)
    console.log(newVersion);
  } catch (error) {
    console.error('Error generating version:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateNewVersion, analyzeCommits, parseVersion };
