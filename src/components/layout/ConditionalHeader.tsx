'use client';

import { usePathname } from 'next/navigation';
import { PublicHeader } from '@/components/common/headers/PublicHeader';

/**
 * ConditionalHeader - Afișează PublicHeader pe paginile publice
 * 
 * NU afișează headerul pe:
 * - Pagini admin (/admin/*) - au AdminTopbar propriu
 * - Pagini manager (/manager/*) - au PanelHeader propriu
 * - Pagini operator (/operator/*) - au header propriu
 * - Pagini account/user panel (/account/*) - au header propriu
 * - Setup wizard (/setup) - pagină specială de setup
 * - Editor full-screen (/editor, /editor/*) - fullscreen mode
 * 
 * AFIȘEAZĂ PublicHeader pe:
 * - Homepage (/)
 * - Catalog (/produse, /products)
 * - Coș și checkout (/cart, /checkout)
 * - Pagini informaționale (/about, /contact, /blog)
 * - Orice alte pagini publice
 */
export function ConditionalHeader() {
  const pathname = usePathname();

  // Path-uri unde NU vrem headerul (au propriul UI)
  const excludedPaths = [
    '/admin',     // AdminTopbar
    '/manager',   // PanelHeader
    '/operator',  // Header propriu
    '/account',   // Header propriu (User Panel)
    '/setup',     // Setup wizard
    '/editor',    // Editor full-screen
  ];

  // Verifică dacă path-ul începe cu unul din cele excluse
  const shouldHideHeader = excludedPaths.some(path => 
    pathname?.startsWith(path)
  );

  // Nu afișa headerul pe paginile excluse
  if (shouldHideHeader) {
    return null;
  }

  // Afișează PublicHeader pe toate paginile publice
  return <PublicHeader />;
}
