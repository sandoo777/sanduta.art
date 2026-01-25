// Server Component — Data fetching with direct Prisma access
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AddressesClient from './AddressesClient';

export default async function AddressesPage() {
  // 1. Auth check server-side
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // 2. Fetch addresses directly from database
  const addresses = await prisma.address.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      street: true,
      city: true,
      county: true,
      postalCode: true,
      isDefault: true,
    },
    orderBy: {
      isDefault: 'desc', // Default address first
    },
  });

  // 3. Transform data for client
  const addressesData = addresses.map(address => ({
    id: address.id,
    name: address.name,
    phone: address.phone,
    street: address.street,
    city: address.city,
    county: address.county || '',
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  }));

  // 4. Pass data to Client Component for interactivity
