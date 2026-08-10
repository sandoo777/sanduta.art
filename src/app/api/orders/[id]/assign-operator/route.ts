import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // TODO: assign operator/team/equipment
  const { operator: _operator, team: _team, equipment: _equipment } = await request.json();
  // update workflow in DB
  return NextResponse.json({ success: true, orderId: params.id });
}
