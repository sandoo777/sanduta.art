// UI Components
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

// Form Components
// ВАЖНО: Form, FormField, FormLabel, FormMessage используют react-hook-form
// и должны импортироваться НАПРЯМУЮ из своих файлов, НЕ через barrel file
// ❌ import { Form } from '@/components/ui'
// ✅ import { Form } from '@/components/ui/Form'
// export { Form, useFormContext, useWatch } from './Form';
// export { FormField } from './FormField';
// export { FormLabel } from './FormLabel';
// export { FormMessage } from './FormMessage';

// State Components
export { LoadingState, SkeletonCard, SkeletonList, SkeletonTable } from './LoadingState';
export { ErrorState, ErrorNetwork, Error404, Error403, ErrorGeneric, InlineError, SuccessState } from './ErrorState';
export { EmptyState, EmptyProjects, EmptyFiles, EmptyOrders, EmptyNotifications, EmptySearch } from './EmptyState';

// Modal Component
export { Modal } from './Modal';
export type { ModalProps } from './Modal';

// Confirm Dialog
export { ConfirmDialog, useConfirmDialog, confirmPresets } from './ConfirmDialog';
