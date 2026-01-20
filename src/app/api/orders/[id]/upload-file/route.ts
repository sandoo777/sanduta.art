import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  // TODO: handle file upload
  // save file, update order files
  return NextResponse.json({ success: true });
}
