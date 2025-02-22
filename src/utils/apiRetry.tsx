import axios, { AxiosError } from 'axios';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (retryCount: number, error: any) => void;
}

export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    retryDelay = 1000,
    onRetry 
  } = config;

  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's a 4xx error (client error)
      if (axios.isAxiosError(error) && error.response?.status?.toString().startsWith('4')) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}