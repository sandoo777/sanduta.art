import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  
  return NextResponse.json({
    session,
    user: session?.user,
    timestamp: new Date().toISOString()
  });
}
