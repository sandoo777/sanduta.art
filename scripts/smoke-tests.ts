#!/usr/bin/env ts-node
/**
 * SMOKE TESTS - Post-Launch Verification
 * ========================================
 * 
 * Teste rapide pentru verificarea funcționalității de bază
 * imediat după lansare. Rulează în <5 minute.
 * 
 * Usage: npm run smoke-tests
 */

// ============================================
// CONFIGURATION
// ============================================

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds per test

// ============================================
// TYPES
// ============================================

interface SmokeTest {
  name: string;
  category: 'critical' | 'important' | 'optional';
  test: () => Promise<boolean>;
  error?: string;
}

interface SmokeTestReport {
  timestamp: Date;
  passed: number;
  failed: number;
  total: number;
  results: Array<{
    name: string;
    category: string;
    status: 'pass' | 'fail';
    error?: string;
    duration: number;
  }>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchWithTimeout(url: string, timeout: number = TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (_error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function log(message: string, type: 'info' | 'pass' | 'fail' | 'warn' = 'info') {
  const icons = {
    info: 'ℹ️',
    pass: '✅',
    fail: '❌',
    warn: '⚠️',
  };
  
  console.log(`${icons[type]} ${message}`);
}

// ============================================
// SMOKE TESTS
// ============================================

const smokeTests: SmokeTest[] = [
  // CRITICAL TESTS
  {
    name: 'Homepage loads',
    category: 'critical',
    test: async () => {
      const response = await fetchWithTimeout(BASE_URL);
      return response.ok && response.status === 200;
    },
  },
  
  {
    name: 'API Health endpoint responds',
    category: 'critical',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/api/health`);
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.status === 'healthy' || data.status === 'degraded';
    },
  },
  
  {
    name: 'Database connection active',
    category: 'critical',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/api/health`);
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.checks?.database?.status === 'healthy';
    },
  },
  
  {
    name: 'Products page loads',
    category: 'critical',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/products`);
      return response.ok;
    },
  },
  
  // IMPORTANT TESTS
  {
    name: 'Categories page loads',
    category: 'important',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/categories`);
      return response.ok || response.status === 404; // OK if not implemented
    },
  },
  
  {
    name: 'Configurator accessible',
    category: 'important',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/configurator`);
      return response.ok || response.status === 404;
    },
  },
  
  {
    name: 'Editor accessible',
    category: 'important',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/editor`);
      return response.ok || response.status === 404;
    },
  },
  
  {
    name: 'Cart page loads',
    category: 'important',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/cart`);
      return response.ok;
    },
  },
  
  {
    name: 'Checkout page loads',
    category: 'important',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/checkout`);
      return response.ok || response.status === 302; // Redirect OK
    },
  },
  
  {
    name: 'Login page loads',
    category: 'important',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/login`);
      return response.ok;
    },
  },
  
  {
    name: 'Admin panel accessible',
    category: 'important',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/admin`);
      return response.ok || response.status === 302 || response.status === 401;
    },
  },
  
  // OPTIONAL TESTS
  {
    name: 'Blog page loads',
    category: 'optional',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/blog`);
      return response.ok || response.status === 404;
    },
  },
  
  {
    name: 'About page loads',
    category: 'optional',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/about`);
      return response.ok || response.status === 404;
    },
  },
  
  {
    name: 'Contact page loads',
    category: 'optional',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/contact`);
      return response.ok || response.status === 404;
    },
  },
  
  {
    name: 'Sitemap accessible',
    category: 'optional',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/sitemap.xml`);
      return response.ok;
    },
  },
  
  {
    name: 'Robots.txt accessible',
    category: 'optional',
    test: async () => {
      const response = await fetchWithTimeout(`${BASE_URL}/robots.txt`);
      return response.ok;
    },
  },
];

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runSmokeTests(): Promise<SmokeTestReport> {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 SMOKE TESTS - Post-Launch Verification');
  console.log('='.repeat(60) + '\n');
  
  log(`Base URL: ${BASE_URL}`);
  log(`Total tests: ${smokeTests.length}\n`);
  
  const results: SmokeTestReport['results'] = [];
  let passed = 0;
  let failed = 0;
  
  for (const test of smokeTests) {
    const startTime = performance.now();
    
    try {
      const result = await test.test();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      if (result) {
        passed++;
        log(`${test.name} (${duration}ms)`, 'pass');
        
        results.push({
          name: test.name,
          category: test.category,
          status: 'pass',
          duration,
        });
      } else {
        failed++;
        log(`${test.name} (${duration}ms)`, 'fail');
        
        results.push({
          name: test.name,
          category: test.category,
          status: 'fail',
          error: 'Test returned false',
          duration,
        });
      }
    } catch (_error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      failed++;
      const errorMsg = String(error);
      log(`${test.name} - ${errorMsg}`, 'fail');
      
      results.push({
        name: test.name,
        category: test.category,
        status: 'fail',
        error: errorMsg,
        duration,
      });
    }
  }
  
  return {
    timestamp: new Date(),
    passed,
    failed,
    total: smokeTests.length,
    results,
  };
}

// ============================================
// REPORT GENERATION
// ============================================

function generateReport(report: SmokeTestReport): string {
  let output = '\n' + '='.repeat(60) + '\n';
  output += '📊 SMOKE TEST REPORT\n';
  output += '='.repeat(60) + '\n\n';
  
  output += `Timestamp: ${report.timestamp.toISOString()}\n`;
  output += `Total: ${report.total}\n`;
  output += `Passed: ${report.passed}\n`;
  output += `Failed: ${report.failed}\n`;
  output += `Success Rate: ${Math.round((report.passed / report.total) * 100)}%\n\n`;
  
  // Critical failures
  const criticalFailures = report.results.filter(
    r => r.status === 'fail' && r.category === 'critical'
  );
  
  if (criticalFailures.length > 0) {
    output += '🚨 CRITICAL FAILURES:\n';
    for (const failure of criticalFailures) {
      output += `  - ${failure.name}: ${failure.error}\n`;
    }
    output += '\n';
  }
  
  // Summary by category
  const categories = ['critical', 'important', 'optional'] as const;
  
  for (const category of categories) {
    const tests = report.results.filter(r => r.category === category);
    const categoryPassed = tests.filter(r => r.status === 'pass').length;
    
    output += `${category.toUpperCase()}: ${categoryPassed}/${tests.length} passed\n`;
  }
  
  output += '\n' + '='.repeat(60) + '\n';
  
  if (criticalFailures.length > 0) {
    output += '❌ CRITICAL TESTS FAILED - DO NOT PROCEED WITH LAUNCH\n';
  } else if (report.failed === 0) {
    output += '✅ ALL TESTS PASSED - PLATFORM READY\n';
  } else {
    output += '⚠️  SOME TESTS FAILED - REVIEW BEFORE PROCEEDING\n';
  }
  
  output += '='.repeat(60) + '\n';
  
  return output;
}

// ============================================
// EXECUTION
// ============================================

async function main() {
  try {
    const report = await runSmokeTests();
    const output = generateReport(report);
    
    console.log(output);
    
    // Exit with appropriate code
    const criticalFailures = report.results.filter(
      r => r.status === 'fail' && r.category === 'critical'
    );
    
    if (criticalFailures.length > 0) {
      process.exit(1);
    } else if (report.failed > report.total / 2) {
      process.exit(1);
    }
    
    process.exit(0);
  } catch (_error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runSmokeTests, generateReport };
export type { SmokeTestReport };
