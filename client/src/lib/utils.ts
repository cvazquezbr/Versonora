import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: any, defaultMessage: string): string => {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle axios/HTTP errors
  if (error && typeof error === 'object') {
    // Check for API error response
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      return typeof apiError === 'string' ? apiError : String(apiError);
    }
    // Check for error message
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    // Check for error code
    if (error.code && typeof error.code === 'string') {
      return error.code;
    }
  }
  
  // Return default message as fallback
  return defaultMessage || 'An error occurred';
}
