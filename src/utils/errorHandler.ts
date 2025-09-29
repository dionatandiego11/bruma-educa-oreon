import { PostgrestError } from '@supabase/supabase-js';
import { ErrorResponse } from '../types';

/**
 * Maps a PostgrestError to a standardized ErrorResponse object.
 * @param error The PostgrestError from Supabase.
 * @returns A standardized ErrorResponse object.
 */
export const toErrorResponse = (error: PostgrestError): ErrorResponse => {
  return {
    code: error.code,
    message: error.message,
    details: error.details,
  };
};

/**
 * Creates a new application-specific error response.
 * @param code A custom error code.
 * @param message A descriptive error message.
 * @param details Optional additional details.
 * @returns A standardized ErrorResponse object.
 */
export const createAppError = (code: string, message: string, details?: any): ErrorResponse => {
  return {
    code,
    message,
    details,
  };
};