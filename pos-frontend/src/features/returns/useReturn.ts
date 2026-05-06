// ES: Hook para procesamiento de devoluciones
// EN: Hook for return processing

import { useState, useCallback } from 'react';
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter';
import { ApiError } from '../../infrastructure/http/axiosClient';
import type { Receipt } from '../../core/types/receipt.types';
import type { ReturnItemRequest } from '../../core/types/sale.types';

interface UseReturnReturn {
  isLoading: boolean;
  error: string | null;
  fullReturn: (saleId: string, reason: string) => Promise<Receipt | null>;
  partialReturn: (saleId: string, items: ReturnItemRequest[]) => Promise<Receipt | null>;
  clearError: () => void;
}

export function useReturn(): UseReturnReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ES: Procesa una devolución total
  // EN: Processes a full return
  const fullReturn = useCallback(async (saleId: string, reason: string): Promise<Receipt | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const receipt = await salesApiAdapter.fullReturn(saleId, reason);
      return receipt;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al procesar la devolución / Error processing return');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ES: Procesa una devolución parcial
  // EN: Processes a partial return
  const partialReturn = useCallback(async (saleId: string, items: ReturnItemRequest[]): Promise<Receipt | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const receipt = await salesApiAdapter.partialReturn(saleId, items);
      return receipt;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al procesar la devolución parcial / Error processing partial return');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, fullReturn, partialReturn, clearError };
}
