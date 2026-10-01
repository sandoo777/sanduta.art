import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

(async () => {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@sanduta.art' },
    select: { id: true, email: true, password: true, role: true, name: true },
  });
  console.log('USER_FOUND', !!user);
  if (user) {
    console.log('HAS_PASSWORD', !!user.password);
    const ok = user.password ? await bcrypt.compare('admin123', user.password) : false;
    console.log('PASSWORD_MATCH', ok);
  }
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});