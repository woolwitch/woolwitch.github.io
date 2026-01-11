/**
 * Formatting utilities for consistent data display across the application
 */

/**
 * Format a number as GBP currency with proper locale formatting
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "£12.34")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

/**
 * Format a date string into a readable format
 * @param dateString - ISO date string or null
 * @param options - Optional Intl.DateTimeFormatOptions to customize format
 * @returns Formatted date string or 'N/A' if null
 */
export function formatDate(
  dateString: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return 'N/A';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('en-GB', options || defaultOptions);
}

/**
 * Format a date string into a simple date format (without time)
 * @param dateString - ISO date string or null
 * @returns Formatted date string or 'N/A' if null
 */
export function formatDateShort(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB');
}
