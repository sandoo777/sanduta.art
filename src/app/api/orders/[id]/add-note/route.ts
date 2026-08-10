import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // TODO: add note to order
  const { note: _note, user: _user } = await request.json();
  // save note to DB
  return NextResponse.json({ success: true, orderId: params.id });
}
