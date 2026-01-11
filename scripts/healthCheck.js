#!/usr/bin/env node
// Health check script
// scripts/healthCheck.js

const https = require('https');
const http = require('http');

async function request(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(url, {
      method: 'GET',
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function healthCheck(baseUrl) {
  console.log(`Checking health of: ${baseUrl}`);

  const checks = [
    { name: 'Homepage', url: `${baseUrl}/` },
    { name: 'API Health', url: `${baseUrl}/api/health` },
  ];

  let allHealthy = true;

  for (const check of checks) {
    try {
      const response = await request(check.url);
      
      if (response.status === 200) {
        console.log(`✅ ${check.name}: OK`);
      } else {
        console.error(`❌ ${check.name}: Status ${response.status}`);
        allHealthy = false;
      }
    } catch (error) {
      console.error(`❌ ${check.name}: ${error.message}`);
      allHealthy = false;
    }
  }

  if (!allHealthy) {
    console.error('\n❌ Health check failed');
    process.exit(1);
  }

  console.log('\n✅ All health checks passed');
}

// Parse command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  let baseUrl = process.env.BASE_URL;
  let environment = process.env.ENVIRONMENT || 'staging';

  args.forEach((arg, index) => {
    if (arg === '--environment' || arg === '-e') {
      environment = args[index + 1];
    }
    if (arg === '--url' || arg === '-u') {
      baseUrl = args[index + 1];
    }
  });

  if (!baseUrl) {
    if (environment === 'production') {
      baseUrl = 'https://sanduta.art';
    } else if (environment === 'staging') {
      baseUrl = 'https://staging.sanduta.art';
    } else {
      baseUrl = 'http://localhost:3000';
    }
  }

  healthCheck(baseUrl).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = healthCheck;
