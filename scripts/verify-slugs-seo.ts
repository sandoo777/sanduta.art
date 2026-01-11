#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface SlugIssue {
  type: 'duplicate' | 'invalid' | 'missing-hyphen' | 'special-chars';
  category: string;
  slug: string;
  parentSlug?: string;
  suggestion?: string;
}

async function verifySlugsSEO() {
  console.log('🔍 Verificare Slug-uri SEO pentru Categorii\n');
  console.log('='.repeat(60));

  const issues: SlugIssue[] = [];
  const slugCounts = new Map<string, number>();

  try {
    // Fetch all categories
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: { name: true, slug: true }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { order: 'asc' }
      ]
    });

    console.log(`\n📊 Total categorii: ${categories.length}\n`);

    // Check for duplicates
    for (const cat of categories) {
      const count = slugCounts.get(cat.slug) || 0;
      slugCounts.set(cat.slug, count + 1);
    }

    // Report findings
    console.log('1️⃣  CATEGORII PRINCIPALE (Parent Categories)\n');
    const mainCategories = categories.filter(c => !c.parentId);
    
    for (const cat of mainCategories) {
      const isDuplicate = (slugCounts.get(cat.slug) || 0) > 1;
      const hasHyphen = cat.slug.includes('-');
      const hasSpecialChars = /[^a-z0-9-]/.test(cat.slug);
      
      let status = '✅';
      if (isDuplicate) {
        status = '❌ DUPLICATE';
        issues.push({
          type: 'duplicate',
          category: cat.name,
          slug: cat.slug
        });
      } else if (hasSpecialChars) {
        status = '⚠️  SPECIAL CHARS';
        issues.push({
          type: 'special-chars',
          category: cat.name,
          slug: cat.slug
        });
      } else if (!hasHyphen && cat.slug.length > 10) {
        status = '⚠️  NO HYPHEN';
        issues.push({
          type: 'missing-hyphen',
          category: cat.name,
          slug: cat.slug,
          suggestion: cat.slug.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
        });
      }
      
      console.log(`   ${status} ${cat.icon || ''} ${cat.name}`);
      console.log(`      Slug: ${cat.slug}`);
      console.log(`      URL:  /produse/${cat.slug}`);
      console.log('');
    }

    console.log('\n2️⃣  SUBCATEGORII (Child Categories)\n');
    const subCategories = categories.filter(c => c.parentId);
    
    for (const cat of subCategories) {
      const isDuplicate = (slugCounts.get(cat.slug) || 0) > 1;
      const hasHyphen = cat.slug.includes('-');
      const hasSpecialChars = /[^a-z0-9-]/.test(cat.slug);
      
      let status = '✅';
      if (isDuplicate) {
        status = '❌ DUPLICATE';
        issues.push({
          type: 'duplicate',
          category: cat.name,
          slug: cat.slug,
          parentSlug: cat.parent?.slug
        });
      } else if (hasSpecialChars) {
        status = '⚠️  SPECIAL CHARS';
        issues.push({
          type: 'special-chars',
          category: cat.name,
          slug: cat.slug,
          parentSlug: cat.parent?.slug
        });
      }
      
      if (subCategories.indexOf(cat) % 10 === 0) {
        console.log(`   ${cat.parent?.name || 'Unknown'} →`);
      }
      
      console.log(`      ${status} ${cat.name}`);
      console.log(`         Slug: ${cat.slug}`);
      if (cat.parent) {
        console.log(`         URL:  /produse/${cat.parent.slug}/${cat.slug}`);
      }
      
      if ((subCategories.indexOf(cat) + 1) % 10 === 0) {
        console.log('');
      }
    }

    // Summary of issues
    console.log('\n' + '='.repeat(60));
    console.log('📋 REZUMAT PROBLEME\n');

    if (issues.length === 0) {
      console.log('   ✅ Nicio problemă găsită! Toate slug-urile sunt SEO-friendly.\n');
    } else {
      const duplicates = issues.filter(i => i.type === 'duplicate');
      const specialChars = issues.filter(i => i.type === 'special-chars');
      const missingHyphens = issues.filter(i => i.type === 'missing-hyphen');

      if (duplicates.length > 0) {
        console.log(`   ❌ Slug-uri duplicate: ${duplicates.length}`);
        duplicates.forEach(issue => {
          console.log(`      - ${issue.category}: "${issue.slug}"`);
        });
        console.log('');
      }

      if (specialChars.length > 0) {
        console.log(`   ⚠️  Caractere speciale: ${specialChars.length}`);
        specialChars.forEach(issue => {
          console.log(`      - ${issue.category}: "${issue.slug}"`);
        });
        console.log('');
      }

      if (missingHyphens.length > 0) {
        console.log(`   ⚠️  Lipsă cratimă (recomandat): ${missingHyphens.length}`);
        missingHyphens.forEach(issue => {
          console.log(`      - ${issue.category}: "${issue.slug}"`);
          if (issue.suggestion) {
            console.log(`        Sugestie: "${issue.suggestion}"`);
          }
        });
        console.log('');
      }
    }

    // SEO Best Practices Check
    console.log('='.repeat(60));
    console.log('✨ SEO BEST PRACTICES CHECK\n');

    const seoChecks = [
      {
        name: 'Slug format (lowercase + hyphens)',
        passed: categories.every(c => c.slug === c.slug.toLowerCase() && !c.slug.includes('_')),
      },
      {
        name: 'No duplicate slugs',
        passed: Array.from(slugCounts.values()).every(count => count === 1),
      },
      {
        name: 'No special characters',
        passed: categories.every(c => /^[a-z0-9-]+$/.test(c.slug)),
      },
      {
        name: 'Slugs not too long (< 50 chars)',
        passed: categories.every(c => c.slug.length < 50),
      },
      {
        name: 'All categories have slugs',
        passed: categories.every(c => c.slug && c.slug.length > 0),
      },
    ];

    seoChecks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      console.log(`   ${icon} ${check.name}`);
    });

    // URL Examples
    console.log('\n' + '='.repeat(60));
    console.log('🔗 EXEMPLE URL-uri SEO-Friendly\n');

    const exampleMain = mainCategories[0];
    const exampleSub = subCategories.find(c => c.parentId === exampleMain?.id);

    if (exampleMain) {
      console.log('   Categorie principală:');
      console.log(`   → /produse/${exampleMain.slug}`);
      console.log(`   → /categorii/${exampleMain.slug} (alias)`);
      console.log('');
    }

    if (exampleSub && exampleMain) {
      console.log('   Subcategorie:');
      console.log(`   → /produse/${exampleMain.slug}/${exampleSub.slug}`);
      console.log(`   → /categorii/${exampleSub.slug} (direct)`);
      console.log('');
    }

    // Generate SEO recommendations
    console.log('='.repeat(60));
    console.log('💡 RECOMANDĂRI\n');

    if (issues.length === 0) {
      console.log('   ✅ Slug-urile sunt deja SEO-friendly!');
      console.log('   ✅ Gata pentru implementare URL routing în Next.js');
      console.log('');
    } else {
      console.log('   📝 Acțiuni necesare:');
      if (duplicates.length > 0) {
        console.log('   1. Renumește slug-urile duplicate (adaugă suffix sau prefix)');
      }
      if (specialChars.length > 0) {
        console.log('   2. Înlocuiește caracterele speciale cu "-"');
      }
      if (missingHyphens.length > 0) {
        console.log('   3. Adaugă cratime pentru lizibilitate (opțional, dar recomandat)');
      }
      console.log('');
    }

    console.log('   📚 Next Steps:');
    console.log('   1. Creează route-uri dinamice: /produse/[slug]/page.tsx');
    console.log('   2. Creează route nested: /produse/[parent]/[child]/page.tsx');
    console.log('   3. Implementează redirects pentru backwards compatibility');
    console.log('   4. Adaugă sitemap.xml cu toate URL-urile');
    console.log('   5. Implementează breadcrumbs cu schema.org markup');
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ Verificare completă!\n');

    return { categories, issues, slugCounts };

  } catch (error) {
    console.error('❌ Eroare la verificare:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifySlugsSEO().catch(console.error);
