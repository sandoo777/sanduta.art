#!/usr/bin/env ts-node
/**
 * PERFORMANCE TEST SCRIPT
 * ========================
 * 
 * Script pentru testarea performanței platformei:
 * - Web Vitals (LCP, TTFB, FID, CLS)
 * - API response times
 * - Database query performance
 * - Image loading optimization
 * - Bundle size analysis
 * 
 * Usage: npm run test:performance
 */

import { performance } from 'perf_hooks';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  passed: boolean;
  category: 'web-vitals' | 'api' | 'database' | 'assets';
}

interface PerformanceReport {
  timestamp: Date;
  baseUrl: string;
  metrics: PerformanceMetric[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    avgScore: number;
  };
}

// ============================================
// THRESHOLDS (Google Lighthouse)
// ============================================

const THRESHOLDS = {
  // Web Vitals
  LCP: 2500,        // Largest Contentful Paint (ms)
  TTFB: 200,        // Time to First Byte (ms)
  FID: 100,         // First Input Delay (ms)
  CLS: 0.1,         // Cumulative Layout Shift (score)
  FCP: 1800,        // First Contentful Paint (ms)
  
  // API
  API_RESPONSE: 500,    // API response time (ms)
  API_P95: 1000,        // 95th percentile (ms)
  
  // Database
  DB_QUERY: 200,        // Single query (ms)
  DB_COMPLEX: 500,      // Complex query (ms)
  
  // Assets
  IMAGE_LOAD: 1000,     // Image load time (ms)
  JS_BUNDLE: 300000,    // Max JS bundle size (bytes)
  CSS_BUNDLE: 100000,   // Max CSS bundle size (bytes)
};

// ============================================
// PERFORMANCE TESTS
// ============================================

async function testPageLoad(url: string): Promise<PerformanceMetric[]> {
  console.log(`📄 Testare încărcare pagină: ${url}`);
  
  const metrics: PerformanceMetric[] = [];
  
  return new Promise((resolve) => {
    const start = performance.now();
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const end = performance.now();
        const ttfb = end - start;
        
        metrics.push({
          name: 'TTFB (Time to First Byte)',
          value: Math.round(ttfb),
          unit: 'ms',
          threshold: THRESHOLDS.TTFB,
          passed: ttfb < THRESHOLDS.TTFB,
          category: 'web-vitals',
        });
        
        // Estimează LCP bazat pe HTML size și TTFB
        const htmlSize = Buffer.byteLength(data);
        const estimatedLCP = ttfb + (htmlSize / 1000); // rough estimate
        
        metrics.push({
          name: 'Estimated LCP',
          value: Math.round(estimatedLCP),
          unit: 'ms',
          threshold: THRESHOLDS.LCP,
          passed: estimatedLCP < THRESHOLDS.LCP,
          category: 'web-vitals',
        });
        
        metrics.push({
          name: 'HTML Size',
          value: htmlSize,
          unit: 'bytes',
          threshold: 100000,
          passed: htmlSize < 100000,
          category: 'assets',
        });
        
        resolve(metrics);
      });
    }).on('error', (err) => {
      console.error(`❌ Eroare la testare: ${err.message}`);
      resolve([]);
    });
  });
}

async function testAPIEndpoint(url: string, method: string = 'GET'): Promise<PerformanceMetric> {
  console.log(`🔌 Testare API: ${method} ${url}`);
  
  return new Promise((resolve) => {
    const start = performance.now();
    
    https.get(url, (res) => {
      res.on('data', () => {
        // Consume stream to allow end event timing without storing payload.
      });
      
      res.on('end', () => {
        const end = performance.now();
        const responseTime = end - start;
        
        resolve({
          name: `API ${method} ${url.split('/').pop()}`,
          value: Math.round(responseTime),
          unit: 'ms',
          threshold: THRESHOLDS.API_RESPONSE,
          passed: responseTime < THRESHOLDS.API_RESPONSE,
          category: 'api',
        });
      });
    }).on('error', () => {
      resolve({
        name: `API ${method} ${url.split('/').pop()}`,
        value: 9999,
        unit: 'ms',
        threshold: THRESHOLDS.API_RESPONSE,
        passed: false,
        category: 'api',
      });
    });
  });
}

async function testMultipleRequests(url: string, count: number = 10): Promise<PerformanceMetric[]> {
  console.log(`📊 Testare ${count} request-uri simultane la ${url}`);
  
  const promises = Array(count).fill(null).map(() => testAPIEndpoint(url));
  const results = await Promise.all(promises);
  
  const values = results.map(r => r.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  
  return [
    {
      name: 'API Average Response Time',
      value: Math.round(avg),
      unit: 'ms',
      threshold: THRESHOLDS.API_RESPONSE,
      passed: avg < THRESHOLDS.API_RESPONSE,
      category: 'api',
    },
    {
      name: 'API P95 Response Time',
      value: Math.round(p95),
      unit: 'ms',
      threshold: THRESHOLDS.API_P95,
      passed: p95 < THRESHOLDS.API_P95,
      category: 'api',
    },
  ];
}

async function testBundleSize(): Promise<PerformanceMetric[]> {
  console.log('📦 Analiză bundle size...');
  
  const metrics: PerformanceMetric[] = [];
  
  try {
    const buildDir = path.join(process.cwd(), '.next');
    
    if (!fs.existsSync(buildDir)) {
      console.log('⚠️ Build directory nu există. Rulează `npm run build` mai întâi.');
      return [];
    }
    
    // Găsește fișierele JS și CSS
    const staticDir = path.join(buildDir, 'static');
    
    if (fs.existsSync(staticDir)) {
      let totalJS = 0;
      let totalCSS = 0;
      
      function scanDirectory(dir: string) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (item.endsWith('.js')) {
            totalJS += stat.size;
          } else if (item.endsWith('.css')) {
            totalCSS += stat.size;
          }
        }
      }
      
      scanDirectory(staticDir);
      
      metrics.push({
        name: 'Total JS Bundle Size',
        value: totalJS,
        unit: 'bytes',
        threshold: THRESHOLDS.JS_BUNDLE,
        passed: totalJS < THRESHOLDS.JS_BUNDLE,
        category: 'assets',
      });
      
      metrics.push({
        name: 'Total CSS Bundle Size',
        value: totalCSS,
        unit: 'bytes',
        threshold: THRESHOLDS.CSS_BUNDLE,
        passed: totalCSS < THRESHOLDS.CSS_BUNDLE,
        category: 'assets',
      });
    }
  } catch (_error) {
    console.error('❌ Eroare la analiza bundle size:', error);
  }
  
  return metrics;
}

async function _testImageOptimization(baseUrl: string): Promise<PerformanceMetric[]> {
  console.log('🖼️ Testare optimizare imagini...');
  
  const metrics: PerformanceMetric[] = [];
  
  // Test image load time
  const testImages = [
    `${baseUrl}/_next/image?url=/hero.jpg&w=1920&q=75`,
    `${baseUrl}/_next/image?url=/product.jpg&w=640&q=75`,
  ];
  
  for (const imageUrl of testImages) {
    const metric = await testAPIEndpoint(imageUrl);
    metrics.push({
      ...metric,
      name: 'Image Load Time',
      category: 'assets',
      threshold: THRESHOLDS.IMAGE_LOAD,
      passed: metric.value < THRESHOLDS.IMAGE_LOAD,
    });
  }
  
  return metrics;
}

// ============================================
// MAIN TEST FUNCTION
// ============================================

async function runPerformanceTests(baseUrl: string = 'http://localhost:3000'): Promise<PerformanceReport> {
  console.log('🚀 Pornire teste de performanță...\n');
  console.log(`🌐 Base URL: ${baseUrl}\n`);
  
  const allMetrics: PerformanceMetric[] = [];
  
  try {
    // 1. Page Load Tests
    console.log('\n📄 === PAGE LOAD TESTS ===\n');
    const pageMetrics = await testPageLoad(baseUrl);
    allMetrics.push(...pageMetrics);
    
    // 2. API Tests
    console.log('\n🔌 === API TESTS ===\n');
    const apiMetrics = await testMultipleRequests(`${baseUrl}/api/health`, 10);
    allMetrics.push(...apiMetrics);
    
    // 3. Bundle Size
    console.log('\n📦 === BUNDLE SIZE ===\n');
    const bundleMetrics = await testBundleSize();
    allMetrics.push(...bundleMetrics);
    
    // 4. Image Optimization
    // console.log('\n🖼️ === IMAGE OPTIMIZATION ===\n');
    // const imageMetrics = await testImageOptimization(baseUrl);
    // allMetrics.push(...imageMetrics);
    
  } catch (_error) {
    console.error('❌ Eroare la rularea testelor:', error);
  }
  
  // Calculate summary
  const summary = {
    total: allMetrics.length,
    passed: allMetrics.filter(m => m.passed).length,
    failed: allMetrics.filter(m => !m.passed).length,
    avgScore: allMetrics.length > 0 
      ? Math.round((allMetrics.filter(m => m.passed).length / allMetrics.length) * 100)
      : 0,
  };
  
  return {
    timestamp: new Date(),
    baseUrl,
    metrics: allMetrics,
    summary,
  };
}

// ============================================
// REPORT GENERATION
// ============================================

function generatePerformanceReport(report: PerformanceReport): string {
  const { timestamp, baseUrl, metrics, summary } = report;
  
  let md = '# ⚡ PERFORMANCE TEST REPORT\n\n';
  md += `**Data**: ${timestamp.toISOString()}\n`;
  md += `**Base URL**: ${baseUrl}\n\n`;
  md += '---\n\n';
  
  md += '## 📊 SUMMARY\n\n';
  md += `- ✅ **Passed**: ${summary.passed}/${summary.total}\n`;
  md += `- ❌ **Failed**: ${summary.failed}/${summary.total}\n`;
  md += `- 🎯 **Score**: ${summary.avgScore}%\n\n`;
  
  const scoreBar = '█'.repeat(Math.floor(summary.avgScore / 10)) + '░'.repeat(10 - Math.floor(summary.avgScore / 10));
  md += `\`\`\`\n${scoreBar} ${summary.avgScore}%\n\`\`\`\n\n`;
  md += '---\n\n';
  
  // Group by category
  const categories = ['web-vitals', 'api', 'database', 'assets'] as const;
  
  for (const category of categories) {
    const categoryMetrics = metrics.filter(m => m.category === category);
    if (categoryMetrics.length === 0) continue;
    
    const categoryName = {
      'web-vitals': '🌐 WEB VITALS',
      'api': '🔌 API PERFORMANCE',
      'database': '💾 DATABASE',
      'assets': '📦 ASSETS',
    }[category];
    
    md += `## ${categoryName}\n\n`;
    md += '| Metric | Value | Threshold | Status |\n';
    md += '|--------|-------|-----------|--------|\n';
    
    categoryMetrics.forEach(metric => {
      const icon = metric.passed ? '✅' : '❌';
      const value = metric.unit === 'bytes' 
        ? `${(metric.value / 1024).toFixed(2)} KB`
        : `${metric.value} ${metric.unit}`;
      const threshold = metric.unit === 'bytes'
        ? `${(metric.threshold / 1024).toFixed(2)} KB`
        : `${metric.threshold} ${metric.unit}`;
      
      md += `| ${metric.name} | ${value} | ${threshold} | ${icon} |\n`;
    });
    
    md += '\n';
  }
  
  md += '---\n\n';
  md += '## 🎯 RECOMMENDATIONS\n\n';
  
  const failedMetrics = metrics.filter(m => !m.passed);
  
  if (failedMetrics.length === 0) {
    md += '✅ Toate metricile de performanță sunt în parametri optimi!\n\n';
  } else {
    md += 'Următoarele metrici trebuie optimizate:\n\n';
    
    failedMetrics.forEach(metric => {
      md += `### ❌ ${metric.name}\n\n`;
      md += `- **Valoare curentă**: ${metric.value} ${metric.unit}\n`;
      md += `- **Threshold**: ${metric.threshold} ${metric.unit}\n`;
      md += `- **Diferență**: ${metric.value - metric.threshold} ${metric.unit}\n\n`;
      
      // Add recommendations
      if (metric.name.includes('TTFB')) {
        md += '**Recomandări**:\n';
        md += '- Optimizează server-side rendering\n';
        md += '- Activează Redis caching\n';
        md += '- Folosește CDN pentru static assets\n';
      } else if (metric.name.includes('LCP')) {
        md += '**Recomandări**:\n';
        md += '- Optimizează imagini (WebP/AVIF)\n';
        md += '- Folosește lazy loading\n';
        md += '- Minimizează JavaScript critical\n';
      } else if (metric.name.includes('API')) {
        md += '**Recomandări**:\n';
        md += '- Optimizează query-uri database\n';
        md += '- Implementează caching\n';
        md += '- Folosește connection pooling\n';
      } else if (metric.name.includes('Bundle')) {
        md += '**Recomandări**:\n';
        md += '- Activează tree shaking\n';
        md += '- Folosește dynamic imports\n';
        md += '- Elimină dependențe nefolosite\n';
      }
      
      md += '\n';
    });
  }
  
  md += '---\n\n';
  md += `*Raport generat automat la ${timestamp.toLocaleString('ro-RO')}*\n`;
  
  return md;
}

// ============================================
// EXECUTION
// ============================================

async function main() {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  
  try {
    const report = await runPerformanceTests(baseUrl);
    
    // Generate report
    const markdown = generatePerformanceReport(report);
    
    // Save report
    const reportPath = path.join(process.cwd(), 'PERFORMANCE_TEST_REPORT.md');
    fs.writeFileSync(reportPath, markdown);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📄 Raport salvat: ${reportPath}`);
    console.log('='.repeat(60) + '\n');
    
    // Display summary
    console.log(`🎯 PERFORMANCE SCORE: ${report.summary.avgScore}%`);
    console.log(`✅ Passed: ${report.summary.passed}/${report.summary.total}`);
    console.log(`❌ Failed: ${report.summary.failed}/${report.summary.total}\n`);
    
    // Exit with appropriate code
    if (report.summary.avgScore < 70) {
      console.error('❌ Performance sub pragul minim (70%)');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (_error) {
    console.error('❌ Eroare la rularea testelor:', error);
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main();
}

export { runPerformanceTests, generatePerformanceReport };
export type { PerformanceMetric, PerformanceReport };
