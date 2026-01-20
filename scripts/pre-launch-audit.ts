#!/usr/bin/env ts-node
/**
 * PRE-LAUNCH AUDIT SCRIPT
 * ========================
 * 
 * Script complet pentru verificarea platformei înainte de lansare.
 * Execută toate testele de performanță, securitate, UX și validare date.
 * 
 * Usage: npm run pre-launch:audit
 */

import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

interface AuditResult {
  name: string;
  category: 'performance' | 'security' | 'ux' | 'seo' | 'data' | 'workflow';
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: unknown;
  timestamp: Date;
}

interface AuditReport {
  timestamp: Date;
  duration: number;
  results: AuditResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
    criticalIssues: string[];
  };
  readiness: {
    score: number;
    level: 'NOT_READY' | 'NEEDS_WORK' | 'READY' | 'PRODUCTION_READY';
    recommendation: string;
  };
}

// ============================================
// AUDIT CHECKS
// ============================================

const auditChecks = {
  // PERFORMANȚĂ
  async checkNextConfig(): Promise<AuditResult> {
    try {
      const configPath = path.join(process.cwd(), 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      const checks = {
        images: content.includes('formats:'),
        security: content.includes('X-Content-Type-Options'),
        compiler: content.includes('removeConsole'),
        experimental: content.includes('optimizePackageImports'),
      };
      
      const allPassed = Object.values(checks).every(v => v);
      
      return {
        name: 'Next.js Configuration',
        category: 'performance',
        status: allPassed ? 'pass' : 'warning',
        message: allPassed 
          ? 'Next.js config optimizat corect'
          : 'Configurația Next.js are lipsuri',
        details: checks,
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Next.js Configuration',
        category: 'performance',
        status: 'fail',
        message: `Eroare verificare config: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkImageOptimization(): Promise<AuditResult> {
    try {
      const componentsDir = path.join(process.cwd(), 'src/components');
      const imageImports = await findInDirectory(componentsDir, /from ['"]next\/image['"]/g);
      
      return {
        name: 'Image Optimization',
        category: 'performance',
        status: imageImports.length > 10 ? 'pass' : 'warning',
        message: `Găsite ${imageImports.length} componente cu next/image`,
        details: { count: imageImports.length },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Image Optimization',
        category: 'performance',
        status: 'fail',
        message: `Eroare verificare imagini: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkISRRevalidation(): Promise<AuditResult> {
    try {
      const pagesDir = path.join(process.cwd(), 'src/app');
      const revalidateDeclarations = await findInDirectory(pagesDir, /export const revalidate = \d+/g);
      
      return {
        name: 'ISR Revalidation',
        category: 'performance',
        status: revalidateDeclarations.length > 3 ? 'pass' : 'warning',
        message: `Găsite ${revalidateDeclarations.length} pagini cu ISR`,
        details: { count: revalidateDeclarations.length },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'ISR Revalidation',
        category: 'performance',
        status: 'warning',
        message: 'Nu s-au putut verifica declarațiile ISR',
        timestamp: new Date(),
      };
    }
  },

  async checkDatabaseIndexes(): Promise<AuditResult> {
    try {
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      const content = fs.readFileSync(schemaPath, 'utf-8');
      
      const indexCount = (content.match(/@@index/g) || []).length;
      const uniqueCount = (content.match(/@@unique/g) || []).length;
      
      return {
        name: 'Database Indexes',
        category: 'performance',
        status: indexCount >= 15 ? 'pass' : 'warning',
        message: `Găsite ${indexCount} indexuri și ${uniqueCount} unique constraints`,
        details: { indexes: indexCount, unique: uniqueCount },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Database Indexes',
        category: 'performance',
        status: 'fail',
        message: `Eroare verificare DB indexes: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  // SECURITATE
  async checkMiddlewareProtection(): Promise<AuditResult> {
    try {
      const middlewarePath = path.join(process.cwd(), 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      
      const checks = {
        adminProtection: content.includes('startsWith("/admin")'),
        tokenValidation: content.includes('getToken'),
        roleChecking: content.includes('token.role'),
        redirects: content.includes('NextResponse.redirect'),
      };
      
      const allPassed = Object.values(checks).every(v => v);
      
      return {
        name: 'Middleware Protection',
        category: 'security',
        status: allPassed ? 'pass' : 'fail',
        message: allPassed 
          ? 'Middleware protejează corect rutele'
          : 'Middleware are lipsuri de securitate',
        details: checks,
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Middleware Protection',
        category: 'security',
        status: 'fail',
        message: `Eroare verificare middleware: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkSecurityHeaders(): Promise<AuditResult> {
    try {
      const configPath = path.join(process.cwd(), 'next.config.ts');
      const content = fs.readFileSync(configPath, 'utf-8');
      
      const headers = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
      ];
      
      const found = headers.filter(h => content.includes(h));
      
      return {
        name: 'Security Headers',
        category: 'security',
        status: found.length === headers.length ? 'pass' : 'warning',
        message: `${found.length}/${headers.length} security headers configurate`,
        details: { found, missing: headers.filter(h => !found.includes(h)) },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Security Headers',
        category: 'security',
        status: 'fail',
        message: `Eroare verificare security headers: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkAuthImplementation(): Promise<AuditResult> {
    try {
      const authDir = path.join(process.cwd(), 'src/modules/auth');
      
      if (!fs.existsSync(authDir)) {
        return {
          name: 'Auth Implementation',
          category: 'security',
          status: 'fail',
          message: 'Directorul auth nu există',
          timestamp: new Date(),
        };
      }
      
      const files = fs.readdirSync(authDir);
      const hasNextAuth = files.some(f => f.includes('nextauth'));
      
      return {
        name: 'Auth Implementation',
        category: 'security',
        status: hasNextAuth ? 'pass' : 'fail',
        message: hasNextAuth 
          ? 'NextAuth implementat corect'
          : 'NextAuth lipsește',
        details: { files },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Auth Implementation',
        category: 'security',
        status: 'fail',
        message: `Eroare verificare auth: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  // UX/UI
  async checkUIComponents(): Promise<AuditResult> {
    try {
      const uiDir = path.join(process.cwd(), 'src/components/ui');
      
      if (!fs.existsSync(uiDir)) {
        return {
          name: 'UI Components',
          category: 'ux',
          status: 'warning',
          message: 'Directorul UI components nu există',
          timestamp: new Date(),
        };
      }
      
      const files = fs.readdirSync(uiDir);
      const essentialComponents = ['Button', 'Input', 'Card', 'Badge', 'Select'];
      const found = essentialComponents.filter(comp => 
        files.some(f => f.toLowerCase().includes(comp.toLowerCase()))
      );
      
      return {
        name: 'UI Components',
        category: 'ux',
        status: found.length >= 4 ? 'pass' : 'warning',
        message: `${found.length}/${essentialComponents.length} componente esențiale găsite`,
        details: { found, total: files.length },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'UI Components',
        category: 'ux',
        status: 'fail',
        message: `Eroare verificare UI components: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkResponsiveDesign(): Promise<AuditResult> {
    try {
      const tailwindPath = path.join(process.cwd(), 'tailwind.config.ts');
      
      if (!fs.existsSync(tailwindPath)) {
        return {
          name: 'Responsive Design',
          category: 'ux',
          status: 'warning',
          message: 'Tailwind config nu există',
          timestamp: new Date(),
        };
      }
      
      const content = fs.readFileSync(tailwindPath, 'utf-8');
      const hasScreens = content.includes('screens') || content.includes('breakpoints');
      
      return {
        name: 'Responsive Design',
        category: 'ux',
        status: hasScreens ? 'pass' : 'warning',
        message: hasScreens 
          ? 'Tailwind configurat pentru responsive'
          : 'Lipsesc breakpoints custom',
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Responsive Design',
        category: 'ux',
        status: 'warning',
        message: 'Nu s-a putut verifica responsive design',
        timestamp: new Date(),
      };
    }
  },

  // SEO
  async checkMetadataAPI(): Promise<AuditResult> {
    try {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
      
      if (!fs.existsSync(layoutPath)) {
        return {
          name: 'Metadata API',
          category: 'seo',
          status: 'fail',
          message: 'Layout principal nu există',
          timestamp: new Date(),
        };
      }
      
      const content = fs.readFileSync(layoutPath, 'utf-8');
      const hasMetadata = content.includes('export const metadata') || content.includes('generateMetadata');
      
      return {
        name: 'Metadata API',
        category: 'seo',
        status: hasMetadata ? 'pass' : 'warning',
        message: hasMetadata 
          ? 'Metadata API utilizat'
          : 'Lipsește export metadata',
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Metadata API',
        category: 'seo',
        status: 'fail',
        message: `Eroare verificare metadata: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkSitemap(): Promise<AuditResult> {
    try {
      const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
      
      return {
        name: 'Sitemap',
        category: 'seo',
        status: fs.existsSync(sitemapPath) ? 'pass' : 'warning',
        message: fs.existsSync(sitemapPath) 
          ? 'Sitemap definit'
          : 'Lipsește sitemap.ts',
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Sitemap',
        category: 'seo',
        status: 'warning',
        message: 'Nu s-a putut verifica sitemap',
        timestamp: new Date(),
      };
    }
  },

  async checkRobotsTxt(): Promise<AuditResult> {
    try {
      const robotsPath = path.join(process.cwd(), 'src/app/robots.ts');
      const publicRobotsPath = path.join(process.cwd(), 'public/robots.txt');
      
      const exists = fs.existsSync(robotsPath) || fs.existsSync(publicRobotsPath);
      
      return {
        name: 'Robots.txt',
        category: 'seo',
        status: exists ? 'pass' : 'warning',
        message: exists 
          ? 'Robots.txt definit'
          : 'Lipsește robots.txt',
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Robots.txt',
        category: 'seo',
        status: 'warning',
        message: 'Nu s-a putut verifica robots.txt',
        timestamp: new Date(),
      };
    }
  },

  // DATA VALIDATION
  async checkPrismaSchema(): Promise<AuditResult> {
    try {
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
      const content = fs.readFileSync(schemaPath, 'utf-8');
      
      const models = (content.match(/model \w+ {/g) || []).length;
      const enums = (content.match(/enum \w+ {/g) || []).length;
      
      return {
        name: 'Prisma Schema',
        category: 'data',
        status: models >= 15 ? 'pass' : 'warning',
        message: `Schema cu ${models} modele și ${enums} enums`,
        details: { models, enums },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Prisma Schema',
        category: 'data',
        status: 'fail',
        message: `Eroare verificare schema: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkValidationLibrary(): Promise<AuditResult> {
    try {
      const validationPath = path.join(process.cwd(), 'src/lib/validation.ts');
      
      if (!fs.existsSync(validationPath)) {
        return {
          name: 'Validation Library',
          category: 'data',
          status: 'warning',
          message: 'Biblioteca de validare nu există',
          timestamp: new Date(),
        };
      }
      
      const content = fs.readFileSync(validationPath, 'utf-8');
      const functions = (content.match(/export (function|const) validate\w+/g) || []).length;
      
      return {
        name: 'Validation Library',
        category: 'data',
        status: functions >= 3 ? 'pass' : 'warning',
        message: `${functions} funcții de validare găsite`,
        details: { functions },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Validation Library',
        category: 'data',
        status: 'fail',
        message: `Eroare verificare validare: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  // WORKFLOW
  async checkAPIRoutes(): Promise<AuditResult> {
    try {
      const apiDir = path.join(process.cwd(), 'src/app/api');
      
      if (!fs.existsSync(apiDir)) {
        return {
          name: 'API Routes',
          category: 'workflow',
          status: 'fail',
          message: 'Directorul API nu există',
          timestamp: new Date(),
        };
      }
      
      const routeCount = await countFilesRecursive(apiDir, /route\.ts$/);
      
      return {
        name: 'API Routes',
        category: 'workflow',
        status: routeCount >= 10 ? 'pass' : 'warning',
        message: `${routeCount} API routes implementate`,
        details: { count: routeCount },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'API Routes',
        category: 'workflow',
        status: 'fail',
        message: `Eroare verificare API routes: ${error}`,
        timestamp: new Date(),
      };
    }
  },

  async checkTestCoverage(): Promise<AuditResult> {
    try {
      const testsDir = path.join(process.cwd(), 'src/__tests__');
      
      if (!fs.existsSync(testsDir)) {
        return {
          name: 'Test Coverage',
          category: 'workflow',
          status: 'warning',
          message: 'Directorul de teste nu există',
          timestamp: new Date(),
        };
      }
      
      const testFiles = await countFilesRecursive(testsDir, /\.test\.ts$/);
      
      return {
        name: 'Test Coverage',
        category: 'workflow',
        status: testFiles >= 5 ? 'pass' : 'warning',
        message: `${testFiles} fișiere de test găsite`,
        details: { files: testFiles },
        timestamp: new Date(),
      };
    } catch (_error) {
      return {
        name: 'Test Coverage',
        category: 'workflow',
        status: 'warning',
        message: 'Nu s-a putut verifica test coverage',
        timestamp: new Date(),
      };
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function findInDirectory(dir: string, pattern: RegExp): Promise<string[]> {
  const results: string[] = [];
  
  function searchRecursive(currentDir: string) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          searchRecursive(fullPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const matches = content.match(pattern);
          if (matches) {
            results.push(...matches);
          }
        }
      }
    } catch (_error) {
      // Skip inaccessible directories
    }
  }
  
  searchRecursive(dir);
  return results;
}

async function countFilesRecursive(dir: string, pattern: RegExp): Promise<number> {
  let count = 0;
  
  function countRecursive(currentDir: string) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          countRecursive(fullPath);
        } else if (stat.isFile() && pattern.test(item)) {
          count++;
        }
      }
    } catch (_error) {
      // Skip inaccessible directories
    }
  }
  
  countRecursive(dir);
  return count;
}

// ============================================
// MAIN AUDIT FUNCTION
// ============================================

async function runAudit(): Promise<AuditReport> {
  console.log('🚀 Pornire audit pre-lansare...\n');
  
  const startTime = performance.now();
  const results: AuditResult[] = [];
  
  // Rulează toate verificările
  const checks = Object.entries(auditChecks);
  
  for (const [name, checkFn] of checks) {
    console.log(`⏳ Verificare: ${name}...`);
    const result = await checkFn();
    results.push(result);
    
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}\n`);
  }
  
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  
  // Calculează sumarul
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    warnings: results.filter(r => r.status === 'warning').length,
    failed: results.filter(r => r.status === 'fail').length,
    criticalIssues: results
      .filter(r => r.status === 'fail' && ['security', 'data'].includes(r.category))
      .map(r => r.name),
  };
  
  // Calculează readiness score
  const score = Math.round(
    (summary.passed / summary.total) * 100 - 
    (summary.warnings * 5) - 
    (summary.failed * 10)
  );
  
  const readiness = {
    score: Math.max(0, score),
    level: score >= 90 ? 'PRODUCTION_READY' as const :
           score >= 75 ? 'READY' as const :
           score >= 50 ? 'NEEDS_WORK' as const :
           'NOT_READY' as const,
    recommendation: score >= 90 ? 'Platforma este gata de lansare!' :
                    score >= 75 ? 'Câteva optimizări minore și poți lansa.' :
                    score >= 50 ? 'Rezolvă warning-urile și încearcă din nou.' :
                    'Sunt probleme critice care trebuie rezolvate.',
  };
  
  return {
    timestamp: new Date(),
    duration,
    results,
    summary,
    readiness,
  };
}

// ============================================
// REPORT GENERATION
// ============================================

function generateMarkdownReport(report: AuditReport): string {
  const { timestamp, duration, results, summary, readiness } = report;
  
  let md = '# 🚀 PRE-LAUNCH AUDIT REPORT\n\n';
  md += `**Data**: ${timestamp.toISOString()}\n`;
  md += `**Durată**: ${duration}ms\n\n`;
  md += '---\n\n';
  
  md += '## 📊 READINESS SCORE\n\n';
  md += `**Score**: ${readiness.score}/100\n`;
  md += `**Level**: ${readiness.level}\n`;
  md += `**Recomandare**: ${readiness.recommendation}\n\n`;
  
  const scoreBar = '█'.repeat(Math.floor(readiness.score / 10)) + '░'.repeat(10 - Math.floor(readiness.score / 10));
  md += `\`\`\`\n${scoreBar} ${readiness.score}%\n\`\`\`\n\n`;
  md += '---\n\n';
  
  md += '## 📈 SUMMARY\n\n';
  md += `- ✅ **Passed**: ${summary.passed}\n`;
  md += `- ⚠️ **Warnings**: ${summary.warnings}\n`;
  md += `- ❌ **Failed**: ${summary.failed}\n`;
  md += `- 🎯 **Total**: ${summary.total}\n\n`;
  
  if (summary.criticalIssues.length > 0) {
    md += '### 🚨 CRITICAL ISSUES\n\n';
    summary.criticalIssues.forEach(issue => {
      md += `- ${issue}\n`;
    });
    md += '\n';
  }
  
  md += '---\n\n';
  
  // Rezultate pe categorii
  const categories = ['performance', 'security', 'ux', 'seo', 'data', 'workflow'] as const;
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    if (categoryResults.length === 0) continue;
    
    const categoryName = {
      performance: '⚡ PERFORMANȚĂ',
      security: '🔒 SECURITATE',
      ux: '🎨 UX/UI',
      seo: '🔍 SEO',
      data: '📊 DATA VALIDATION',
      workflow: '⚙️ WORKFLOW',
    }[category];
    
    md += `## ${categoryName}\n\n`;
    
    categoryResults.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      md += `### ${icon} ${result.name}\n\n`;
      md += `**Status**: ${result.status.toUpperCase()}\n`;
      md += `**Message**: ${result.message}\n`;
      
      if (result.details) {
        md += `**Details**:\n\`\`\`json\n${JSON.stringify(result.details, null, 2)}\n\`\`\`\n`;
      }
      
      md += '\n';
    });
    
    md += '---\n\n';
  }
  
  md += '## 🎯 NEXT STEPS\n\n';
  
  if (readiness.level === 'PRODUCTION_READY') {
    md += '✅ Toate verificările au trecut! Platforma este gata de lansare.\n\n';
    md += '### Checklist final:\n';
    md += '- [ ] Configurează variabilele de environment în producție\n';
    md += '- [ ] Verifică backup-urile automate\n';
    md += '- [ ] Testează procesul de deployment\n';
    md += '- [ ] Activează monitorizarea 24/7\n';
    md += '- [ ] Pregătește echipa de suport\n';
    md += '- [ ] Planifică comunicarea de lansare\n';
  } else if (readiness.level === 'READY') {
    md += '⚠️ Platforma este aproape gata, dar mai sunt câteva îmbunătățiri:\n\n';
    const warnings = results.filter(r => r.status === 'warning');
    warnings.forEach(w => {
      md += `- **${w.name}**: ${w.message}\n`;
    });
  } else {
    md += '❌ Sunt probleme care trebuie rezolvate înainte de lansare:\n\n';
    const failures = results.filter(r => r.status === 'fail');
    failures.forEach(f => {
      md += `- **${f.name}**: ${f.message}\n`;
    });
  }
  
  md += '\n---\n\n';
  md += `*Raport generat automat la ${timestamp.toLocaleString('ro-RO')}*\n`;
  
  return md;
}

// ============================================
// EXECUTION
// ============================================

async function main() {
  try {
    const report = await runAudit();
    
    // Generează raport Markdown
    const markdown = generateMarkdownReport(report);
    
    // Salvează raportul
    const reportPath = path.join(process.cwd(), 'PRE_LAUNCH_AUDIT_REPORT.md');
    fs.writeFileSync(reportPath, markdown);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📄 Raport salvat: ${reportPath}`);
    console.log('='.repeat(60) + '\n');
    
    // Afișează rezultatul final
    console.log(`🎯 READINESS: ${report.readiness.level} (${report.readiness.score}/100)`);
    console.log(`💡 ${report.readiness.recommendation}\n`);
    
    // Exit cu cod corespunzător
    if (report.readiness.level === 'NOT_READY' || report.summary.failed > 0) {
      process.exit(1);
    }
    
    process.exit(0);
  } catch (_error) {
    console.error('❌ Eroare la rularea auditului:', error);
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main();
}

export { runAudit, generateMarkdownReport };
export type { AuditResult, AuditReport };
