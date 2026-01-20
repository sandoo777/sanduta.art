import React from 'react';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  Button,
} from '@/components/ui';

// Exemplu de schemă Zod
const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginFormExample() {
  const handleSubmit = (data: LoginFormData) => {
    console.log('Form data:', data);
    // Aici trimiteți datele la API
  };

  return (
    <Form<LoginFormData>
      schema={loginSchema}
      onSubmit={handleSubmit}
      defaultValues={{
        email: '',
        password: '',
      }}
      className="space-y-4 max-w-md"
    >
      <div>
        <FormField<LoginFormData> name="email">
          {({ value, onChange, onBlur, error }) => (
            <>
              <FormLabel htmlFor="email" required>
                Email
              </FormLabel>
              <Input
                id="email"
                type="email"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error}
                placeholder="nume@exemplu.com"
              />
              <FormMessage error={error} />
            </>
          )}
        </FormField>
      </div>

      <div>
        <FormField<LoginFormData> name="password">
          {({ value, onChange, onBlur, error }) => (
            <>
              <FormLabel htmlFor="password" required>
                Parolă
              </FormLabel>
              <Input
                id="password"
                type="password"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error}
                placeholder="••••••••"
              />
              <FormMessage error={error} />
            </>
          )}
        </FormField>
      </div>

      <Button type="submit" variant="primary" className="w-full">
        Autentificare
      </Button>
    </Form>
  );
}

// Exemplu cu form control extern (pentru reset, dirty state, etc.)
export function AdvancedFormExample() {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = (data: LoginFormData) => {
    console.log('Form data:', data);
    methods.reset(); // Reset form după submit
  };

  return (
    <div>
      <Form<LoginFormData>
        methods={methods}
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md"
      >
        {/* ... câmpuri form ... */}
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Form>

      {/* Acces la starea formularului în afara Form */}
      {methods.formState.isDirty && (
        <p className="text-orange-600 mt-2">
          Aveți modificări nesalvate
        </p>
      )}
    </div>
  );
}
