// ES: Hook principal para gestión de la venta activa
// EN: Main hook for active sale management

import { useState, useCallback } from 'react';
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter';
import { useSaleStore } from '../../infrastructure/store/saleStore';
import { useSessionStore } from '../../infrastructure/store/sessionStore';
import { ApiError } from '../../infrastructure/http/axiosClient';
import type { DiscountType } from '../../core/types/sale.types';

interface UseSaleReturn {
  isLoading: boolean;
  error: string | null;
  stockError: { message: string; items?: { productId: string; productName: string; availableStock: number }[] } | null;
  createSale: () => Promise<void>;
  addItemToSale: (productId?: string, barcode?: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscount: (type: DiscountType, value: number) => Promise<void>;
  removeDiscount: () => Promise<void>;
  freezeSale: () => Promise<void>;
  resumeSale: (saleId: string) => Promise<void>;
  cancelSale: (reason: string) => Promise<void>;
  clearError: () => void;
}

export function useSale(): UseSaleReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<{
    message: string;
    items?: { productId: string; productName: string; availableStock: number }[];
  } | null>(null);

  const { activeSale, setActiveSale } = useSaleStore();
  const { terminalId } = useSessionStore();

  const clearError = useCallback(() => {
    setError(null);
    setStockError(null);
  }, []);

  // ES: Crea una nueva venta en el terminal
  // EN: Creates a new sale at the terminal
  const createSale = useCallback(async () => {
    if (!terminalId) {
      setError('Terminal ID no configurado / Terminal ID not configured');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const sale = await salesApiAdapter.createSale(terminalId);
      setActiveSale(sale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al crear la venta / Error creating sale');
      }
    } finally {
      setIsLoading(false);
    }
  }, [terminalId, setActiveSale]);

  // ES: Agrega un ítem a la venta activa
  // EN: Adds an item to the active sale
  const addItemToSale = useCallback(async (productId?: string, barcode?: string, quantity: number = 1) => {
    if (!activeSale) {
      setError('No hay venta activa / No active sale');
      return;
    }
    setIsLoading(true);
    setError(null);
    setStockError(null);
    try {
      const updatedSale = await salesApiAdapter.addItem(activeSale.id, productId, barcode, quantity);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setStockError({
            message: err.message,
            items: err.outOfStockItems?.map(item => ({
              productId: item.productId,
              productName: item.productName,
              availableStock: item.availableStock,
            })),
          });
        } else {
          setError(err.message);
        }
      } else {
        setError('Error al agregar ítem / Error adding item');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, setActiveSale]);

  // ES: Actualiza la cantidad de un ítem
  // EN: Updates the quantity of an item
  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!activeSale) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSale = await salesApiAdapter.updateItem(activeSale.id, itemId, quantity);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al actualizar cantidad / Error updating quantity');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, setActiveSale]);

  // ES: Elimina un ítem de la venta
  // EN: Removes an item from the sale
  const removeItem = useCallback(async (itemId: string) => {
    if (!activeSale) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSale = await salesApiAdapter.removeItem(activeSale.id, itemId);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al eliminar ítem / Error removing item');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, setActiveSale]);

  // ES: Aplica un descuento a la venta
  // EN: Applies a discount to the sale
  const applyDiscount = useCallback(async (type: DiscountType, value: number) => {
    if (!activeSale) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSale = await salesApiAdapter.applyDiscount(activeSale.id, type, value);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al aplicar descuento / Error applying discount');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, setActiveSale]);

  // ES: Remueve el descuento aplicado (value=0)
  // EN: Removes the applied discount (value=0)
  const removeDiscount = useCallback(async () => {
    if (!activeSale) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSale = await salesApiAdapter.applyDiscount(activeSale.id, 'FIXED_AMOUNT', 0);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al remover descuento / Error removing discount');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, setActiveSale]);

  // ES: Congela la venta activa
  // EN: Freezes the active sale
  const freezeSale = useCallback(async () => {
    if (!activeSale) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSale = await salesApiAdapter.freeze(activeSale.id);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al congelar la venta / Error freezing sale');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, setActiveSale]);

  // ES: Reanuda una venta congelada
  // EN: Resumes a frozen sale
  const resumeSale = useCallback(async (saleId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSale = await salesApiAdapter.resume(saleId);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al reanudar la venta / Error resuming sale');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setActiveSale]);

  // ES: Cancela la venta con un motivo
  // EN: Cancels the sale with a reason
  const cancelSale = useCallback(async (reason: string) => {
    if (!activeSale) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSale = await salesApiAdapter.cancel(activeSale.id, reason);
      setActiveSale(updatedSale);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cancelar la venta / Error cancelling sale');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSale, setActiveSale]);

  return {
    isLoading,
    error,
    stockError,
    createSale,
    addItemToSale,
    updateItemQuantity,
    removeItem,
    applyDiscount,
    removeDiscount,
    freezeSale,
    resumeSale,
    cancelSale,
    clearError,
  };
}
