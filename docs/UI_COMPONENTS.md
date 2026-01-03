# UI Components Documentation

## Overview

Unified UI component system for consistent styling across the entire application. All components are built with TypeScript, TailwindCSS, and support customization via className prop.

## Components

### Button

Versatile button component with multiple variants and sizes.

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'success' | 'ghost'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `fullWidth`: `boolean` (default: `false`)
- `loading`: `boolean` (default: `false`) - Shows spinner
- All standard button HTML attributes

**Usage:**
```tsx
import { Button } from '@/components/ui';

// Primary button
<Button onClick={handleClick}>Click me</Button>

// Secondary full-width button
<Button variant="secondary" fullWidth>
  Submit
</Button>

// Loading state
<Button loading disabled>
  Processing...
</Button>

// With custom className
<Button className="mt-4">Custom Styling</Button>
```

**Variants:**
- **primary**: Blue background, white text (main actions)
- **secondary**: Gray background, dark text (secondary actions)
- **danger**: Red background, white text (destructive actions)
- **success**: Green background, white text (positive actions)
- **ghost**: Transparent background, gray text (tertiary actions)

---

### Input

Text input with label, error state, and helper text support.

**Props:**
- `label`: `string` - Input label
- `error`: `string` - Error message to display
- `helperText`: `string` - Helper text below input
- `fullWidth`: `boolean` (default: `true`)
- All standard input HTML attributes

**Usage:**
```tsx
import { Input } from '@/components/ui';

// Basic input with label
<Input 
  label="Email" 
  type="email" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// With error
<Input 
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// With helper text
<Input 
  label="Phone"
  helperText="Format: +380501234567"
  placeholder="+380501234567"
/>
```

**Features:**
- Automatic label-input association
- Red border on error
- Shows asterisk (*) for required fields
- Focus ring (blue by default)

---

### Select

Dropdown select with label and error support.

**Props:**
- `label`: `string` - Select label
- `options`: `SelectOption[]` - Array of `{value, label}` objects
- `placeholder`: `string` - Placeholder option
- `error`: `string` - Error message
- `helperText`: `string` - Helper text
- `fullWidth`: `boolean` (default: `true`)
- All standard select HTML attributes

**Usage:**
```tsx
import { Select } from '@/components/ui';

const paymentOptions = [
  { value: 'card', label: 'Банковская карта' },
  { value: 'cash', label: 'Наложенный платеж' },
];

<Select
  label="Способ оплаты"
  options={paymentOptions}
  placeholder="Выберите способ оплаты"
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
  required
/>
```

---

### Card

Container component for grouping related content.

**Props:**
- `children`: `ReactNode` - Card content
- `padding`: `'none' | 'sm' | 'md' | 'lg'` (default: `'md'`)
- `shadow`: `'none' | 'sm' | 'md' | 'lg'` (default: `'md'`)
- `hover`: `boolean` (default: `false`) - Hover shadow effect
- `className`: `string` - Additional classes

**Subcomponents:**
- `CardHeader` - Card header section
- `CardTitle` - Styled title
- `CardContent` - Main content area
- `CardFooter` - Footer with top border

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

// Simple card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Structured card
<Card padding="lg" shadow="lg" hover>
  <CardHeader>
    <CardTitle>Order #12345</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Order details...</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>

// No padding (for images)
<Card padding="none">
  <img src="..." alt="..." />
  <div className="p-4">
    <p>Image caption</p>
  </div>
</Card>
```

---

### Badge

Small label for status, counts, or tags.

**Props:**
- `variant`: `'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'` (default: `'default'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `children`: `ReactNode` - Badge content
- `className`: `string`

**Usage:**
```tsx
import { Badge, StatusBadge } from '@/components/ui';

// Basic badge
<Badge>New</Badge>

// Colored variants
<Badge variant="success">Active</Badge>
<Badge variant="danger">Urgent</Badge>
<Badge variant="warning">Pending</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="lg">Large</Badge>

// StatusBadge for orders (auto-colors)
<StatusBadge status="pending" />
<StatusBadge status="completed" />
<StatusBadge status="shipped" />
```

**StatusBadge** automatically maps order statuses to colors:
- `pending` → yellow (В ожидании)
- `processing` → cyan (В обработке)
- `completed` → green (Завершен)
- `cancelled` → red (Отменен)
- `paid` → green (Оплачен)
- `failed` → red (Ошибка)
- `shipped` → cyan (Отправлен)
- `delivered` → green (Доставлен)

---

### SectionTitle / PageTitle

Consistent heading components for sections and pages.

**SectionTitle Props:**
- `children`: `ReactNode` - Title text
- `subtitle`: `string` - Optional subtitle
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'lg'`)
- `align`: `'left' | 'center' | 'right'` (default: `'left'`)
- `className`: `string`

**PageTitle Props:**
- `children`: `ReactNode` - Title text
- `subtitle`: `string` - Optional subtitle
- `className`: `string`

**Usage:**
```tsx
import { SectionTitle, PageTitle } from '@/components/ui';

// Page title
<PageTitle subtitle="Manage your account settings">
  Account Settings
</PageTitle>

// Section title
<SectionTitle size="md" align="center">
  Featured Products
</SectionTitle>

// With subtitle
<SectionTitle 
  subtitle="Browse our collection of handmade art"
  size="xl"
>
  Our Products
</SectionTitle>
```

---

## Design Tokens

### Colors

**Primary (Blue):**
- Default: `#2563eb` (blue-600)
- Hover: `#1d4ed8` (blue-700)
- Light: `#3b82f6` (blue-500)

**Status Colors:**
- Success: `#10b981` (green-600)
- Warning: `#f59e0b` (yellow-500)
- Danger: `#dc2626` (red-600)
- Info: `#06b6d4` (cyan-500)

**Neutral:**
- Text: `#1f2937` (gray-900)
- Muted: `#6b7280` (gray-600)
- Border: `#e5e7eb` (gray-300)
- Background: `#f9fafb` (gray-50)

### Spacing

- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)

### Border Radius

- Default: `0.5rem` (8px)
- Full: `9999px` (pill shape for badges)

### Shadows

- `sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- `md`: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- `lg`: `0 10px 15px -3px rgb(0 0 0 / 0.1)`

---

## Usage Examples

### Login Form

```tsx
import { Card, Input, Button } from '@/components/ui';

<Card>
  <h1 className="text-3xl font-bold text-center mb-6">Вход</h1>
  <form className="space-y-4">
    <Input
      type="email"
      label="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <Input
      type="password"
      label="Пароль"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <Button type="submit" fullWidth loading={loading}>
      Войти
    </Button>
  </form>
</Card>
```

### Order Card

```tsx
import { Card, StatusBadge, Button } from '@/components/ui';

<Card padding="lg" hover>
  <div className="flex justify-between mb-4">
    <div>
      <h2 className="text-lg font-semibold">
        Заказ #{order.id.slice(0, 8)}
      </h2>
      <p className="text-sm text-gray-600">
        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
      </p>
    </div>
    <p className="text-2xl font-bold text-blue-600">
      {order.total} ₽
    </p>
  </div>
  
  <div className="grid grid-cols-3 gap-4 mb-4">
    <div>
      <p className="text-sm text-gray-600 mb-1">Статус заказа</p>
      <StatusBadge status={order.status} />
    </div>
    <div>
      <p className="text-sm text-gray-600 mb-1">Статус оплаты</p>
      <StatusBadge status={order.paymentStatus} />
    </div>
    <div>
      <p className="text-sm text-gray-600 mb-1">Статус доставки</p>
      <StatusBadge status={order.deliveryStatus} />
    </div>
  </div>
  
  <div className="border-t pt-4">
    <a href={`/account/orders/${order.id}`}>
      <Button fullWidth>Просмотреть детали</Button>
    </a>
  </div>
</Card>
```

### Product Filter Form

```tsx
import { Select, Input, Button } from '@/components/ui';

const categories = [
  { value: 'all', label: 'Все категории' },
  { value: 'paintings', label: 'Картины' },
  { value: 'sculptures', label: 'Скульптуры' },
];

<form className="space-y-4">
  <Select
    label="Категория"
    options={categories}
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  />
  <Input
    label="Поиск"
    placeholder="Название товара..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <div className="flex gap-2">
    <Button type="submit">Применить</Button>
    <Button variant="secondary" onClick={handleReset}>
      Сбросить
    </Button>
  </div>
</form>
```

---

## Customization

All components accept a `className` prop for additional styling:

```tsx
// Add margin
<Button className="mt-4 mb-2">Click</Button>

// Override width
<Input className="max-w-xs" />

// Custom colors (override defaults)
<Badge className="bg-purple-100 text-purple-800">
  Custom Color
</Badge>
```

### Extending Components

Create variant components:

```tsx
// CustomButton.tsx
import { Button, ButtonProps } from '@/components/ui';

export const PrimaryLargeButton = (props: ButtonProps) => (
  <Button variant="primary" size="lg" {...props} />
);
```

---

## Best Practices

1. **Consistency**: Always use UI components instead of custom inline styles
2. **Semantic HTML**: Components render proper HTML elements (button, input, etc.)
3. **Accessibility**: All inputs have labels, focus states, and proper ARIA attributes
4. **Loading States**: Use `loading` prop on buttons during async operations
5. **Error Handling**: Pass error messages to Input/Select components
6. **Spacing**: Use Tailwind spacing utilities (`space-y-4`, `gap-4`, etc.)

---

## Migration Guide

### Before (inline styles):

```tsx
<button className="w-full bg-blue-500 text-white p-2 rounded">
  Login
</button>

<input
  type="email"
  className="w-full p-2 border rounded"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### After (UI components):

```tsx
<Button fullWidth>
  Login
</Button>

<Input
  type="email"
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

## Component Checklist

When creating new pages/features:

- [ ] Use `PageTitle` for page headings
- [ ] Use `SectionTitle` for section headings
- [ ] Wrap forms in `Card` components
- [ ] Use `Input` and `Select` for form fields
- [ ] Use `Button` for all actions
- [ ] Use `StatusBadge` for order statuses
- [ ] Use `Badge` for labels and tags
- [ ] Add loading states to async buttons
- [ ] Show error messages via Input/Select `error` prop
- [ ] Maintain consistent spacing (space-y-4, gap-4)

---

## Future Enhancements

Planned components:
- **Modal** - Dialog overlays
- **Toast** - Notification messages
- **Tabs** - Tab navigation
- **Checkbox/Radio** - Styled form controls
- **Textarea** - Multi-line text input
- **Tooltip** - Hover information
- **Dropdown** - Menu dropdowns
- **Pagination** - Page navigation
- **Table** - Data tables

---

## Support

For questions or issues with UI components:
1. Check this documentation
2. Review component source code in `src/components/ui/`
3. Check TypeScript types for available props
4. Look at usage examples in existing pages
