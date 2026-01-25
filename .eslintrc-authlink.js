/**
 * ESLint Custom Rule: no-unsafe-link-in-auth-routes
 * 
 * Enforces usage of AuthLink instead of next/link in auth-protected routes.
 * 
 * Usage:
 * Add to eslint.config.mjs:
 * 
 * import noUnsafeLinkInAuthRoutes from './.eslintrc-authlink.js';
 * 
 * export default [
 *   {
 *     plugins: {
 *       'custom': {
 *         rules: {
 *           'no-unsafe-link-in-auth-routes': noUnsafeLinkInAuthRoutes,
 *         }
 *       }
 *     },
 *     rules: {
 *       'custom/no-unsafe-link-in-auth-routes': 'error',
 *     }
 *   }
 * ];
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow usage of next/link in auth-protected routes',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      unsafeLink: 'Use AuthLink instead of Link in auth-protected routes to prevent prefetch crashes',
    },
  },
  create(context) {
    const filename = context.getFilename();
    
    // Check if file is in auth-protected route
    const authRoutes = [
      '/app/account/',
      '/app/admin/',
      '/app/manager/',
      '/app/operator/',
      '/components/account/',
      '/components/admin/',
    ];
    
    const isAuthRoute = authRoutes.some(route => filename.includes(route));
    
    if (!isAuthRoute) {
      return {}; // Skip non-auth routes
    }
    
    return {
      ImportDeclaration(node) {
        // Check for: import Link from 'next/link'
        if (
          node.source.value === 'next/link' &&
          node.specifiers.some(
            spec =>
              spec.type === 'ImportDefaultSpecifier' &&
              spec.local.name === 'Link'
          )
        ) {
          context.report({
            node,
            messageId: 'unsafeLink',
            fix(fixer) {
              // Auto-fix: replace with AuthLink import
              return fixer.replaceText(
                node,
                "import { AuthLink } from '@/components/common/links/AuthLink';"
              );
            },
          });
        }
      },
      
      JSXOpeningElement(node) {
        // Check for: <Link ...>
        if (
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'Link'
        ) {
          context.report({
            node,
            messageId: 'unsafeLink',
            fix(fixer) {
              return fixer.replaceText(node.name, 'AuthLink');
            },
          });
        }
      },
      
      JSXClosingElement(node) {
        // Check for: </Link>
        if (
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'Link'
        ) {
          context.report({
            node,
            messageId: 'unsafeLink',
            fix(fixer) {
              return fixer.replaceText(node.name, 'AuthLink');
            },
          });
        }
      },
    };
  },
};
