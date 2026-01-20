# Deprecation Notice

⚠️ **This file has been deprecated and replaced with standardized components.**

## Replacement

This `Header` component has been replaced by:
- **PublicHeader** (`@/components/common/headers/PublicHeader.tsx`) - for public pages
- **PanelHeader** (`@/components/common/headers/PanelHeader.tsx`) - for panel pages

## Migration Guide

### Old way:
```tsx
import { Header } from '@/components/layout/Header';

<Header />
```

### New way:
```tsx
import { PanelHeader } from '@/components/common';

<PanelHeader />
```

## Reason for Deprecation
- Duplicate functionality with `@/components/public/Header`
- Not following centralized component architecture
- Inconsistent usage across layouts

## Status
- ⚠️ **DEPRECATED** - Do not use in new code
- 🗑️ **To be removed** - Will be deleted in future cleanup

## See Also
- [RAPORT_STANDARDIZARE_LAYOUTS.md](../../RAPORT_STANDARDIZARE_LAYOUTS.md)
- New components: `@/components/common/`

---
**Date**: 2026-01-20  
**Replaced by**: `@/components/common/headers/PanelHeader.tsx`
