import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: update order status in DB
  const { status, user, note } = await req.json();
  // log status change, add to timeline, notify if needed
  return NextResponse.json({ success: true });
}
