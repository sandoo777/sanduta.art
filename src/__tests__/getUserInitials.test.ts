import { describe, it, expect } from 'vitest';
import { getUserInitials } from '@/lib/getUserInitials';

describe('getUserInitials', () => {
  it('should return initials from full name', () => {
    expect(getUserInitials('Andrei Sandu')).toBe('AS');
    expect(getUserInitials('John Doe')).toBe('JD');
    expect(getUserInitials('Maria Elena Ionescu')).toBe('ME');
  });

  it('should handle single name', () => {
    expect(getUserInitials('Andrei')).toBe('AN');
    expect(getUserInitials('John')).toBe('JO');
  });

  it('should handle null or undefined', () => {
    expect(getUserInitials(null)).toBe('U');
    expect(getUserInitials(undefined)).toBe('U');
    expect(getUserInitials('')).toBe('U');
  });

  it('should handle names with extra spaces', () => {
    expect(getUserInitials('  Andrei   Sandu  ')).toBe('AS');
    expect(getUserInitials('John    Doe')).toBe('JD');
  });

  it('should return uppercase initials', () => {
    expect(getUserInitials('andrei sandu')).toBe('AS');
    expect(getUserInitials('john doe')).toBe('JD');
  });
});
