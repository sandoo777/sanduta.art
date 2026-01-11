// Environment configuration helper
// src/lib/env.ts

export const ENV = process.env.NODE_ENV || 'development';
export const IS_DEV = ENV === 'development';
export const IS_TEST = ENV === 'test';
export const IS_STAGING = process.env.VERCEL_ENV === 'preview';
export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

export interface EnvConfig {
  apiUrl: string;
  cdnUrl: string;
  dbMaxConnections: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableDebug: boolean;
  enableMetrics: boolean;
}

export function getEnvConfig(): EnvConfig {
  if (IS_PRODUCTION) {
    return {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://sanduta.art',
      cdnUrl: 'https://res.cloudinary.com/sanduta-production',
      dbMaxConnections: 20,
      logLevel: 'error',
      enableDebug: false,
      enableMetrics: true,
    };
  }
  
  if (IS_STAGING) {
    return {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://staging.sanduta.art',
      cdnUrl: 'https://res.cloudinary.com/sanduta-staging',
      dbMaxConnections: 10,
      logLevel: 'warn',
      enableDebug: true,
      enableMetrics: true,
    };
  }
  
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    cdnUrl: '/uploads',
    dbMaxConnections: 5,
    logLevel: 'debug',
    enableDebug: true,
    enableMetrics: false,
  };
}

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}

export const config = getEnvConfig();
