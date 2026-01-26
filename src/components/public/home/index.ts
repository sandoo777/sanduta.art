/**
 * ⚠️ BARREL FILE - USE WITH CAUTION
 * 
 * Hero este Client Component, restul sunt Server Components.
 * În Server Components, importați DIRECT:
 * 
 * ❌ WRONG (Server Component imports Client through barrel):
 * import { Hero } from '@/components/public/home'
 * 
 * ✅ CORRECT (Direct imports):
 * import { Hero } from '@/components/public/home/Hero'
 * import { PopularProducts } from '@/components/public/home/PopularProducts'
 */

// ❌ Hero - Client Component - Import DOAR direct!
// export { Hero } from './Hero';

// ✅ PopularProducts - Server Component - Safe to export
export { PopularProducts } from './PopularProducts';
export { WhyChooseUs } from './WhyChooseUs';
export { FeaturedCategories } from './FeaturedCategories';
export { Testimonials } from './Testimonials';
export { FinalCTA } from './FinalCTA';
