import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

/**
 * AuthLink — Wrapper pentru Link în zone protejate cu auth
 * 
 * Default comportament:
 * - prefetch={false} — previne prefetch issues cu auth redirects
 * - Poate fi override cu prefetch={true} explicit
 * 
 * Folosire:
 * ```tsx
 * import { AuthLink } from '@/components/common/links/AuthLink';
 * 
 * <AuthLink href="/account/orders">Comenzile mele</AuthLink>
 * ```
 * 
 * Override prefetch (rar necesar):
 * ```tsx
 * <AuthLink href="/account/orders" prefetch={true}>
 *   Comenzile mele
 * </AuthLink>
 * ```
 */

interface AuthLinkProps 
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children: React.ReactNode;
  prefetch?: boolean;
}

export function AuthLink({ 
  prefetch = false,  // Default: false pentru auth routes
  children,
  ...props 
}: AuthLinkProps) {
  return (
    <Link prefetch={prefetch} {...props}>
      {children}
    </Link>
  );
}

/**
 * SafeLink — Alias pentru AuthLink (backwards compatibility)
 */
export const SafeLink = AuthLink;

/**
 * Helper: Când să folosești AuthLink vs Link
 * 
 * USE AuthLink:
 * - /account/* routes
 * - /admin/* routes
 * - /manager/* routes
 * - /operator/* routes
 * - Orice route protejată cu auth
 * 
 * USE Link (default):
 * - / (homepage)
 * - /produse/*
 * - /about, /contact
 * - Public routes fără auth
 */
