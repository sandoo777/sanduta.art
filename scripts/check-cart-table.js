const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.cartItem.count()
  .then(n => { console.log('cart_items rows:', n); return p.$disconnect(); })
  .catch(e => { console.error(e.message); process.exit(1); });
