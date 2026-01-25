/**
 * ⚠️ BARREL FILE - DEPRECATED
 * 
 * TOATE componentele din acest folder sunt Client Components.
 * În Server Components, importați DIRECT din fișierele sursă:
 * 
 * ❌ BAD:  import { PublicHeader } from '@/components/common'
 * ✅ GOOD: import { PublicHeader } from '@/components/common/headers/PublicHeader'
 * 
 * Acest barrel file va fi ELIMINAT în viitorul apropiat.
 */

// ⚠️ CLIENT COMPONENTS - Import direct în Server Components!
export { PublicHeader } from './headers/PublicHeader';
export { PanelHeader } from './headers/PanelHeader';
export { PublicFooter } from './footers/PublicFooter';
export { PanelSidebar } from './sidebars/PanelSidebar';
export type { SidebarItem } from './sidebars/PanelSidebar';
