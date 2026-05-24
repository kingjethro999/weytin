/**
 * Error normalizer for Weytin Platform.
 * Ensures all errors follow a consistent structure for UI rendering and logging.
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  originalError?: unknown;
}

interface ErrorWithCode {
  message: string;
  code: string;
}

function isErrorWithCode(value: unknown): value is ErrorWithCode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'code' in value &&
    typeof (value as { message: unknown }).message === 'string' &&
    typeof (value as { code: unknown }).code === 'string'
  );
}

function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string' &&
    'originalError' in value
  );
}

export function normaliseError(error: unknown): AppError {
  // If it's already an AppError, return as is
  if (isAppError(error)) {
    return error;
  }

  // Handle Supabase errors
  if (isErrorWithCode(error)) {
    return {
      message: error.message,
      code: error.code,
      originalError: error,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      originalError: error,
    };
  }

  // Handle strings
  if (typeof error === 'string') {
    return {
      message: error,
      originalError: new Error(error),
    };
  }

  // Fallback
  return {
    message: 'An unexpected error occurred. Please try again later.',
    originalError: error,
  };
}
