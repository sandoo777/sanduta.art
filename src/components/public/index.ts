/**
 * ⚠️ BARREL FILE - USE WITH CAUTION
 * 
 * Header este Client Component, Footer este Server Component.
 * În Server Components, importați DIRECT:
 * 
 * ❌ BAD:  import { Header } from '@/components/public'
 * ✅ GOOD: import { Header } from '@/components/public/Header'
 */

// ⚠️ Header este CLIENT COMPONENT
export { Header } from './Header';

// ✅ Footer este SERVER COMPONENT
export { Footer } from './Footer';
