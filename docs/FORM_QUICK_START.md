# Form Components - Quick Start Guide

## 🚀 Setup rapid (5 minute)

### 1. Import componente
```tsx
import { Form, FormField, FormLabel, FormMessage, Input, Button } from '@/components/ui';
import { z } from 'zod';
```

### 2. Definește schema Zod
```tsx
const mySchema = z.object({
  email: z.string().email('Email invalid'),
  name: z.string().min(2, 'Prea scurt'),
});

type FormData = z.infer<typeof mySchema>;
```

### 3. Creează formularul
```tsx
function MyForm() {
  const handleSubmit = (data: FormData) => {
    console.log(data); // Date validate automat!
  };

  return (
    <Form<FormData>
      schema={mySchema}
      onSubmit={handleSubmit}
      defaultValues={{ email: '', name: '' }}
    >
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

      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

---

## 📋 Recipes (copy-paste ready)

### Recipe 1: Login form
```tsx
const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Minim 6 caractere'),
});

type LoginData = z.infer<typeof loginSchema>;

function LoginForm() {
  return (
    <Form<LoginData>
      schema={loginSchema}
      onSubmit={(data) => console.log(data)}
      defaultValues={{ email: '', password: '' }}
    >
      {/* Email field */}
      <FormField<LoginData> name="email">
        {({ value, onChange, onBlur, error }) => (
          <div>
            <FormLabel htmlFor="email" required>Email</FormLabel>
            <Input id="email" type="email" value={value} onChange={onChange} onBlur={onBlur} error={error} />
            <FormMessage error={error} />
          </div>
        )}
      </FormField>

      {/* Password field */}
      <FormField<LoginData> name="password">
        {({ value, onChange, onBlur, error }) => (
          <div>
            <FormLabel htmlFor="password" required>Parolă</FormLabel>
            <Input id="password" type="password" value={value} onChange={onChange} onBlur={onBlur} error={error} />
            <FormMessage error={error} />
          </div>
        )}
      </FormField>

      <Button type="submit">Login</Button>
    </Form>
  );
}
```

### Recipe 2: Form cu loading state
```tsx
function FormWithLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form schema={mySchema} onSubmit={handleSubmit}>
      {/* fields */}
      <Button type="submit" loading={isLoading}>
        {isLoading ? 'Se trimite...' : 'Trimite'}
      </Button>
    </Form>
  );
}
```

### Recipe 3: Form cu Select
```tsx
import { Select } from '@/components/ui';

<FormField<FormData> name="category">
  {({ value, onChange, error }) => (
    <div>
      <FormLabel htmlFor="category" required>Categorie</FormLabel>
      <Select
        id="category"
        value={value}
        onChange={onChange}
        options={[
          { value: 'option1', label: 'Opțiune 1' },
          { value: 'option2', label: 'Opțiune 2' },
        ]}
        error={error}
      />
      <FormMessage error={error} />
    </div>
  )}
</FormField>
```

### Recipe 4: Textarea
```tsx
<FormField<FormData> name="message">
  {({ value, onChange, onBlur, error }) => (
    <div>
      <FormLabel htmlFor="message" required>Mesaj</FormLabel>
      <textarea
        id="message"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full border rounded px-3 py-2 ${error ? 'border-red-500' : ''}`}
        rows={4}
      />
      <FormMessage error={error} />
    </div>
  )}
</FormField>
```

### Recipe 5: Validare parole identice
```tsx
const passwordSchema = z.object({
  password: z.string().min(8, 'Minim 8 caractere'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu corespund',
  path: ['confirmPassword'], // Eroarea apare pe confirmPassword
});
```

### Recipe 6: Control manual (reset, dirty state)
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function AdvancedForm() {
  const methods = useForm<FormData>({
    resolver: zodResolver(mySchema),
    defaultValues: { email: '', name: '' },
  });

  const handleSubmit = (data: FormData) => {
    console.log(data);
    methods.reset(); // Reset după submit
  };

  return (
    <>
      <Form<FormData> methods={methods} onSubmit={handleSubmit}>
        {/* fields */}
        <Button type="submit">Submit</Button>
      </Form>

      {/* Indicator modificări */}
      {methods.formState.isDirty && (
        <p className="text-orange-600">⚠️ Modificări nesalvate</p>
      )}
    </>
  );
}
```

---

## 🎨 Validări Zod comune

```tsx
// Email
z.string().email('Email invalid')

// String cu lungime
z.string().min(2, 'Minim 2 caractere').max(50, 'Maxim 50')

// Număr
z.number().min(18, 'Minim 18').max(100, 'Maxim 100')

// Opțional
z.string().optional()
z.string().optional().or(z.literal(''))

// URL
z.string().url('URL invalid')

// Regex (telefon)
z.string().regex(/^[0-9]{10}$/, 'Format invalid')

// Enum
z.enum(['option1', 'option2'], { message: 'Selectează o opțiune' })

// Boolean
z.boolean()

// Date
z.date()

// Transform (lowercase)
z.string().email().toLowerCase()

// Custom validation
z.string().refine((val) => val.includes('@'), {
  message: 'Trebuie să conțină @',
})
```

---

## ⚠️ Common pitfalls

### ❌ NU face așa:
```tsx
// GREȘIT: Lipsește generic type
<Form schema={schema} onSubmit={handleSubmit}>
<FormField name="email">

// GREȘIT: Nu folosești error prop
<Input value={value} onChange={onChange} />

// GREȘIT: Uiți onBlur
<Input value={value} onChange={onChange} />
```

### ✅ Face așa:
```tsx
// CORECT: Cu generic types
<Form<FormData> schema={schema} onSubmit={handleSubmit}>
<FormField<FormData> name="email">

// CORECT: Cu error prop
<Input value={value} onChange={onChange} error={error} />

// CORECT: Cu onBlur pentru validare
<Input value={value} onChange={onChange} onBlur={onBlur} error={error} />
```

---

## 🔍 Debugging

### Verifică datele formularului în timp real:
```tsx
import { useWatch } from '@/components/ui';

function DebugForm() {
  const formData = useWatch(); // Toate câmpurile
  const emailValue = useWatch({ name: 'email' }); // Un câmp specific

  return <pre>{JSON.stringify(formData, null, 2)}</pre>;
}
```

### Verifică erorile:
```tsx
import { useFormContext } from '@/components/ui';

function FormErrors() {
  const { formState } = useFormContext();
  
  return (
    <pre>
      {JSON.stringify(formState.errors, null, 2)}
    </pre>
  );
}
```

---

## 📚 Resurse

- **Documentație completă:** `docs/FORM_COMPONENTS.md`
- **Exemple:** `src/components/ui/FormExample.tsx`, `ContactFormExample.tsx`
- **React Hook Form:** https://react-hook-form.com/
- **Zod:** https://zod.dev/

---

**Last updated:** 2026-01-20
