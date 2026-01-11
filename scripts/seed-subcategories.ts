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

interface SubcategoryData {
  name: string;
  slug: string;
  description: string;
  order: number;
}

interface CategoryWithSubcategories {
  parentSlug: string;
  subcategories: SubcategoryData[];
}

const subcategoriesData: CategoryWithSubcategories[] = [
  // 1. Cărți de vizită
  {
    parentSlug: 'carti-de-vizita',
    subcategories: [
      {
        name: 'Cărți de vizită standard',
        slug: 'carti-vizita-standard',
        description: 'Cărți de vizită clasice 85×55mm, carton 300-400gsm, finisaj mat sau lucios. Perfect pentru profesioniști.',
        order: 1
      },
      {
        name: 'Cărți de vizită premium',
        slug: 'carti-vizita-premium',
        description: 'Cărți de vizită premium cu finisaje speciale: soft-touch, spot UV, folio metalic. Impresie de lux.',
        order: 2
      },
      {
        name: 'Cărți de vizită foto',
        slug: 'carti-vizita-foto',
        description: 'Cărți de vizită cu foto de înaltă calitate, ideale pentru fotografi, artiști și creativi.',
        order: 3
      },
      {
        name: 'Cărți de vizită cu colț rotunjit',
        slug: 'carti-vizita-colt-rotunjit',
        description: 'Design modern cu colțuri rotunjite (radie 3-5mm), aspect elegant și profesional.',
        order: 4
      },
      {
        name: 'Cărți de vizită mini',
        slug: 'carti-vizita-mini',
        description: 'Format compact 85×35mm, perfect pentru un design minimalist și modern.',
        order: 5
      },
      {
        name: 'Cărți de vizită pătrate',
        slug: 'carti-vizita-patrate',
        description: 'Format pătrat unic (55×55mm sau 85×85mm), pentru a ieși în evidență.',
        order: 6
      },
      {
        name: 'Cărți de vizită texturate',
        slug: 'carti-vizita-texturate',
        description: 'Carton texturat special, tactilitate premium, aspect și feel unic.',
        order: 7
      },
      {
        name: 'Cărți de vizită transparente',
        slug: 'carti-vizita-transparente',
        description: 'PVC transparent sau translucid, design ultra-modern, impact maxim.',
        order: 8
      }
    ]
  },
  
  // 2. Marketing
  {
    parentSlug: 'marketing',
    subcategories: [
      {
        name: 'Flyere',
        slug: 'flyere',
        description: 'Flyere promoționale A6, A5, A4, DL. Hârtie 130-250gsm, finisaj mat sau lucios. Tiraje de la 100 buc.',
        order: 1
      },
      {
        name: 'Pliante',
        slug: 'pliante',
        description: 'Pliante în 2 (bifold) sau 3 (trifold), carton 170-300gsm. Ideal pentru meniuri, cataloage mici.',
        order: 2
      },
      {
        name: 'Broșuri',
        slug: 'brosuri',
        description: 'Broșuri capsate 8-32 pagini, finisare profesională. Perfect pentru cataloage, prezentări detaliate.',
        order: 3
      },
      {
        name: 'Afișe',
        slug: 'afise',
        description: 'Afișe pentru evenimente, promoții, anunțuri. Diverse formate, hârtie 150-200gsm.',
        order: 4
      },
      {
        name: 'Postere',
        slug: 'postere',
        description: 'Postere A3, A2, A1, A0. Hârtie semi-mat sau lucios 150-200gsm. Pentru interior sau exterior.',
        order: 5
      },
      {
        name: 'Bannere',
        slug: 'bannere',
        description: 'Bannere outdoor PVC 440gsm sau fabric 240gsm. Dimensiuni personalizate, rezistent la intemperii.',
        order: 6
      },
      {
        name: 'Roll-up',
        slug: 'rollup',
        description: 'Roll-up banner 85×200cm sau custom. Include structură metalică și husă transport. Setup rapid.',
        order: 7
      },
      {
        name: 'X-banner',
        slug: 'x-banner',
        description: 'X-banner portabil 60×160cm sau 80×180cm. Ușor de montat, ideal pentru evenimente.',
        order: 8
      },
      {
        name: 'L-banner',
        slug: 'l-banner',
        description: 'L-banner cu picior de suport, stabil și profesional. Diverse dimensiuni disponibile.',
        order: 9
      },
      {
        name: 'Banner mesh',
        slug: 'banner-mesh',
        description: 'Banner mesh perforat pentru exterior, permite trecerea vântului. Rezistent și durabil.',
        order: 10
      },
      {
        name: 'Pliante acordeon',
        slug: 'pliante-acordeon',
        description: 'Pliante acordeon (Z-fold), perfect pentru ghiduri, meniuri extinse, hărți.',
        order: 11
      },
      {
        name: 'Cataloage',
        slug: 'cataloage',
        description: 'Cataloage broșate profesionale, 16-100+ pagini. Coperta softcover sau hardcover.',
        order: 12
      },
      {
        name: 'Postere A3',
        slug: 'postere-a3',
        description: 'Postere format A3 (297×420mm), ideal pentru afișaj magazin, evenimente.',
        order: 13
      },
      {
        name: 'Postere A2',
        slug: 'postere-a2',
        description: 'Postere format A2 (420×594mm), impact vizual mare, perfect pentru promoții.',
        order: 14
      },
      {
        name: 'Postere A1',
        slug: 'postere-a1',
        description: 'Postere format A1 (594×841mm), vizibilitate maximă, pentru evenimente și expoziții.',
        order: 15
      }
    ]
  },
  
  // 3. Materiale de birou
  {
    parentSlug: 'materiale-de-birou',
    subcategories: [
      {
        name: 'Foi cu antet',
        slug: 'foi-cu-antet',
        description: 'Hârtie cu antet personalizată, format A4, 80-100gsm. Logo, contact și design corporate.',
        order: 1
      },
      {
        name: 'Mape de prezentare',
        slug: 'mape-de-prezentare',
        description: 'Mape de prezentare carton 300-350gsm cu plastifiere. Buzunare interne, aspect profesional.',
        order: 2
      },
      {
        name: 'Note pads',
        slug: 'note-pads',
        description: 'Blocnotes personalizate A4/A5/A6, 50-100 file. Capac rigid, desprindere ușoară.',
        order: 3
      },
      {
        name: 'Notebooks',
        slug: 'notebooks',
        description: 'Carnete personalizate cu elastic, semn de carte. Coperta rigidă sau flexibilă.',
        order: 4
      },
      {
        name: 'Agende',
        slug: 'agende',
        description: 'Agende personalizate datate sau nedatate. Format A5, coperta rigidă, design elegant.',
        order: 5
      },
      {
        name: 'Plicuri comerciale',
        slug: 'plicuri-comerciale',
        description: 'Plicuri personalizate C4, C5, C6, DL. Hârtie 90-120gsm, fereastră opțională.',
        order: 6
      },
      {
        name: 'Dosare personalizate',
        slug: 'dosare-personalizate',
        description: 'Dosare carton 300gsm cu logo, diverse culori. Perfect pentru arhivare documente.',
        order: 7
      },
      {
        name: 'Calendare de birou',
        slug: 'calendare-de-birou',
        description: 'Calendare de birou 10×15cm sau 15×20cm, carton gros. 12 luni + logo personalizat.',
        order: 8
      },
      {
        name: 'Calendare de perete',
        slug: 'calendare-de-perete',
        description: 'Calendare de perete A3/A4, 12 pagini + copertă. Spiralat, suspendare superioară.',
        order: 9
      },
      {
        name: 'Certificate și diplome',
        slug: 'certificate-diplome',
        description: 'Certificate și diplome A4, hârtie premium 200-250gsm. Design personalizat, aspect elegant.',
        order: 10
      }
    ]
  },
  
  // 4. Produse promoționale
  {
    parentSlug: 'produse-promotionale',
    subcategories: [
      {
        name: 'Pixuri personalizate',
        slug: 'pixuri-personalizate',
        description: 'Pixuri cu logo, metal sau plastic. Diverse modele și culori. Tiraj minim 50 buc.',
        order: 1
      },
      {
        name: 'Căni personalizate',
        slug: 'cani-personalizate',
        description: 'Căni ceramice 300-350ml, imprimare sublimation full-color. Design personalizat, rezistent spălare.',
        order: 2
      },
      {
        name: 'Brelocuri',
        slug: 'brelocuri',
        description: 'Brelocuri personalizate metal, plastic, lemn. Gravare laser sau print. Diverse forme.',
        order: 3
      },
      {
        name: 'Insigne',
        slug: 'insigne',
        description: 'Ecusoane (badge-uri) personalizate, rotunde 25-75mm. Pin metalic sau agrafă.',
        order: 4
      },
      {
        name: 'USB-uri personalizate',
        slug: 'usb-personalizate',
        description: 'Stick-uri USB cu logo 4GB-64GB. Metal, plastic, lemn. Gravare sau print.',
        order: 5
      },
      {
        name: 'Mousepad-uri',
        slug: 'mousepad-uri',
        description: 'Mousepad-uri personalizate, diverse dimensiuni. Bază anti-alunecare, print full-color.',
        order: 6
      },
      {
        name: 'Lanyard-uri',
        slug: 'lanyard-uri',
        description: 'Lanyard-uri personalizate pentru ecusoane. Serigrafie sau sublimation. Diverse lățimi.',
        order: 7
      },
      {
        name: 'Căni termice',
        slug: 'cani-termice',
        description: 'Căni termice inox 300-500ml cu logo. Menține temperatura 6+ ore. Design personalizat.',
        order: 8
      },
      {
        name: 'Sticle de apă',
        slug: 'sticle-apa',
        description: 'Sticle sport 500-750ml personalizate. Plastic, aluminiu sau inox. Logo print sau gravare.',
        order: 9
      },
      {
        name: 'Magneti frigider',
        slug: 'magneti-frigider',
        description: 'Magneti personalizați diverse forme și dimensiuni. Print full-color, magnet puternic.',
        order: 10
      },
      {
        name: 'Suporturi telefon',
        slug: 'suporturi-telefon',
        description: 'Suporturi telefon pentru birou sau auto. Personalizare logo. Plastic sau metal.',
        order: 11
      },
      {
        name: 'Portchei personalizate',
        slug: 'portchei-personalizate',
        description: 'Portchei metal, plastic, lemn, piele. Gravare sau print. Design custom.',
        order: 12
      }
    ]
  },
  
  // 5. Foto & Artă
  {
    parentSlug: 'foto-arta',
    subcategories: [
      {
        name: 'Printuri foto',
        slug: 'printuri-foto',
        description: 'Printuri foto profesionale pe hârtie premium. Diverse dimensiuni, finisaj lucios sau mat.',
        order: 1
      },
      {
        name: 'Canvas',
        slug: 'canvas',
        description: 'Tablouri canvas 380gsm, bastidor lemn 2-3cm. Dimensiuni de la 20×30cm la 100×150cm.',
        order: 2
      },
      {
        name: 'Postere foto',
        slug: 'postere-foto',
        description: 'Postere foto cu sau fără ramă. Hârtie premium 200gsm, diverse formate.',
        order: 3
      },
      {
        name: 'Albume foto',
        slug: 'albume-foto',
        description: 'Albume foto personalizate 20-60 pagini. Coperta rigidă, hârtie premium, design custom.',
        order: 4
      },
      {
        name: 'Foto pe forex',
        slug: 'foto-pe-forex',
        description: 'Foto pe PVC rigid (forex) 3-5mm. Ușor, durabil, ideal pentru afișaj interior.',
        order: 5
      },
      {
        name: 'Foto pe dibond',
        slug: 'foto-pe-dibond',
        description: 'Foto pe aluminiu dibond 3mm. Premium, rezistent, aspect profesional.',
        order: 6
      },
      {
        name: 'Foto pe sticlă acrilică',
        slug: 'foto-pe-sticla-acrilica',
        description: 'Foto pe sticlă acrilică 3-4mm. Transparență superioară, culori vibrante, efect 3D.',
        order: 7
      },
      {
        name: 'Foto pe lemn',
        slug: 'foto-pe-lemn',
        description: 'Foto pe lemn natural 10mm. Aspect rustic, textură lemn vizibilă, unic.',
        order: 8
      },
      {
        name: 'Puzzle personalizate',
        slug: 'puzzle-personalizate',
        description: 'Puzzle cu fotografia ta 120-1000 piese. Carton gros, cutie personalizată.',
        order: 9
      },
      {
        name: 'Calendare foto',
        slug: 'calendare-foto',
        description: 'Calendare cu fotografii personalizate. Birou sau perete, 12 luni, design custom.',
        order: 10
      }
    ]
  },
  
  // 6. Textile & Merch
  {
    parentSlug: 'textile-merch',
    subcategories: [
      {
        name: 'Tricouri personalizate',
        slug: 'tricouri-personalizate',
        description: 'Tricouri 100% bumbac 150-180gsm, imprimare DTG full-color. Bărbați, femei, copii.',
        order: 1
      },
      {
        name: 'Hanorace personalizate',
        slug: 'hanorace-personalizate',
        description: 'Hanorace cu glugă 280-320gsm, DTG sau broderie. Bumbac sau bumbac/poliester.',
        order: 2
      },
      {
        name: 'Tote bags',
        slug: 'tote-bags',
        description: 'Genți tote bumbac 140gsm, serigrafie sau DTG. Ecologice, reutilizabile, design custom.',
        order: 3
      },
      {
        name: 'Bluze polo',
        slug: 'bluze-polo',
        description: 'Bluze polo 180-200gsm cu broderie logo. Corporate, uniformă, aspect elegant.',
        order: 4
      },
      {
        name: 'Șepci personalizate',
        slug: 'sepci-personalizate',
        description: 'Șepci 6 paneluri, broderie sau print. Diverse culori și stiluri.',
        order: 5
      },
      {
        name: 'Bluze fără glugă',
        slug: 'bluze-fara-gluga',
        description: 'Bluze (sweatshirt) 280-320gsm fără glugă. Confort maxim, imprimare premium.',
        order: 6
      },
      {
        name: 'Genți shopper',
        slug: 'genti-shopper',
        description: 'Genți shopper mari, canvas sau bumbac. Serigrafie, rezistente, perfect pentru shopping.',
        order: 7
      },
      {
        name: 'Rucsaci personalizați',
        slug: 'rucsaci-personalizati',
        description: 'Rucsaci sport sau casual cu logo. Print sau broderie. Diverse dimensiuni.',
        order: 8
      },
      {
        name: 'Perne decorative',
        slug: 'perne-decorative',
        description: 'Perne decorative 40×40cm, sublimation full-color. Design personalizat, umplutura inclusă.',
        order: 9
      },
      {
        name: 'Prosoape personalizate',
        slug: 'prosoape-personalizate',
        description: 'Prosoape 50×100cm sau 70×140cm cu logo. Sublimation sau broderie. Bumbac moale.',
        order: 10
      },
      {
        name: 'Șorțuri personalizate',
        slug: 'sorturi-personalizate',
        description: 'Șorțuri bucătărie sau grădină cu logo. Serigrafie sau broderie. Buzunare practice.',
        order: 11
      },
      {
        name: 'Sacoșe ecologice',
        slug: 'sacose-ecologice',
        description: 'Sacoșe reutilizabile din bumbac organic. Print eco-friendly, rezistente, sustenabile.',
        order: 12
      }
    ]
  },
  
  // 7. Packaging
  {
    parentSlug: 'packaging',
    subcategories: [
      {
        name: 'Cutii personalizate',
        slug: 'cutii-personalizate',
        description: 'Cutii carton personalizate diverse forme și dimensiuni. E-flute, B-flute. Print custom.',
        order: 1
      },
      {
        name: 'Pungi personalizate',
        slug: 'pungi-personalizate',
        description: 'Pungi hârtie kraft cu mâner, 110-150gsm. Logo și design personalizat.',
        order: 2
      },
      {
        name: 'Etichete de ambalaj',
        slug: 'etichete-de-ambalaj',
        description: 'Etichete pentru ambalaje diverse forme. Hârtie, vinil sau transparent. Print full-color.',
        order: 3
      },
      {
        name: 'Cutii postale',
        slug: 'cutii-postale',
        description: 'Cutii postale e-commerce, carton ondulat B-flute. Logo print, rezistente transport.',
        order: 4
      },
      {
        name: 'Pungi plastic',
        slug: 'pungi-plastic',
        description: 'Pungi plastic HDPE/LDPE personalizate. Diverse dimensiuni, print logo.',
        order: 5
      },
      {
        name: 'Sacoșe kraft',
        slug: 'sacose-kraft',
        description: 'Sacoșe hârtie kraft 90-120gsm, ecologice. Mânere răsucite sau plate.',
        order: 6
      },
      {
        name: 'Hârtie de împachetat',
        slug: 'hartie-de-impachetat',
        description: 'Hârtie cadou personalizată, design custom. Role sau foi, diverse dimensiuni.',
        order: 7
      },
      {
        name: 'Bandă adezivă personalizată',
        slug: 'banda-adeziva-personalizata',
        description: 'Bandă adezivă cu logo 48mm lățime. Transparent sau maro, print 1-3 culori.',
        order: 8
      }
    ]
  },
  
  // 8. Etichete & Stickere
  {
    parentSlug: 'etichete-stickere',
    subcategories: [
      {
        name: 'Stickere decupate',
        slug: 'stickere-decupate',
        description: 'Stickere decupate (die-cut) forme personalizate. Vinil, hârtie sau transparent.',
        order: 1
      },
      {
        name: 'Stickere pe rolă',
        slug: 'stickere-pe-rola',
        description: 'Stickere în rulou (roll) pentru aplicare rapidă. Diverse forme: rotund, dreptunghi, custom.',
        order: 2
      },
      {
        name: 'Etichete de produs',
        slug: 'etichete-de-produs',
        description: 'Etichete pentru produse, diverse materiale și dimensiuni. Print full-color, rezistent.',
        order: 3
      },
      {
        name: 'Stickere pe foi',
        slug: 'stickere-pe-foi',
        description: 'Stickere pe foi A4/A5, hârtie autoadezivă. Mat sau lucios, decupare contur.',
        order: 4
      },
      {
        name: 'Stickere vinil outdoor',
        slug: 'stickere-vinil-outdoor',
        description: 'Stickere vinil rezistent UV și apă. Perfect pentru exterior, durabilitate 3-5 ani.',
        order: 5
      },
      {
        name: 'Stickere pentru ferestre',
        slug: 'stickere-pentru-ferestre',
        description: 'Stickere vinil transparent sau static pentru ferestre. Aplicare/îndepărtare ușoară.',
        order: 6
      },
      {
        name: 'Stickere holografice',
        slug: 'stickere-holografice',
        description: 'Stickere cu efect holografic. Aspect premium, perfect pentru branding special.',
        order: 7
      },
      {
        name: 'Etichete de securitate',
        slug: 'etichete-de-securitate',
        description: 'Etichete void/tamper-proof. Se deteriorează la îndepărtare, pentru sigilare.',
        order: 8
      },
      {
        name: 'Stickere podea',
        slug: 'stickere-podea',
        description: 'Stickere pentru podea anti-alunecare, laminat. Rezistent trafic intens.',
        order: 9
      },
      {
        name: 'Etichete prețuri',
        slug: 'etichete-preturi',
        description: 'Etichete prețuri standard sau personalizate. Hârtie autoadezivă, diverse dimensiuni.',
        order: 10
      }
    ]
  }
];

async function seedSubcategories() {
  console.log('🌱 Seeding subcategorii pentru toate categoriile principale...\n');

  try {
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let errors = 0;

    for (const categoryData of subcategoriesData) {
      // Găsește categoria părinte
      const parentCategory = await prisma.category.findUnique({
        where: { slug: categoryData.parentSlug }
      });

      if (!parentCategory) {
        console.error(`❌ Categorie părinte nu a fost găsită: ${categoryData.parentSlug}`);
        errors++;
        continue;
      }

      console.log(`\n📂 ${parentCategory.icon} ${parentCategory.name}`);
      console.log(`   ${categoryData.subcategories.length} subcategorii\n`);

      for (const subcat of categoryData.subcategories) {
        try {
          // Verifică dacă subcategoria există deja
          const existing = await prisma.category.findUnique({
            where: { slug: subcat.slug }
          });

          if (existing) {
            // Actualizează subcategoria existentă
            await prisma.category.update({
              where: { id: existing.id },
              data: {
                name: subcat.name,
                description: subcat.description,
                parentId: parentCategory.id,
                order: subcat.order,
                active: true,
              }
            });
            console.log(`   🔄 Actualizat: ${subcat.name}`);
            totalUpdated++;
          } else {
            // Creează subcategoria nouă
            await prisma.category.create({
              data: {
                name: subcat.name,
                slug: subcat.slug,
                description: subcat.description,
                parentId: parentCategory.id,
                order: subcat.order,
                active: true,
                icon: parentCategory.icon, // Moștenește icon-ul de la părinte
                color: parentCategory.color, // Moștenește culoarea de la părinte
              }
            });
            console.log(`   ✨ Creat: ${subcat.name}`);
            totalCreated++;
          }
        } catch (error) {
          console.error(`   ❌ Eroare la ${subcat.name}:`, error);
          errors++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 REZUMAT SEEDING SUBCATEGORII');
    console.log('='.repeat(60));
    console.log(`   ✨ Create:      ${totalCreated}`);
    console.log(`   🔄 Actualizate: ${totalUpdated}`);
    console.log(`   ⏭️  Sărite:      ${totalSkipped}`);
    console.log(`   ❌ Erori:       ${errors}`);
    console.log(`   📊 TOTAL:       ${totalCreated + totalUpdated + totalSkipped}`);
    console.log('='.repeat(60));

    // Afișează statistici pe categorii
    console.log('\n📊 Statistici pe categorii:\n');
    const allCategories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: {
          select: { children: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    for (const cat of allCategories) {
      console.log(`   ${cat.icon} ${cat.name}: ${cat._count.children} subcategorii`);
    }

    console.log('\n✅ Seeding subcategorii completat cu succes!\n');

  } catch (error) {
    console.error('❌ Eroare la seeding subcategorii:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Rulează seeding-ul
seedSubcategories().catch((error) => {
  console.error('❌ Seeding eșuat:', error);
  process.exit(1);
});
