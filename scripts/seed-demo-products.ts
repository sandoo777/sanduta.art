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

interface DemoProduct {
  name: string;
  slug: string;
  sku: string;
  description: string;
  descriptionShort: string;
  type: 'STANDARD' | 'CONFIGURABLE' | 'CUSTOM';
  price: number;
  categorySlug: string;
  active: boolean;
  images: string[];
}

const demoProducts: DemoProduct[] = [
  // Cărți de vizită - Standard
  {
    name: 'Cărți de vizită standard 85×55mm',
    slug: 'carti-vizita-standard-85x55',
    sku: 'CV-STD-001',
    description: 'Cărți de vizită clasice în format standard 85×55mm. Carton de calitate 300gsm, disponibile cu finisaj mat sau lucios. Perfecte pentru profesioniști care doresc o prezentare impecabilă. Include opțiuni de personalizare completă: logo, text, culori corporate. Tipar offset de înaltă calitate, culori vibrante și detalii clare.',
    descriptionShort: 'Cărți de vizită clasice 85×55mm, carton 300gsm, finisaj mat/lucios',
    type: 'CONFIGURABLE',
    price: 45.00,
    categorySlug: 'carti-vizita-standard',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'
    ]
  },
  
  // Cărți de vizită - Premium
  {
    name: 'Cărți de vizită premium cu spot UV',
    slug: 'carti-vizita-premium-spot-uv',
    sku: 'CV-PREM-002',
    description: 'Cărți de vizită premium cu finisaj spot UV selectiv. Carton 400gsm soft-touch pentru o experiență tactilă premium. Spot UV aplicat pe logo și elemente importante pentru un efect 3D spectaculos. Impresie de lux garantată, perfecte pentru networking de nivel înalt. Ideal pentru manageri, CEO, consultanți și antreprenori de succes.',
    descriptionShort: 'Premium 400gsm soft-touch cu spot UV selectiv, efect 3D',
    type: 'CONFIGURABLE',
    price: 120.00,
    categorySlug: 'carti-vizita-premium',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1561070791-36c11767b26a?w=800'
    ]
  },
  
  // Marketing - Flyere
  {
    name: 'Flyere A5 300 buc',
    slug: 'flyere-a5-300buc',
    sku: 'FLY-A5-001',
    description: 'Flyere format A5 (148×210mm) pentru campanii promoționale. Hârtie cretată 170gsm cu finisaj lucios pentru culori vibrante. Ideal pentru evenimente, promoții magazin, anunțuri speciale. Tiraj minim 300 bucăți cu preț avantajos. Personalizare completă față-verso, design grafic inclus opțional. Livrare rapidă în 3-5 zile lucrătoare.',
    descriptionShort: 'Flyere A5, 170gsm lucios, tiraj 300 buc, livrare rapidă',
    type: 'CONFIGURABLE',
    price: 85.00,
    categorySlug: 'flyere',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=800'
    ]
  },
  
  // Marketing - Roll-up
  {
    name: 'Roll-up banner 85×200cm Premium',
    slug: 'rollup-banner-85x200-premium',
    sku: 'RUP-85-001',
    description: 'Roll-up banner profesional 85×200cm cu structură metalică premium. Banner PVC 440gsm rezistent, imprimare eco-solvent de înaltă calitate. Include husă de transport, setup în 30 secunde. Perfect pentru târguri, expoziții, evenimente corporate, showroom-uri. Structură stabilă și durabilă, reutilizabilă. Design grafic și mockup incluse în preț.',
    descriptionShort: 'Roll-up 85×200cm, structură premium, husă transport inclusă',
    type: 'STANDARD',
    price: 180.00,
    categorySlug: 'rollup',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'
    ]
  },
  
  // Materiale birou - Foi antet
  {
    name: 'Foi cu antet personalizate A4',
    slug: 'foi-antet-personalizate-a4',
    sku: 'FA-A4-001',
    description: 'Foi cu antet personalizate format A4, hârtie premium 100gsm. Design profesional cu logo, date de contact și grafică corporativă. Potrivite pentru scrisori oficiale, oferte, contracte. Tiraj minim 250 foi. Include consultanță design și 2 variante de concept. Perfect pentru companii care doresc o imagine profesională în corespondență.',
    descriptionShort: 'Foi antet A4, 100gsm premium, design profesional inclus',
    type: 'CONFIGURABLE',
    price: 95.00,
    categorySlug: 'foi-cu-antet',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800'
    ]
  },
  
  // Produse promoționale - Căni
  {
    name: 'Căni ceramice personalizate 350ml',
    slug: 'cani-ceramice-personalizate-350ml',
    sku: 'CAN-CER-001',
    description: 'Căni ceramice albe 350ml cu imprimare sublimation full-color. Calitate premium, rezistente la spălare în mașină și microunde. Design personalizat complet: logo, text, poze. Perfecte pentru cadouri corporate, evenimente, merchandising. Culori vii și durabile, finisaj lucios. Tiraj minim 24 bucăți, ambalare individuală în cutie carton.',
    descriptionShort: 'Căni ceramice 350ml, sublimation full-color, rezistente spălare',
    type: 'CONFIGURABLE',
    price: 18.50,
    categorySlug: 'cani-personalizate',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800'
    ]
  },
  
  // Foto & Artă - Canvas
  {
    name: 'Tablou canvas personalizat 60×40cm',
    slug: 'tablou-canvas-personalizat-60x40',
    sku: 'CAN-60-001',
    description: 'Tablou canvas premium 60×40cm pe bastidor lemn 2cm. Pânză canvas 380gsm de calitate superioară, imprimare latex cu culori vibrante. Include sistem de prindere pe perete. Perfect pentru decorațiuni interioare, cadouri personalizate, fotografii de familie. Rezistent în timp, culori care nu se estompează. Finisare profesională, gata de atârnat.',
    descriptionShort: 'Canvas 60×40cm pe bastidor, 380gsm premium, gata de atârnat',
    type: 'CONFIGURABLE',
    price: 145.00,
    categorySlug: 'canvas',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'
    ]
  },
  
  // Textile - Tricouri
  {
    name: 'Tricouri personalizate DTG 100% bumbac',
    slug: 'tricouri-personalizate-dtg-bumbac',
    sku: 'TRI-DTG-001',
    description: 'Tricouri 100% bumbac pieptănat 180gsm, imprimare DTG (Direct to Garment) full-color. Mătase premium, confortabile și respirante. Design personalizat fără limitări de culori. Disponibile în negru, alb, gri și alte culori. Mărimi de la XS la 3XL. Perfecte pentru evenimente, teambuilding, uniformă casual, merchandising. Rezistente la spălare 40°C.',
    descriptionShort: 'Tricouri 100% bumbac 180gsm, DTG full-color, XS-3XL',
    type: 'CONFIGURABLE',
    price: 35.00,
    categorySlug: 'tricouri-personalizate',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
    ]
  },
  
  // Packaging - Cutii
  {
    name: 'Cutii carton personalizate e-commerce',
    slug: 'cutii-carton-personalizate-ecommerce',
    sku: 'CUT-EC-001',
    description: 'Cutii carton ondulat pentru e-commerce, dimensiuni personalizabile. Carton B-flute rezistent, perfect pentru expedieri. Print extern cu logo în 1-4 culori. Închidere rapidă fără bandă adezivă. Protejează produsele în transport, aspect profesional la despachetare. Ideal pentru magazine online, subscription boxes. Tiraj minim 100 bucăți.',
    descriptionShort: 'Cutii carton ondulat B-flute, print logo, perfecte e-commerce',
    type: 'CONFIGURABLE',
    price: 2.50,
    categorySlug: 'cutii-postale',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=800'
    ]
  },
  
  // Etichete - Stickere decupate
  {
    name: 'Stickere decupate vinil personalizate',
    slug: 'stickere-decupate-vinil-personalizate',
    sku: 'STK-DEC-001',
    description: 'Stickere decupate (die-cut) din vinil autoadeziv premium. Forme personalizate după dumneavoastră design. Rezistente la apă, UV și intemperii, durabilitate 3-5 ani exterior. Perfecte pentru branding, ambalaje, laptop, mașină, vitrine. Laminare protectoare inclusă. Tiraj minim 50 buc. Diverse dimensiuni disponibile până la 30cm. Aplicare ușoară fără bule.',
    descriptionShort: 'Stickere vinil die-cut, rezistente UV/apă, forme personalizate',
    type: 'CONFIGURABLE',
    price: 1.20,
    categorySlug: 'stickere-decupate',
    active: true,
    images: [
      'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800'
    ]
  },
];

async function seedDemoProducts() {
  console.log('🌱 Seeding produse demo...\n');

  try {
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const productData of demoProducts) {
      try {
        // Găsește categoria după slug
        const category = await prisma.category.findUnique({
          where: { slug: productData.categorySlug },
          include: {
            parent: {
              select: { name: true }
            }
          }
        });

        if (!category) {
          console.error(`   ❌ Categorie nu a fost găsită: ${productData.categorySlug}`);
          errors++;
          continue;
        }

        // Verifică dacă produsul există deja
        const existing = await prisma.product.findUnique({
          where: { slug: productData.slug }
        });

        if (existing) {
          // Actualizează produsul existent
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: productData.name,
              sku: productData.sku,
              description: productData.description,
              descriptionShort: productData.descriptionShort,
              type: productData.type,
              price: productData.price,
              categoryId: category.id,
              active: productData.active,
            }
          });

          // Actualizează imaginile
          await prisma.productImage.deleteMany({
            where: { productId: existing.id }
          });

          if (productData.images.length > 0) {
            await prisma.productImage.createMany({
              data: productData.images.map((url) => ({
                url,
                productId: existing.id
              }))
            });
          }

          console.log(`   🔄 Actualizat: ${productData.name}`);
          console.log(`      └─ Categorie: ${category.parent?.name || category.name} → ${category.name}`);
          updated++;
        } else {
          // Creează produsul nou
          const product = await prisma.product.create({
            data: {
              name: productData.name,
              slug: productData.slug,
              sku: productData.sku,
              description: productData.description,
              descriptionShort: productData.descriptionShort,
              type: productData.type,
              price: productData.price,
              categoryId: category.id,
              active: productData.active,
            }
          });

          // Adaugă imaginile
          if (productData.images.length > 0) {
            await prisma.productImage.createMany({
              data: productData.images.map((url) => ({
                url,
                productId: product.id
              }))
            });
          }

          console.log(`   ✨ Creat: ${productData.name}`);
          console.log(`      └─ Categorie: ${category.parent?.name || category.name} → ${category.name}`);
          created++;
        }
      } catch (error) {
        console.error(`   ❌ Eroare la ${productData.name}:`, error);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 REZUMAT SEEDING PRODUSE DEMO');
    console.log('='.repeat(60));
    console.log(`   ✨ Create:      ${created}`);
    console.log(`   🔄 Actualizate: ${updated}`);
    console.log(`   ❌ Erori:       ${errors}`);
    console.log(`   📊 TOTAL:       ${created + updated}`);
    console.log('='.repeat(60));

    // Afișează produse pe categorii
    console.log('\n📊 Produse pe categorii:\n');
    
    const categories = await prisma.category.findMany({
      where: { 
        parentId: null 
      },
      include: {
        _count: {
          select: { products: true }
        },
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    for (const cat of categories) {
      const totalProducts = cat._count.products + cat.children.reduce((sum, child) => sum + child._count.products, 0);
      if (totalProducts > 0) {
        console.log(`   ${cat.icon} ${cat.name}: ${totalProducts} produse`);
        for (const child of cat.children) {
          if (child._count.products > 0) {
            console.log(`      └─ ${child.name}: ${child._count.products}`);
          }
        }
      }
    }

    console.log('\n✅ Seeding produse demo completat cu succes!\n');

  } catch (error) {
    console.error('❌ Eroare la seeding produse:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Rulează seeding-ul
seedDemoProducts().catch((error) => {
  console.error('❌ Seeding eșuat:', error);
  process.exit(1);
});
