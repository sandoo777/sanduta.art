// Server Component — Data fetching with direct Prisma access
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import ProjectsClient from './ProjectsClient';
import { safeRedirect, validateServerData, fetchServerData } from '@/lib/serverSafe';

export default async function ProjectsPage() {
  try {
    // 1. Auth check server-side
    const session = await getServerSession(authOptions);
    if (!session) {
      return safeRedirect('/login');
    }

    // 2. Validate session data
    const userId = validateServerData(
      session?.user?.id,
      'User ID not found in session'
    );

    // 3. Fetch projects directly from database with safe wrapper
    // Note: Assuming Project model exists in Prisma schema
    // If not, this will need to be adjusted based on actual schema
    const projects = await fetchServerData(
      () => prisma.project.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          name: true,
          thumbnail: true,
          createdAt: true,
          updatedAt: true,
          productType: true,
          dimensions: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      {
        timeout: 10000,
        retries: 2,
      }
    );

  // 3. Transform data for client
  const projectsData = projects.map(project => ({
    id: project.id,
    name: project.name || 'Untitled Project',
    thumbnail: project.thumbnail || '',
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    productType: project.productType || 'Unknown',
    dimensions: project.dimensions || 'N/A',
  }));

  // 4. Pass data to Client Component for interactivity
  return <ProjectsClient projects={projectsData} />;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error; // Let Next.js error boundary handle it
  }
}
