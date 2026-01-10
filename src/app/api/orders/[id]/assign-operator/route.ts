import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: assign operator/team/equipment
  const { operator, team, equipment } = await req.json();
  // update workflow in DB
  return NextResponse.json({ success: true });
}
