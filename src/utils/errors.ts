/**
 * Error handling utilities for consistent error message extraction
 */

/**
 * Extract error message from various error types
 * @param error - The error object (unknown type)
 * @param fallbackMessage - Default message if error message cannot be extracted
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}
