// ES: Hook para obtener y mostrar recibos
// EN: Hook for fetching and displaying receipts

import { useState, useCallback } from 'react';
import axiosInstance from '../../infrastructure/http/axiosClient';
import { ApiError } from '../../infrastructure/http/axiosClient';
import type { Receipt } from '../../core/types/receipt.types';

interface UseReceiptReturn {
  receipt: Receipt | null;
  isLoading: boolean;
  error: string | null;
  getReceipt: (transactionId: string) => Promise<void>;
}

export function useReceipt(): UseReceiptReturn {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ES: Obtiene un recibo por ID de transacción
  // EN: Gets a receipt by transaction ID
  const getReceipt = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<Receipt>(`/api/v1/receipts/${transactionId}`);
      setReceipt(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al obtener el recibo / Error fetching receipt');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { receipt, isLoading, error, getReceipt };
}
