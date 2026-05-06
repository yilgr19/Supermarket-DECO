// ES: Hook para búsqueda de clientes
// EN: Hook for customer search

import { useState, useEffect, useCallback } from 'react'
import { customerApiAdapter } from '../../adapters/http/customerApiAdapter'
import type { Customer } from '../../core/types/customer.types'
import { getErrorMessage } from '../../infrastructure/http/ApiError'

type SearchMode = 'name' | 'document'

export function useCustomerSearch() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('name')
  const [results, setResults] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ES: Búsqueda por nombre con debounce 300ms
  // EN: Name search with 300ms debounce
  useEffect(() => {
    if (mode !== 'name' || query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await customerApiAdapter.searchByName(query)
        setResults(data)
      } catch (err) {
        setError(getErrorMessage(err))
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, mode])

  // ES: Búsqueda exacta por documento
  // EN: Exact document search
  const searchByDocument = useCallback(async (docNumber: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const customer = await customerApiAdapter.searchByDocument(docNumber)
      setResults([customer])
    } catch (err) {
      setError(getErrorMessage(err))
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = () => {
    setQuery('')
    setResults([])
    setError(null)
  }

  return { query, setQuery, mode, setMode, results, isLoading, error, searchByDocument, clearResults }
}
