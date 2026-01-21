import React from 'react';
import {
  useForm,
  FormProvider,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
  DefaultValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

export interface FormProps<TFieldValues extends FieldValues> {
  children: React.ReactNode;
  onSubmit: SubmitHandler<TFieldValues>;
  schema?: ZodSchema<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  className?: string;
  methods?: UseFormReturn<TFieldValues>;
  form?: UseFormReturn<TFieldValues>; // Alias pentru methods
}

export function Form<TFieldValues extends FieldValues>({
  children,
  onSubmit,
  schema,
  defaultValues,
  className = '',
  methods: externalMethods,
  form, // Alias pentru methods
}: FormProps<TFieldValues>) {
  // Folosim metodele externe dacă sunt furnizate, altfel creăm propriile metode
  const internalMethods = useForm<TFieldValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: 'onBlur',
  });

  const methods = form || externalMethods || internalMethods;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

// Hook pentru acces ușor la form context
export { useFormContext, useWatch } from 'react-hook-form';
