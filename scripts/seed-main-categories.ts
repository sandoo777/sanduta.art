import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Create PostgreSQL connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn'],
});

interface MainCategoryData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  featured: boolean;
}

const mainCategories: MainCategoryData[] = [
  {
    name: 'Cărți de vizită',
    slug: 'carti-de-vizita',
    description: 'Cărți de vizită personalizate pentru profesioniști și afaceri. Standard, premium, texturate, transparente și multe alte opțiuni.',
    icon: '🎴',
    color: '#3B82F6',
    order: 1,
    featured: true
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    description: 'Materiale promoționale pentru campanii și publicitate: flyere, pliante, broșuri, afișe, postere și bannere.',
    icon: '📢',
    color: '#F59E0B',
    order: 2,
    featured: true
  },
  {
    name: 'Materiale de birou',
    slug: 'materiale-de-birou',
    description: 'Papetărie corporativă și materiale administrative: plicuri, hârtie cu antet, mape, blocnotes, calendare.',
    icon: '📁',
    color: '#8B5CF6',
    order: 3,
    featured: false
  },
  {
    name: 'Produse promoționale',
    slug: 'produse-promotionale',
    description: 'Gadget-uri și accesorii personalizabile pentru brand awareness: căni, pixuri, USB-uri, brelocuri, lanyard-uri.',
    icon: '🎁',
    color: '#EC4899',
    order: 4,
    featured: false
  },
  {
    name: 'Foto & Artă',
    slug: 'foto-arta',
    description: 'Produse foto și decorațiuni personalizate: tablouri canvas, foto pe forex, dibond, sticlă acrilică, puzzle personalizate.',
    icon: '🖼️',
    color: '#10B981',
    order: 5,
    featured: false
  },
  {
    name: 'Textile & Merch',
    slug: 'textile-merch',
    description: 'Îmbrăcăminte și textile personalizate: tricouri, hanorace, șepci, genți, perne, prosoape personalizate.',
    icon: '👕',
    color: '#06B6D4',
    order: 6,
    featured: false
  },
  {
    name: 'Packaging',
    slug: 'packaging',
    description: 'Ambalaje personalizate pentru produse și cadouri: cutii carton, pungi hârtie, sacoșe kraft, cutii postale e-commerce.',
    icon: '📦',
    color: '#F97316',
    order: 7,
    featured: false
  },
  {
    name: 'Etichete & Stickere',
    slug: 'etichete-stickere',
    description: 'Etichete adezive și stickere pentru diverse utilizări: stickere pe foi, roll, vinil outdoor, etichete produse.',
    icon: '🏷️',
    color: '#EF4444',
    order: 8,
    featured: true
  }
];

async function seedMainCategories() {
  console.log('🌱 Seeding categorii principale...\n');

  try {
    // Verifică categoriile existente
    const existingCategories = await prisma.category.findMany({
      where: {
        parentId: null // Doar categorii principale (root)
      }
    });

    console.log(`📊 Categorii principale existente: ${existingCategories.length}\n`);

    let created = 0;
    let updated = 0;
    const skipped = 0;

    for (const categoryData of mainCategories) {
      // Verifică dacă categoria există deja (după slug)
      const existing = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });

      if (existing) {
        // Actualizează categoria existentă
        await prisma.category.update({
          where: { id: existing.id },
          data: {
            name: categoryData.name,
            description: categoryData.description,
            icon: categoryData.icon,
            color: categoryData.color,
            order: categoryData.order,
            featured: categoryData.featured,
            active: true,
            parentId: null // Asigură că e categorie root
          }
        });
        console.log(`🔄 Actualizat: ${categoryData.name} (${categoryData.slug})`);
        updated++;
      } else {
        // Creează categoria nouă
        await prisma.category.create({
          data: {
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            icon: categoryData.icon,
            color: categoryData.color,
            order: categoryData.order,
            featured: categoryData.featured,
            active: true,
            parentId: null // Categorie root (fără părinte)
          }
        });
        console.log(`✨ Creat: ${categoryData.name} (${categoryData.slug})`);
        created++;
      }
    }

    console.log('\n📈 Rezumat seeding:');
    console.log(`   ✨ Create: ${created}`);
    console.log(`   🔄 Actualizate: ${updated}`);
    console.log(`   ⏭️  Sărite: ${skipped}`);

    // Afișează categoriile finale
    console.log('\n📋 Categorii principale în baza de date:\n');
    const allCategories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' }
    });

    for (const cat of allCategories) {
      const status = cat.active ? '✅' : '❌';
      const featured = cat.featured ? '⭐' : '  ';
      console.log(`   ${featured} ${status} ${cat.order}. ${cat.icon} ${cat.name}`);
      console.log(`      Slug: ${cat.slug}`);
      console.log(`      ${cat.description?.substring(0, 80)}...`);
      console.log('');
    }

    console.log('✅ Seeding completat cu succes!\n');

  } catch (error) {
    console.error('❌ Eroare la seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Rulează seeding-ul
seedMainCategories().catch((error) => {
  console.error('❌ Seeding eșuat:', error);
  process.exit(1);
});
