import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: any, defaultMessage: string): string => {
  console.error('[Error Details]:', error);

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle axios/HTTP errors
  if (error && typeof error === 'object') {
    // Check for API error response
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') return data;
      if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      if (data.message) return typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
    }

    // Check for error message
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    // Check for error code
    if (error.code && typeof error.code === 'string') {
      return error.code;
    }

    // Fallback for objects
    try {
      return JSON.stringify(error);
    } catch (e) {
      return String(error);
    }
  }
  
  // Return default message as fallback
  return defaultMessage || 'An error occurred';
}
