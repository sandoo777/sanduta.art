#!/usr/bin/env node
// Smoke tests post-deployment
// scripts/smokeTests.js

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

/**
 * Smoke Tests - Post-Deploy Validation
 * 
 * Tests critical paths after deployment:
 * - Homepage
 * - Product page
 * - Configurator
 * - Editor
 * - Cart
 * - Checkout
 * - Admin login
 * - Orders
 * - Production dashboard
 * - API health
 */

class SmokeTests {
  constructor(baseUrl, environment) {
    this.baseUrl = baseUrl || process.env.BASE_URL || 'http://localhost:3000';
    this.environment = environment || process.env.ENVIRONMENT || 'staging';
    this.results = [];
    this.failed = [];
  }

  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 10000,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async test(name, url, expectedStatus = 200, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`Testing: ${name}...`);
      
      const response = await this.request(url, options);
      const duration = Date.now() - startTime;

      if (response.status === expectedStatus) {
        console.log(`  ✅ ${name} - ${response.status} (${duration}ms)`);
        this.results.push({
          name,
          status: 'passed',
          duration,
          url,
          httpStatus: response.status,
        });
      } else {
        throw new Error(`Expected ${expectedStatus}, got ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`  ❌ ${name} - ${error.message} (${duration}ms)`);
      
      this.results.push({
        name,
        status: 'failed',
        duration,
        url,
        error: error.message,
      });
      
      this.failed.push({ name, error: error.message });
    }
  }

  async runTests() {
    console.log(`\n🔍 Running smoke tests against: ${this.baseUrl}`);
    console.log(`Environment: ${this.environment}\n`);

    const startTime = Date.now();

    // Test 1: Homepage
    await this.test('Homepage', `${this.baseUrl}/`);

    // Test 2: Product page (assuming product ID 1 exists)
    await this.test('Product Page', `${this.baseUrl}/products/1`);

    // Test 3: Products listing
    await this.test('Products Listing', `${this.baseUrl}/products`);

    // Test 4: Configurator
    await this.test('Configurator', `${this.baseUrl}/configurator`);

    // Test 5: Editor
    await this.test('Editor', `${this.baseUrl}/editor`);

    // Test 6: Cart
    await this.test('Cart', `${this.baseUrl}/cart`);

    // Test 7: Checkout
    await this.test('Checkout', `${this.baseUrl}/checkout`);

    // Test 8: Admin login page
    await this.test('Admin Login', `${this.baseUrl}/admin/login`);

    // Test 9: API Health check
    await this.test('API Health', `${this.baseUrl}/api/health`);

    // Test 10: API Products
    await this.test('API Products', `${this.baseUrl}/api/products`);

    // Test 11: API Categories
    await this.test('API Categories', `${this.baseUrl}/api/categories`);

    const totalDuration = Date.now() - startTime;

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Smoke Tests Summary`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Environment: ${this.environment}`);
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Total tests: ${this.results.length}`);
    console.log(`Passed: ${this.results.filter(r => r.status === 'passed').length}`);
    console.log(`Failed: ${this.failed.length}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log(`${'='.repeat(60)}\n`);

    if (this.failed.length > 0) {
      console.log('❌ Failed tests:');
      this.failed.forEach(({ name, error }) => {
        console.log(`  - ${name}: ${error}`);
      });
      console.log();
    }

    // Save results to file
    await this.saveResults();

    // Exit with error code if any test failed
    if (this.failed.length > 0) {
      process.exit(1);
    }
  }

  async saveResults() {
    const resultsDir = path.join(process.cwd(), 'smoke-test-results');
    
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `smoke-tests-${this.environment}-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    const report = {
      environment: this.environment,
      baseUrl: this.baseUrl,
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.failed.length,
      },
    };

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`Results saved to: ${filepath}`);

    // Also create a failed.json if there are failures (for CI/CD to check)
    if (this.failed.length > 0) {
      const failedPath = path.join(resultsDir, 'failed.json');
      fs.writeFileSync(failedPath, JSON.stringify(this.failed, null, 2));
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  let baseUrl = process.env.BASE_URL;
  let environment = process.env.ENVIRONMENT || 'staging';

  // Parse arguments
  args.forEach((arg, index) => {
    if (arg === '--environment' || arg === '-e') {
      environment = args[index + 1];
    }
    if (arg === '--url' || arg === '-u') {
      baseUrl = args[index + 1];
    }
  });

  // Set base URL based on environment if not explicitly provided
  if (!baseUrl) {
    if (environment === 'production') {
      baseUrl = 'https://sanduta.art';
    } else if (environment === 'staging') {
      baseUrl = 'https://staging.sanduta.art';
    } else {
      baseUrl = 'http://localhost:3000';
    }
  }

  const smokeTests = new SmokeTests(baseUrl, environment);
  smokeTests.runTests().catch((error) => {
    console.error('Fatal error running smoke tests:', error);
    process.exit(1);
  });
}

module.exports = SmokeTests;
