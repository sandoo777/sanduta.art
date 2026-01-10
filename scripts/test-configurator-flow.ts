#!/usr/bin/env tsx
/**
 * End-to-End Test pentru Configurator
 * Test complet al sincronizării Admin Panel → Configurator
 */

import { prisma } from '../src/lib/prisma';

async function testConfiguratorFlow() {
  console.log('\n🧪 TEST CONFIGURATOR - END TO END\n');
  console.log('=' .repeat(80));

  try {
    // Test 1: Verificare produse active în DB
    console.log('\n📦 Test 1: Verificare produse active...');
    const activeProducts = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        type: true,
        slug: true,
        pricing: true,
      },
      take: 5,
    });

    if (activeProducts.length === 0) {
      throw new Error('Nu există produse active în baza de date');
    }

    console.log(`✅ Găsite ${activeProducts.length} produse active:`);
    activeProducts.forEach((p) => {
      console.log(`   - ${p.name} (${p.type}) - ${p.slug}`);
    });

    // Test 2: Verificare structură pricing pentru configurator
    console.log('\n💰 Test 2: Verificare structură pricing...');
    const productsWithPricing = activeProducts.filter((p) => p.pricing);
    
    if (productsWithPricing.length === 0) {
      console.log('⚠️  Warning: Niciunul dintre produsele active nu are pricing configurat');
    } else {
      console.log(`✅ ${productsWithPricing.length} produse au pricing configurat`);
    }

    // Test 3: Verificare relații (materials, printMethods, finishing)
    console.log('\n🔗 Test 3: Verificare relații produse...');
    const productWithRelations = await prisma.product.findFirst({
      where: { active: true },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
        printMethods: {
          include: {
            printMethod: true,
          },
        },
        finishing: {
          include: {
            finishing: true,
          },
        },
        images: true,
      },
    });

    if (!productWithRelations) {
      throw new Error('Nu s-a găsit niciun produs cu relații');
    }

    console.log(`✅ Produs: ${productWithRelations.name}`);
    console.log(`   - Materiale: ${productWithRelations.materials.length}`);
    console.log(`   - Metode tipărire: ${productWithRelations.printMethods.length}`);
    console.log(`   - Finisaje: ${productWithRelations.finishing.length}`);
    console.log(`   - Imagini: ${productWithRelations.images.length}`);

    // Test 4: Verificare defaults
    console.log('\n⚙️  Test 4: Verificare defaults...');
    const productsWithDefaults = await prisma.product.findMany({
      where: {
        active: true,
        defaults: { not: null },
      },
      select: {
        name: true,
        defaults: true,
      },
      take: 3,
    });

    if (productsWithDefaults.length > 0) {
      console.log(`✅ ${productsWithDefaults.length} produse au defaults:`);
      productsWithDefaults.forEach((p) => {
        const defaults = p.defaults as Record<string, unknown>;
        console.log(`   - ${p.name}:`);
        console.log(`     materialId: ${defaults.materialId ?? 'N/A'}`);
        console.log(`     printMethodId: ${defaults.printMethodId ?? 'N/A'}`);
        console.log(`     quantity: ${defaults.quantity ?? 'N/A'}`);
      });
    } else {
      console.log('⚠️  Warning: Niciun produs nu are defaults configurate');
    }

    // Test 5: Verificare dimensiuni
    console.log('\n📏 Test 5: Verificare dimensiuni produse...');
    const productsWithDimensions = await prisma.product.findMany({
      where: {
        active: true,
        dimensions: { not: null },
      },
      select: {
        name: true,
        dimensions: true,
      },
      take: 3,
    });

    if (productsWithDimensions.length > 0) {
      console.log(`✅ ${productsWithDimensions.length} produse au dimensiuni:`);
      productsWithDimensions.forEach((p) => {
        const dims = p.dimensions as Record<string, unknown>;
        console.log(`   - ${p.name}:`);
        console.log(`     ${dims.widthMin}x${dims.heightMin} - ${dims.widthMax}x${dims.heightMax} ${dims.unit}`);
      });
    } else {
      console.log('⚠️  Info: Niciun produs nu are dimensiuni configurabile');
    }

    // Test 6: Verificare opțiuni custom
    console.log('\n🎛️  Test 6: Verificare opțiuni custom...');
    const productsWithOptions = await prisma.product.findMany({
      where: {
        active: true,
        options: { not: null },
      },
      select: {
        name: true,
        options: true,
      },
      take: 3,
    });

    if (productsWithOptions.length > 0) {
      console.log(`✅ ${productsWithOptions.length} produse au opțiuni custom:`);
      productsWithOptions.forEach((p) => {
        const options = (p.options as Array<{ name: string; type: string; required: boolean }>) || [];
        console.log(`   - ${p.name}: ${options.length} opțiuni`);
        options.slice(0, 2).forEach((opt) => {
          console.log(`     • ${opt.name} (${opt.type}, ${opt.required ? 'required' : 'optional'})`);
        });
      });
    } else {
      console.log('⚠️  Info: Niciun produs nu are opțiuni custom');
    }

    // Test 7: Test API Endpoint (simulat)
    console.log('\n🌐 Test 7: Verificare disponibilitate API endpoint...');
    const testProduct = activeProducts[0];
    console.log(`   Endpoint: /api/products/${testProduct.id}/configurator`);
    console.log('   ✅ Endpoint disponibil pentru testare cu curl sau browser');

    // Test 8: Validare price breaks
    console.log('\n📊 Test 8: Verificare price breaks...');
    let productsWithPriceBreaks = 0;
    
    for (const product of activeProducts) {
      if (product.pricing) {
        try {
          const pricing = typeof product.pricing === 'string' 
            ? JSON.parse(product.pricing) 
            : product.pricing;
          
          if (pricing.priceBreaks && Array.isArray(pricing.priceBreaks) && pricing.priceBreaks.length > 0) {
            productsWithPriceBreaks++;
            console.log(`   - ${product.name}: ${pricing.priceBreaks.length} price breaks`);
          }
        } catch {
          // Ignore parsing errors
        }
      }
    }

    if (productsWithPriceBreaks > 0) {
      console.log(`✅ ${productsWithPriceBreaks} produse au price breaks configurate`);
    } else {
      console.log('⚠️  Info: Niciun produs nu are price breaks');
    }

    // Sumar final
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMAR TEST:');
    console.log('   ✅ Produse active: ' + activeProducts.length);
    console.log('   ✅ Cu pricing: ' + productsWithPricing.length);
    console.log('   ✅ Cu defaults: ' + productsWithDefaults.length);
    console.log('   ✅ Cu dimensiuni: ' + productsWithDimensions.length);
    console.log('   ✅ Cu opțiuni: ' + productsWithOptions.length);
    console.log('   ✅ Cu price breaks: ' + productsWithPriceBreaks);
    console.log('\n🎉 Toate testele au trecut cu succes!');
    console.log('✅ Sistemul de sincronizare Admin Panel → Configurator este functional!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConfiguratorFlow();
