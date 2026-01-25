/**
 * ⚠️ BARREL FILE - USE WITH CAUTION
 * 
 * Acest fișier re-exportă componente, dar TOATE componentele sunt Client Components.
 * În Server Components, importați DIRECT din fișiere:
 * 
 * ❌ BAD:  import { Button } from '@/components/ui'
 * ✅ GOOD: import { Button } from '@/components/ui/Button'
 * 
 * Acest barrel file este menținut doar pentru compatibilitate backward,
 * dar va fi eliminat în viitorul apropiat.
 */

// ⚠️ CLIENT COMPONENTS - Import direct în Server Components!
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps, CardFooterProps } from './Card';

export { Badge, StatusBadge } from './Badge';
export type { BadgeProps, StatusBadgeProps } from './Badge';

export { SectionTitle, PageTitle } from './SectionTitle';
export type { SectionTitleProps, PageTitleProps } from './SectionTitle';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './tabs';

export { Table } from './Table';
export type { TableProps, Column, SortState, SortDirection } from './Table.types';

export { Pagination } from './Pagination';

// ⚠️ REACT-HOOK-FORM - Import DOAR direct!
// ❌ import { Form } from '@/components/ui'
// ✅ import { Form } from '@/components/ui/Form'
// export { Form, useFormContext, useWatch } from './Form';
// export { FormField } from './FormField';
// export { FormLabel } from './FormLabel';
// export { FormMessage } from './FormMessage';

// ⚠️ CLIENT COMPONENTS - Import direct în Server Components!
export { LoadingState, SkeletonCard, SkeletonList, SkeletonTable } from './LoadingState';
export { ErrorState, ErrorNetwork, Error404, Error403, ErrorGeneric, InlineError, SuccessState } from './ErrorState';
export { EmptyState, EmptyProjects, EmptyFiles, EmptyOrders, EmptyNotifications, EmptySearch } from './EmptyState';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { ConfirmDialog, useConfirmDialog, confirmPresets } from './ConfirmDialog';
