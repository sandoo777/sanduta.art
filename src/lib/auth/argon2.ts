/**
 * ARGON2ID PASSWORD HASHING
 * ==========================
 * 
 * Upgrade de la bcrypt la Argon2id pentru securitate îmbunătățită.
 * Argon2id este standardul recomandat pentru hashing parole (2023+).
 * 
 * Features:
 * - Argon2id algorithm (hybrid: Argon2i + Argon2d)
 * - Memory-hard protection împotriva GPU attacks
 * - Timing attack resistant
 * - Configurable parameters
 * - Backwards compatible cu bcrypt
 * 
 * Usage:
 * import { hashPassword, verifyPassword } from '@/lib/auth/argon2';
 * 
 * const hash = await hashPassword('password123');
 * const isValid = await verifyPassword(hash, 'password123');
 */

import * as argon2 from '@node-rs/argon2';
import * as bcrypt from 'bcryptjs';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Argon2id parametri recomandate (OWASP 2023)
 * 
 * memoryCost: 65536 KB (64 MB) - resistant la GPU attacks
 * timeCost: 3 iterations - balance între securitate și performanță
 * parallelism: 4 threads - optimizat pentru servere moderne
 */
export const ARGON2_CONFIG = {
  memoryCost: 65536,  // 64 MB
  timeCost: 3,        // 3 iterations
  parallelism: 4,     // 4 threads
  type: argon2.argon2id, // Hybrid mode (recomandat)
  saltLength: 16,     // 16 bytes salt
  hashLength: 32,     // 32 bytes hash
} as const;

// ============================================
// HASH FUNCTIONS
// ============================================

/**
 * Hash password cu Argon2id
 * 
 * @param password - Plain text password
 * @returns Hashed password (format: $argon2id$v=19$m=65536,t=3,p=4$...)
 * 
 * @example
 * const hash = await hashPassword('password123');
 * // Returns: "$argon2id$v=19$m=65536,t=3,p=4$..."
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }
  
  if (password.length > 128) {
    throw new Error('Password too long (max 128 characters)');
  }
  
  try {
    const hash = await argon2.hash(password, {
      memoryCost: ARGON2_CONFIG.memoryCost,
      timeCost: ARGON2_CONFIG.timeCost,
      parallelism: ARGON2_CONFIG.parallelism,
      outputLen: ARGON2_CONFIG.hashLength,
    });
    
    return hash;
  } catch (_error) {
    console.error('Argon2 hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hash
 * Suportă atât Argon2id cât și bcrypt (backwards compatible)
 * 
 * @param hash - Stored hash (Argon2id sau bcrypt)
 * @param password - Plain text password
 * @returns true dacă parola este corectă
 * 
 * @example
 * const isValid = await verifyPassword(hash, 'password123');
 */
export async function verifyPassword(
  hash: string, 
  password: string
): Promise<boolean> {
  if (!hash || !password) {
    return false;
  }
  
  try {
    // Detectează tipul de hash
    if (hash.startsWith('$argon2')) {
      // Argon2id verification
      return await argon2.verify(hash, password);
    } else if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
      // bcrypt verification (backwards compatibility)
      return await bcrypt.compare(password, hash);
    } else {
      console.error('Unknown hash format');
      return false;
    }
  } catch (_error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// ============================================
// MIGRATION HELPERS
// ============================================

/**
 * Verifică dacă un hash este bcrypt și trebuie migrat
 * 
 * @param hash - Stored hash
 * @returns true dacă hash-ul este bcrypt
 */
export function needsMigration(hash: string): boolean {
  return hash.startsWith('$2a$') || hash.startsWith('$2b$');
}

/**
 * Rehash password de la bcrypt la Argon2id
 * Folosit în timpul login-ului pentru migrare transparentă
 * 
 * @param password - Plain text password
 * @param oldHash - bcrypt hash
 * @returns New Argon2id hash sau null dacă parola nu e corectă
 * 
 * @example
 * // În NextAuth callback:
 * const user = await prisma.user.findUnique({ where: { email } });
 * 
 * if (needsMigration(user.password)) {
 *   const newHash = await migratePassword(credentials.password, user.password);
 *   if (newHash) {
 *     await prisma.user.update({
 *       where: { id: user.id },
 *       data: { password: newHash },
 *     });
 *   }
 * }
 */
export async function migratePassword(
  password: string,
  oldHash: string
): Promise<string | null> {
  // Verifică dacă parola este corectă cu bcrypt
  const isValid = await bcrypt.compare(password, oldHash);
  
  if (!isValid) {
    return null;
  }
  
  // Hash cu Argon2id
  return await hashPassword(password);
}

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Estimează tăria parolei
 * 
 * @param password - Plain text password
 * @returns Strength score (0-4) și feedback
 */
export function estimatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Complexity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Adaugă litere mari și mici');
  }
  
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Adaugă cifre');
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Adaugă caractere speciale (!@#$%^&*)');
  }
  
  // Common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'admin'];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    score = Math.max(0, score - 2);
    feedback.push('Evită parole comune');
  }
  
  // Normalize score
  score = Math.min(4, Math.floor(score / 1.5));
  
  return { score, feedback };
}

/**
 * Validează cerințele minime pentru parolă
 * 
 * @param password - Plain text password
 * @returns true dacă parola îndeplinește cerințele
 * @throws Error cu mesaj descriptiv
 */
export function validatePasswordRequirements(password: string): boolean {
  if (password.length < 8) {
    throw new Error('Parola trebuie să aibă minimum 8 caractere');
  }
  
  if (password.length > 128) {
    throw new Error('Parola este prea lungă (maximum 128 caractere)');
  }
  
  if (!/[a-z]/.test(password)) {
    throw new Error('Parola trebuie să conțină cel puțin o literă mică');
  }
  
  if (!/[A-Z]/.test(password)) {
    throw new Error('Parola trebuie să conțină cel puțin o literă mare');
  }
  
  if (!/\d/.test(password)) {
    throw new Error('Parola trebuie să conțină cel puțin o cifră');
  }
  
  // Optional: special characters
  // if (!/[^a-zA-Z0-9]/.test(password)) {
  //   throw new Error('Parola trebuie să conțină cel puțin un caracter special');
  // }
  
  return true;
}

// ============================================
// TIMING ATTACK PROTECTION
// ============================================

/**
 * Constant-time string comparison
 * Protecție împotriva timing attacks
 * 
 * @param a - String A
 * @param b - String B
 * @returns true dacă strings sunt egale
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// ============================================
// BENCHMARKING
// ============================================

/**
 * Benchmark Argon2id performance
 * Folosit pentru tuning parametri
 * 
 * @param password - Test password
 * @returns Execution time în ms
 */
export async function benchmarkHashing(password: string = 'test123'): Promise<number> {
  const start = performance.now();
  await hashPassword(password);
  const end = performance.now();
  
  return Math.round(end - start);
}

/**
 * Test multiple configurații Argon2id
 * 
 * @returns Benchmark results
 */
export async function benchmarkConfigs(): Promise<{
  config: string;
  time: number;
}[]> {
  const configs = [
    { name: 'Low (32MB, t=2)', memoryCost: 32768, timeCost: 2 },
    { name: 'Medium (64MB, t=3)', memoryCost: 65536, timeCost: 3 },
    { name: 'High (128MB, t=4)', memoryCost: 131072, timeCost: 4 },
  ];
  
  const results = [];
  
  for (const config of configs) {
    const start = performance.now();
    
    await argon2.hash('test123', {
      memoryCost: config.memoryCost,
      timeCost: config.timeCost,
      parallelism: 4,
    });
    
    const end = performance.now();
    
    results.push({
      config: config.name,
      time: Math.round(end - start),
    });
  }
  
  return results;
}

// ============================================
// EXPORTS
// ============================================

export default {
  hash: hashPassword,
  verify: verifyPassword,
  needsMigration,
  migrate: migratePassword,
  estimateStrength: estimatePasswordStrength,
  validate: validatePasswordRequirements,
  benchmark: benchmarkHashing,
};
