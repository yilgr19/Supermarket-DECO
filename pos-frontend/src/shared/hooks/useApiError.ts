// ES: Hook para manejo de errores de la API
// EN: Hook for API error handling

import { useState } from 'react';
import { ApiError } from '../../infrastructure/http/axiosClient';

export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      setError(err.message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Error desconocido / Unknown error');
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}
