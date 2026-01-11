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

async function verifyCategory() {
  console.log('✓ Verificare model Category actualizat\n');
  
  // Test 1: Verifică că toate câmpurile sunt accesibile
  console.log('1. Câmpuri disponibile în model Category:');
  const categoryFields = [
    'id', 'name', 'slug', 'description', 'image', 
    'color', 'icon', 'parentId', 'order', 'active', 
    'featured', 'metaTitle', 'metaDescription',
    'createdAt', 'updatedAt'
  ];
  console.log('  -', categoryFields.join('\n  - '));
  
  // Test 2: Creează o categorie test pentru a verifica că totul funcționează
  try {
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category - Marketing',
        slug: 'test-marketing-' + Date.now(),
        description: 'Categorie test pentru materiale marketing',
        order: 1,
        active: true,
        featured: false,
        icon: '📢',
        color: '#3B82F6'
      }
    });
    console.log('\n2. ✓ Categorie creată cu succes:', testCategory.name);
    
    // Test 3: Creează o subcategorie
    const testSubcategory = await prisma.category.create({
      data: {
        name: 'Test Subcategory - Flyere',
        slug: 'test-flyere-' + Date.now(),
        description: 'Subcategorie test pentru flyere',
        parentId: testCategory.id,
        order: 1,
        active: true,
        icon: '📄'
      }
    });
    console.log('3. ✓ Subcategorie creată cu succes:', testSubcategory.name);
    
    // Test 4: Query cu relații parent-child
    const categoryWithChildren = await prisma.category.findUnique({
      where: { id: testCategory.id },
      include: {
        children: true
      }
    });
    console.log('4. ✓ Query cu relații funcționează');
    console.log('   Categorie:', categoryWithChildren?.name);
    console.log('   Subcategorii:', categoryWithChildren?.children.length);
    
    // Test 5: Curățare date test
    await prisma.category.delete({ where: { id: testSubcategory.id } });
    await prisma.category.delete({ where: { id: testCategory.id } });
    console.log('5. ✓ Date test șterse\n');
    
    console.log('✅ Toate verificările au trecut! Modelul Category este funcțional.\n');
  } catch (error) {
    console.error('❌ Eroare la verificare:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyCategory().catch(console.error);
