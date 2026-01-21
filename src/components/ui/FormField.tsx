import React from 'react';
import {
  useFormContext,
  Controller,
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form';

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  children?: (field: {
    value: any;
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    error?: string;
  }) => React.ReactNode;
  render?: (props: { field: ControllerRenderProps<TFieldValues> }) => React.ReactNode;
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  children,
  render,
}: FormFieldProps<TFieldValues>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  // Obținem eroarea pentru acest câmp
  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          {render ? render({ field }) : children ? children({
            ...field,
            error,
          }) : null}
        </>
      )}
    />
  );
}
