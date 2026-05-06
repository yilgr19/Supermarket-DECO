// ES: Hook para el proceso de checkout
// EN: Hook for the checkout process

import { useState, useCallback } from 'react';
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter';
import { useSaleStore } from '../../infrastructure/store/saleStore';
import { ApiError } from '../../infrastructure/http/axiosClient';
import type { Receipt } from '../../core/types/receipt.types';

interface CheckoutError {
  message: string;
  outOfStockItems?: { productId: string; productName: string; availableStock: number }[];
}

interface UseCheckoutReturn {
  isLoading: boolean;
  error: CheckoutError | null;
  checkoutCash: (amountReceived: number) => Promise<Receipt | null>;
  checkoutCredit: () => Promise<Receipt | null>;
  clearError: () => void;
}

export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);

  const { activeSale, selectedCustomer } = useSaleStore();

  const clearError = useCallback(() => setError(null), []);

  // ES: Checkout en efectivo — valida monto recibido ≥ total
  // EN: Cash checkout — validates amount received ≥ total
  const checkoutCash = useCallback(async (amountReceived: number): Promise<Receipt | null> => {
    if (!activeSale) {
      setError({ message: 'No hay venta activa / No active sale' });
      return null;
    }

    // ES: Validación local: monto recibido debe ser ≥ total
    // EN: Local validation: amount received must be ≥ total
    if (amountReceived < activeSale.total) {
      setError({
        message: `El monto recibido ($${amountReceived}) es menor al total ($${activeSale.total}) / Amount received ($${amountReceived}) is less than total ($${activeSale.total})`,
      });
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const receipt = await salesApiAdapter.checkout(activeSale.id, 'CASH', amountReceived);
      return receipt;
    } catch (err) {
      if (err instanceof ApiError) {
        setError({
          message: err.message,
          outOfStockItems: err.outOfStockItems?.map(item => ({
            productId: item.productId,
            productName: item.productName,
            availableStock: item.availableStock,
          })),
        });
      } else {
        setError({ message: 'Error al procesar el pago / Error processing payment' });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeSale]);

  // ES: Checkout a crédito — valida cliente y estado de crédito
  // EN: Credit checkout — validates customer and credit status
  const checkoutCredit = useCallback(async (): Promise<Receipt | null> => {
    if (!activeSale) {
      setError({ message: 'No hay venta activa / No active sale' });
      return null;
    }

    // ES: Validación local: cliente requerido para crédito
    // EN: Local validation: customer required for credit
    if (!selectedCustomer) {
      setError({ message: 'Se requiere un cliente para pago a crédito / A customer is required for credit payment' });
      return null;
    }

    // ES: Validación local: crédito debe estar aprobado
    // EN: Local validation: credit must be approved
    if (selectedCustomer.creditStatus !== 'APPROVED') {
      setError({
        message: `El crédito del cliente no está aprobado (estado: ${selectedCustomer.creditStatus}) / Customer credit is not approved (status: ${selectedCustomer.creditStatus})`,
      });
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const receipt = await salesApiAdapter.checkout(activeSale.id, 'CREDIT');
      return receipt;
    } catch (err) {
      if (err instanceof ApiError) {
        setError({
          message: err.message,
          outOfStockItems: err.outOfStockItems?.map(item => ({
            productId: item.productId,
            productName: item.productName,
            availableStock: item.availableStock,
          })),
        });
      } else {
        setError({ message: 'Error al procesar el pago a crédito / Error processing credit payment' });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, selectedCustomer]);

  return {
    isLoading,
    error,
    checkoutCash,
    checkoutCredit,
    clearError,
  };
}
