import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createTestNotifications() {
  try {
    // Find the first user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('No users found. Please create a user first.');
      return;
    }

    console.log(`Creating test notifications for user: ${user.email}`);

    // Create test notifications
    const notifications = [
      {
        userId: user.id,
        type: 'ORDER' as const,
        title: 'Comandă nouă plasată',
        message: 'Comanda #12345 a fost plasată cu succes și este în procesare.',
        link: '/dashboard/orders/12345'
      },
      {
        userId: user.id,
        type: 'ORDER' as const,
        title: 'Comandă livrată',
        message: 'Comanda #12340 a fost livrată cu succes. Vă mulțumim!',
        link: '/dashboard/orders/12340',
        read: true
      },
      {
        userId: user.id,
        type: 'PROJECT' as const,
        title: 'Proiect salvat',
        message: 'Proiectul tău "Poster personalizat" a fost salvat cu succes.',
        link: '/dashboard/projects'
      },
      {
        userId: user.id,
        type: 'PROJECT' as const,
        title: 'Proiect gata pentru comandă',
        message: 'Proiectul "Banner reclamă" este gata și poate fi comandat.',
        link: '/dashboard/projects',
        read: true
      },
      {
        userId: user.id,
        type: 'FILE' as const,
        title: 'Fișier încărcat',
        message: 'Fișierul "design-final.pdf" a fost încărcat și este gata de utilizare.',
        link: '/dashboard/files'
      },
      {
        userId: user.id,
        type: 'FILE' as const,
        title: 'Fișier șters',
        message: 'Fișierul "draft-old.png" a fost șters din biblioteca ta.',
        link: '/dashboard/files',
        read: true
      },
      {
        userId: user.id,
        type: 'SYSTEM' as const,
        title: 'Bine ai venit!',
        message: 'Contul tău a fost creat cu succes. Explorează platforma noastră!',
        link: null
      },
      {
        userId: user.id,
        type: 'SYSTEM' as const,
        title: 'Actualizare sistem',
        message: 'Am adăugat funcționalități noi! Verifică setările contului tău.',
        link: '/dashboard/settings',
        read: true
      },
      {
        userId: user.id,
        type: 'ORDER' as const,
        title: 'Statusul comenzii actualizat',
        message: 'Comanda #12344 a intrat în producție și va fi gata în curând.',
        link: '/dashboard/orders/12344'
      },
      {
        userId: user.id,
        type: 'PROJECT' as const,
        title: 'Proiect șters',
        message: 'Proiectul "Test design" a fost șters definitiv.',
        link: null,
        read: true
      }
    ];

    for (const notificationData of notifications) {
      await prisma.notification.create({
        data: notificationData
      });
    }

    console.log(`✓ Created ${notifications.length} test notifications`);
    
    // Count notifications by type
    const stats = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _count: true
    });

    console.log('\nNotifications by type:');
    stats.forEach(stat => {
      console.log(`  ${stat.type}: ${stat._count}`);
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false
      }
    });

    console.log(`\nUnread notifications: ${unreadCount}`);
    console.log('\n✓ Test data created successfully!');
    console.log('\nYou can now:');
    console.log('  1. Visit /dashboard/notifications to see the notifications');
    console.log('  2. Check the notifications dropdown in the header');
    console.log('  3. Test filtering by category and read status');

  } catch (error) {
    console.error('Error creating test notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();
