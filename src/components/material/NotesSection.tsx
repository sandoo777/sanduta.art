'use client';

import { useFormContext } from 'react-hook-form';
import { FormLabel } from '@/components/ui/FormLabel';
import type { MaterialFormData } from '@/lib/validations/admin';

export function NotesSection() {
  const form = useFormContext<MaterialFormData>();

  return (
    <div className="space-y-3">
      <FormLabel>Note interne</FormLabel>
      <textarea
        {...form.register('notes')}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        rows={5}
        placeholder="Furnizor, condiții de depozitare, specificații tehnice..."
      />
    </div>
  );
}
