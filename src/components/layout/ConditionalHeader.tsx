'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/public/Header';

/**
 * ConditionalHeader - Afișează headerul pe paginile publice
 * Nu afișează headerul pe:
 * - Pagini admin (/admin/*)
 * - Pagini manager (/manager/*)
 * - Pagini operator (/operator/*)
 * - Pagini account/user panel (/account/*)
 * - Pagini de autentificare speciale (/setup)
 * - Editor full-screen (/editor, /editor/*)
 */
export function ConditionalHeader() {
  const pathname = usePathname();

  // Lista de path-uri unde NU vrem headerul
  // Aceste secțiuni au propriul Header sau Topbar
  const excludedPaths = [
    '/admin',     // AdminTopbar
    '/manager',   // Header propriu
    '/operator',  // Header propriu
    '/account',   // Header propriu (User Panel)
    '/setup',     // Setup wizard
    '/editor',    // Editor full-screen
    '/',          // Homepage are propriul header din (public) layout
    '/produse',   // Catalog are propriul header din (public) layout
    '/products',  // Products catalog are propriul header din products layout
    '/cart',      // Cart are propriul header din (public) layout
    '/checkout',  // Checkout are propriul header din (public) layout
    '/about',     // About are propriul header din (public) layout
    '/contact',   // Contact are propriul header din (public) layout
    '/blog',      // Blog are propriul header din (public) layout
  ];

  // Verifică dacă path-ul începe cu unul din cele excluse
  const shouldHideHeader = excludedPaths.some(path => 
    pathname?.startsWith(path)
  );

  // Nu afișa headerul pe paginile excluse
  if (shouldHideHeader) {
    return null;
  }

  // Afișează headerul pe toate celelalte pagini publice
  return <Header />;
}
