// ES: Hook para búsqueda de productos con debounce
// EN: Hook for product search with debounce

import { useState, useEffect, useCallback } from 'react'
import { productApiAdapter } from '../../adapters/http/productApiAdapter'
import type { Product } from '../../core/types/product.types'
import { getErrorMessage } from '../../infrastructure/http/ApiError'

export function useProductSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ES: Búsqueda por nombre con debounce de 300ms
  // EN: Name search with 300ms debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await productApiAdapter.searchByName(query)
        setResults(data)
      } catch (err) {
        setError(getErrorMessage(err))
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // ES: Búsqueda inmediata por código de barras
  // EN: Immediate barcode search
  const searchByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const product = await productApiAdapter.searchByBarcode(barcode)
      return product
    } catch (err) {
      setError(getErrorMessage(err))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = () => {
    setQuery('')
    setResults([])
    setError(null)
  }

  return { query, setQuery, results, isLoading, error, searchByBarcode, clearResults }
}
