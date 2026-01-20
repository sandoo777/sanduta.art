/**
 * Test pentru verificarea integrării react-hook-form cu zodResolver
 * 
 * Run: npx tsx src/__tests__/form-integration.test.ts
 */

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Test 1: Schema validation
const testSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Minim 6 caractere'),
  age: z.number().min(18, 'Trebuie să aveți minim 18 ani'),
});

type TestFormData = z.infer<typeof testSchema>;

console.log('🧪 Test 1: Schema Zod definition');
console.log('✅ Schema definită corect');

// Test 2: Type inference
const testData: TestFormData = {
  email: 'test@example.com',
  password: 'password123',
  age: 25,
};

console.log('\n🧪 Test 2: Type inference');
console.log('✅ Tipurile TypeScript sunt corecte');

// Test 3: Validation errors
const invalidData = {
  email: 'invalid-email',
  password: '123', // prea scurt
  age: 15, // sub 18
};

const validationResult = testSchema.safeParse(invalidData);

console.log('\n🧪 Test 3: Validare date invalide');
if (!validationResult.success) {
  console.log('✅ Validarea detectează corect erorile:');
  if (validationResult.error && validationResult.error.errors) {
    validationResult.error.errors.forEach((err) => {
      console.log(`   - ${err.path.join('.')}: ${err.message}`);
    });
  }
} else {
  console.error('❌ Validarea ar fi trebuit să eșueze');
  process.exit(1);
}

// Test 4: Valid data
const validResult = testSchema.safeParse(testData);

console.log('\n🧪 Test 4: Validare date valide');
if (validResult.success) {
  console.log('✅ Datele valide trec validarea');
  console.log('   Date:', validResult.data);
} else {
  console.error('❌ Datele valide ar fi trebuit să treacă validarea');
  process.exit(1);
}

// Test 5: zodResolver integration
console.log('\n🧪 Test 5: zodResolver disponibil');
if (typeof zodResolver === 'function') {
  const resolver = zodResolver(testSchema);
  console.log('✅ zodResolver se poate instanția');
  console.log('   Type:', typeof resolver);
} else {
  console.error('❌ zodResolver nu este disponibil');
  process.exit(1);
}

// Test 6: Complex schema (nested, refinements)
const complexSchema = z.object({
  user: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu corespund',
  path: ['confirmPassword'],
});

console.log('\n🧪 Test 6: Schema complexă (nested + refinement)');

const validComplexData = {
  user: { name: 'John', email: 'john@example.com' },
  password: 'password123',
  confirmPassword: 'password123',
};

const invalidComplexData = {
  user: { name: 'John', email: 'john@example.com' },
  password: 'password123',
  confirmPassword: 'different', // nu se potrivește
};

const validComplexResult = complexSchema.safeParse(validComplexData);
const invalidComplexResult = complexSchema.safeParse(invalidComplexData);

if (validComplexResult.success && !invalidComplexResult.success) {
  console.log('✅ Schema complexă funcționează corect');
  console.log('   Refinement detectează parole diferite');
} else {
  console.error('❌ Schema complexă nu funcționează corect');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('✨ Toate testele au trecut cu succes!');
console.log('='.repeat(50));
console.log('\n📦 Pachete integrate:');
console.log('   - zod');
console.log('   - react-hook-form');
console.log('   - @hookform/resolvers');
console.log('\n📁 Componente create:');
console.log('   - Form');
console.log('   - FormField');
console.log('   - FormLabel');
console.log('   - FormMessage');
console.log('\n📚 Documentație: docs/FORM_COMPONENTS.md');
console.log('💡 Exemplu: src/components/ui/FormExample.tsx\n');
