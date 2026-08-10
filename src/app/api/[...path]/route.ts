import { NextResponse } from 'next/server';

function notFoundResponse() {
  return NextResponse.json(
    { error: 'API route not found' },
    { status: 404 }
  );
}

export function GET() {
  return notFoundResponse();
}

export function POST() {
  return notFoundResponse();
}

export function PUT() {
  return notFoundResponse();
}

export function PATCH() {
  return notFoundResponse();
}

export function DELETE() {
  return notFoundResponse();
}

export function OPTIONS() {
  return notFoundResponse();
}
