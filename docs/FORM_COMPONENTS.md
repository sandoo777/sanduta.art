# Form Components Documentation

## 📦 Instalare

Pachetele necesare sunt deja instalate:
- `react-hook-form` - Core form library
- `@hookform/resolvers` - Resolver pentru Zod și alte scheme
- `zod` - Schema validation

## 🎯 Componente disponibile

### 1. Form
Wrapper principal pentru formulare cu suport pentru validare Zod.

**Props:**
- `onSubmit: (data: T) => void` - Handler pentru submit (primește date validate)
- `schema?: ZodSchema` - Schema Zod pentru validare (opțional)
- `defaultValues?: DefaultValues<T>` - Valori inițiale
- `className?: string` - Clase CSS personalizate
- `methods?: UseFormReturn<T>` - Instanță externă useForm (pentru control avansat)

**Exemplu simplu:**
```tsx
import { Form } from '@/components/ui';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Email invalid'),
  name: z.string().min(2, 'Numele este prea scurt'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const handleSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <Form<FormData>
      schema={schema}
      onSubmit={handleSubmit}
      defaultValues={{ email: '', name: '' }}
    >
      {/* câmpuri */}
    </Form>
  );
}
```

### 2. FormField
Controller pentru câmpuri individuale cu acces la validare.

**Props:**
- `name: string` - Numele câmpului (din schema)
- `children: (field) => ReactNode` - Render prop cu `value`, `onChange`, `onBlur`, `error`

**Exemplu:**
```tsx
<FormField<FormData> name="email">
  {({ value, onChange, onBlur, error }) => (
    <>
      <FormLabel htmlFor="email" required>Email</FormLabel>
      <Input
        id="email"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
      />
      <FormMessage error={error} />
    </>
  )}
</FormField>
```

### 3. FormLabel
Label stilizat pentru câmpuri cu indicator pentru câmpuri obligatorii.

**Props:**
- `htmlFor?: string` - ID-ul câmpului asociat
- `required?: boolean` - Afișează asterisk roșu
- `className?: string` - Clase CSS personalizate

**Exemplu:**
```tsx
<FormLabel htmlFor="email" required>
  Adresa de email
</FormLabel>
```

### 4. FormMessage
Afișează mesaje de eroare (sau succes/info).

**Props:**
- `error?: string` - Mesajul de afișat
- `type?: 'error' | 'success' | 'info'` - Tipul mesajului (default: 'error')
- `className?: string` - Clase CSS personalizate

**Exemplu:**
```tsx
<FormMessage error={errors.email?.message} />
<FormMessage error="Salvat cu succes!" type="success" />
```

## 🚀 Pattern-uri de utilizare

### Pattern 1: Formular simplu cu validare Zod
```tsx
import { Form, FormField, FormLabel, FormMessage, Input, Button } from '@/components/ui';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Numele este obligatoriu'),
  email: z.string().email('Email invalid'),
  message: z.string().min(10, 'Mesajul trebuie să aibă minim 10 caractere'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const handleSubmit = async (data: ContactFormData) => {
    try {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      alert('Mesaj trimis!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form<ContactFormData>
      schema={contactSchema}
      onSubmit={handleSubmit}
      defaultValues={{ name: '', email: '', message: '' }}
      className="space-y-4"
    >
      <FormField<ContactFormData> name="name">
        {({ value, onChange, onBlur, error }) => (
          <div>
            <FormLabel htmlFor="name" required>Nume</FormLabel>
            <Input
              id="name"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
            />
            <FormMessage error={error} />
          </div>
        )}
      </FormField>

      <FormField<ContactFormData> name="email">
        {({ value, onChange, onBlur, error }) => (
          <div>
            <FormLabel htmlFor="email" required>Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={error}
            />
            <FormMessage error={error} />
          </div>
        )}
      </FormField>

      <FormField<ContactFormData> name="message">
        {({ value, onChange, onBlur, error }) => (
          <div>
            <FormLabel htmlFor="message" required>Mesaj</FormLabel>
            <textarea
              id="message"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              className="w-full border rounded px-3 py-2"
              rows={4}
            />
            <FormMessage error={error} />
          </div>
        )}
      </FormField>

      <Button type="submit" variant="primary">
        Trimite mesaj
      </Button>
    </Form>
  );
}
```

### Pattern 2: Control avansat (reset, dirty state, manual validation)
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function AdvancedForm() {
  const methods = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
    mode: 'onBlur', // Validare la blur
  });

  const handleSubmit = (data: ContactFormData) => {
    console.log(data);
    methods.reset(); // Reset după submit
  };

  const handleCancel = () => {
    methods.reset(); // Reset manual
  };

  return (
    <div>
      <Form<ContactFormData>
        methods={methods}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* ... câmpuri ... */}
        
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Salvează
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!methods.formState.isDirty}
          >
            Anulează
          </Button>
        </div>
      </Form>

      {/* Indicator modificări nesalvate */}
      {methods.formState.isDirty && (
        <p className="text-orange-600 mt-2">
          ⚠️ Aveți modificări nesalvate
        </p>
      )}
    </div>
  );
}
```

### Pattern 3: Integrare cu Select component
```tsx
<FormField<FormData> name="category">
  {({ value, onChange, error }) => (
    <div>
      <FormLabel htmlFor="category" required>Categorie</FormLabel>
      <Select
        id="category"
        value={value}
        onChange={onChange}
        options={[
          { value: 'tech', label: 'Tehnologie' },
          { value: 'design', label: 'Design' },
        ]}
        error={error}
      />
      <FormMessage error={error} />
    </div>
  )}
</FormField>
```

### Pattern 4: Validare complexă (cross-field)
```tsx
const passwordSchema = z.object({
  password: z.string().min(8, 'Minim 8 caractere'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu corespund',
  path: ['confirmPassword'], // Specifică câmpul cu eroare
});
```

## 🎨 Stilizare

Toate componentele suportă clase CSS personalizate:

```tsx
<FormLabel className="text-lg font-bold">Label mare</FormLabel>
<FormMessage className="pl-4" error="Custom styled error" />
```

## ♿ Accesibilitate

- `FormLabel` folosește `htmlFor` pentru asociere cu input
- `FormMessage` are `role="alert"` pentru screen readers
- Form dezactivează validarea HTML5 nativă (`noValidate`) pentru control complet

## 🔧 Hooks utile

Export-uri adiționale din `Form.tsx`:
- `useFormContext()` - Acces la context-ul formularului în componente nested
- `useWatch()` - Monitorizare valori în timp real

```tsx
import { useFormContext, useWatch } from '@/components/ui';

function NestedComponent() {
  const { formState } = useFormContext();
  const emailValue = useWatch({ name: 'email' });

  return <div>Email curent: {emailValue}</div>;
}
```

## ✅ Best Practices

1. **Folosiți TypeScript generic-uri** pentru type-safety:
   ```tsx
   <Form<LoginFormData> ... />
   <FormField<LoginFormData> name="email" ... />
   ```

2. **Definiți schema Zod o singură dată** și inferați tipul:
   ```tsx
   const schema = z.object({ ... });
   type FormData = z.infer<typeof schema>;
   ```

3. **Validare la blur** (default) pentru UX mai bun:
   ```tsx
   mode: 'onBlur' // în useForm config
   ```

4. **Reset după submit** pentru formulare repetabile:
   ```tsx
   methods.reset();
   ```

5. **Indicator pentru modificări nesalvate**:
   ```tsx
   {methods.formState.isDirty && <Warning />}
   ```

## 📚 Resurse

- [react-hook-form docs](https://react-hook-form.com/)
- [Zod docs](https://zod.dev/)
- [Exemplu complet](./FormExample.tsx)
