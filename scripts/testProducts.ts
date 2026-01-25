import { prisma } from '../src/lib/prisma';

async function testProducts() {
  try {
    console.log('🔍 Testare conexiune Prisma...');
    
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      take: 5,
    });
    
    console.log(`✅ Succes! Găsite ${products.length} produse active`);
    console.log('Primele produse:', products.map(p => ({ id: p.id, name: p.name })));
    
  } catch (error) {
    console.error('❌ Eroare:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProducts();
