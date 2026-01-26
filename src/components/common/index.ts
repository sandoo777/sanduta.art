/**
 * ⚠️ BARREL FILE DEPRECATED - DO NOT USE
 * 
 * TOATE componentele din acest folder sunt Client Components ('use client').
 * În Server Components, importați DIRECT din fișierele sursă.
 * 
 * ❌ WRONG (Server Component imports):
 * import { PublicHeader } from '@/components/common'
 * 
 * ✅ CORRECT (Direct imports):
 * import { PublicHeader } from '@/components/common/headers/PublicHeader'
 * 
 * ⚠️ NOTE: Barrel imports sunt SIGURE doar în Client Components ('use client'),
 * dar pentru consistență, folosiți ÎNTOTDEAUNA import direct.
 */

// ❌ DEPRECATED - Import direct!
// export { PublicHeader } from './headers/PublicHeader';
// export { PanelHeader } from './headers/PanelHeader';
// export { PublicFooter } from './footers/PublicFooter';
// export { PanelSidebar } from './sidebars/PanelSidebar';
// export type { SidebarItem } from './sidebars/PanelSidebar';
