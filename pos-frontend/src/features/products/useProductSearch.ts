// ES: Hook para búsqueda de productos con debounce
// EN: Hook for product search with debounce

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '../../core/types/product.types';
import { productApiAdapter } from '../../adapters/http/productApiAdapter';
import { ApiError } from '../../infrastructure/http/axiosClient';

interface UseProductSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: Product[];
  isLoading: boolean;
  error: string | null;
  searchByBarcode: (barcode: string) => Promise<Product | null>;
  clearResults: () => void;
}

export function useProductSearch(): UseProductSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ES: Búsqueda por nombre con debounce de 300ms
  // EN: Name search with 300ms debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const products = await productApiAdapter.searchByName(query);
        setResults(products);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Error al buscar productos / Error searching products');
        }
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // ES: Búsqueda inmediata por código de barras
  // EN: Immediate search by barcode
  const searchByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const product = await productApiAdapter.searchByBarcode(barcode);
      return product;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError(`Producto no encontrado con código: ${barcode} / Product not found with code: ${barcode}`);
        } else {
          setError(err.message);
        }
      } else {
        setError('Error al buscar por barcode / Error searching by barcode');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchByBarcode,
    clearResults,
  };
}
