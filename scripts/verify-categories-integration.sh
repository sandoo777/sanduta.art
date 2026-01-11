#!/bin/bash

echo "🔍 Verificare Integrare Categorii - sanduta.art"
echo "================================================"
echo ""

# Verifică dacă serverul rulează
echo "1️⃣  Verificare server Next.js..."
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "   ✅ Server activ pe http://localhost:3002"
else
    echo "   ❌ Server nu răspunde. Rulează: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Testare API /api/categories..."
CATEGORIES_COUNT=$(curl -s http://localhost:3002/api/categories | jq 'length')
echo "   📊 Categorii returnate: $CATEGORIES_COUNT"

if [ "$CATEGORIES_COUNT" -gt "0" ]; then
    echo "   ✅ API categorii funcționează"
    
    # Afișează primele 3 categorii
    echo ""
    echo "   📋 Primele 3 categorii:"
    curl -s http://localhost:3002/api/categories | jq '.[0:3] | .[] | {name, icon, parentId, products: ._count.products}'
else
    echo "   ❌ API nu returnează categorii"
fi

echo ""
echo "3️⃣  Verificare produse în baza de date..."
cd /workspaces/sanduta.art

# Folosește npx prisma pentru a face query
PRODUCTS_SQL="SELECT COUNT(*) as count FROM products WHERE active = true;"
PRODUCTS_COUNT=$(npx prisma db execute --stdin <<< "$PRODUCTS_SQL" 2>/dev/null | grep -o '[0-9]\+' | tail -1)

if [ -n "$PRODUCTS_COUNT" ]; then
    echo "   📦 Produse active: $PRODUCTS_COUNT"
    echo "   ✅ Database produse OK"
else
    echo "   ℹ️  Nu s-a putut verifica numărul de produse"
fi

echo ""
echo "4️⃣  Verificare categorii cu produse..."
echo "   (Rulează query pentru a vedea distribuția)"

npx tsx <<EOF
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, active: true },
    include: {
      _count: { select: { products: true } },
      children: {
        include: {
          _count: { select: { products: true } }
        }
      }
    },
    orderBy: { order: 'asc' }
  });

  console.log('   📊 Distribuție produse pe categorii:\n');
  
  categories.forEach(cat => {
    const totalProducts = cat._count.products + cat.children.reduce((sum, child) => sum + child._count.products, 0);
    if (totalProducts > 0) {
      console.log(\`   \${cat.icon} \${cat.name}: \${totalProducts} produse\`);
      cat.children.forEach(child => {
        if (child._count.products > 0) {
          console.log(\`      └─ \${child.name}: \${child._count.products}\`);
        }
      });
    }
  });
  
  await prisma.\$disconnect();
}

check().catch(console.error);
EOF

echo ""
echo "5️⃣  Link-uri pentru testare manuală:"
echo "   🔗 Admin Products: http://localhost:3002/admin/products"
echo "   🔗 Admin Categories: http://localhost:3002/admin/categories"
echo "   🔗 Public Catalog: http://localhost:3002/products"
echo "   🔗 API Categories: http://localhost:3002/api/categories"

echo ""
echo "================================================"
echo "✅ Verificare completă!"
echo ""
echo "📝 Pentru a testa integrarea completă:"
echo "   1. Deschide Admin Panel: http://localhost:3002/admin/products"
echo "   2. Creează un produs nou"
echo "   3. Verifică dropdown-ul de categorii (trebuie să arate ierarhia)"
echo "   4. Deschide Catalog: http://localhost:3002/products"
echo "   5. Testează filtrul de categorii"
echo ""
