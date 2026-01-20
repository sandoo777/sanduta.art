import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: add note to order
  const { note, user } = await req.json();
  // save note to DB
  return NextResponse.json({ success: true });
}
