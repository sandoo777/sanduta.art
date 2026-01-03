import { NextResponse } from 'next/server';

export function withCache(response: NextResponse, maxAge: number = 3600) {
  response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
  return response;
}

export const cacheConfig = {
  revalidate: 3600, // 1 hour
};

export const noCacheConfig = {
  revalidate: 0,
};
