/**
 * Exemplu de integrare Form components într-un formular de contact real
 * 
 * Demonstrează:
 * - Validare Zod
 * - Loading state
 * - Error handling
 * - Success feedback
 * - Integrare cu API
 */

'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// Schema Zod cu validări reale
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Numele trebuie să aibă minim 2 caractere')
    .max(50, 'Numele este prea lung'),
  
  email: z.string()
    .email('Email invalid')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Telefonul trebuie să aibă 10 cifre')
    .optional()
    .or(z.literal('')),
  
  subject: z.string()
    .min(5, 'Subiectul trebuie să aibă minim 5 caractere')
    .max(100, 'Subiectul este prea lung'),
  
  message: z.string()
    .min(20, 'Mesajul trebuie să aibă minim 20 caractere')
    .max(1000, 'Mesajul este prea lung'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactFormExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Simulare API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Eroare la trimiterea mesajului');
      }

      setSuccessMessage('Mesajul a fost trimis cu succes! Vă vom contacta în curând.');
      
      // Reset form după succes (optional)
      // methods.reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'A apărut o eroare. Vă rugăm încercați din nou.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Formular de Contact</CardTitle>
      </CardHeader>
      <CardContent>
        <Form<ContactFormData>
          schema={contactSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
          }}
          className="space-y-4"
        >
          {/* Nume */}
          <FormField<ContactFormData> name="name">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="name" required>
                  Nume complet
                </FormLabel>
                <Input
                  id="name"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Ion Popescu"
                  disabled={isLoading}
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          {/* Email */}
          <FormField<ContactFormData> name="email">
            {({ value, onChange, onBlur, error }) => (
              <div>
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
                  placeholder="ion.popescu@exemplu.com"
                  disabled={isLoading}
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          {/* Telefon (opțional) */}
          <FormField<ContactFormData> name="phone">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="phone">
                  Telefon (opțional)
                </FormLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="0712345678"
                  disabled={isLoading}
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          {/* Subiect */}
          <FormField<ContactFormData> name="subject">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="subject" required>
                  Subiect
                </FormLabel>
                <Input
                  id="subject"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Cerere informații"
                  disabled={isLoading}
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          {/* Mesaj */}
          <FormField<ContactFormData> name="message">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="message" required>
                  Mesaj
                </FormLabel>
                <textarea
                  id="message"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`w-full border rounded-lg px-3 py-2 min-h-[120px] ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Scrieți mesajul dumneavoastră aici..."
                  disabled={isLoading}
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Se trimite...' : 'Trimite mesaj'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
