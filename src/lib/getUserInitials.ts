/**
 * Utility function to generate user initials from name
 * @param name - Full name or email
 * @returns Uppercase initials (max 2 letters)
 */
export function getUserInitials(name?: string | null): string {
  if (!name) return 'U'; // Default for User

  // Remove extra spaces and split by space
  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    // Single word (first name or email) - take first 2 letters
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Multiple words - take first letter of first two words
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
