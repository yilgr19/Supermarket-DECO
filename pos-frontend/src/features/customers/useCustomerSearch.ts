// ES: Hook para búsqueda de clientes con debounce
// EN: Hook for customer search with debounce

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Customer } from '../../core/types/customer.types';
import { customerApiAdapter } from '../../adapters/http/customerApiAdapter';
import { ApiError } from '../../infrastructure/http/axiosClient';

type SearchMode = 'name' | 'document';

interface UseCustomerSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  results: Customer[];
  isLoading: boolean;
  error: string | null;
  clearResults: () => void;
}

export function useCustomerSearch(): UseCustomerSearchReturn {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [results, setResults] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const delay = searchMode === 'name' ? 300 : 0;

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (searchMode === 'name') {
          const customers = await customerApiAdapter.searchByName(query);
          setResults(customers);
        } else {
          // ES: Búsqueda exacta por documento
          // EN: Exact search by document
          const customer = await customerApiAdapter.searchByDocument(query);
          setResults([customer]);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setResults([]);
            setError('Cliente no encontrado / Customer not found');
          } else {
            setError(err.message);
          }
        } else {
          setError('Error al buscar clientes / Error searching customers');
        }
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchMode]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    searchMode,
    setSearchMode,
    results,
    isLoading,
    error,
    clearResults,
  };
}
