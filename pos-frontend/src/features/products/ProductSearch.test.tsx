// ES: Pruebas del componente ProductSearch
// EN: ProductSearch component tests

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductSearch } from './ProductSearch'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'

const mockOnAdd = vi.fn()

describe('ProductSearch', () => {
  it('renders search input', () => {
    render(<ProductSearch onAddProduct={mockOnAdd} />)
    expect(screen.getByPlaceholderText(/Buscar producto/i)).toBeInTheDocument()
  })

  it('shows no results message when query returns empty', async () => {
    server.use(
      http.get('http://localhost:8088/api/v1/products/search', () =>
        HttpResponse.json([])
      )
    )
    render(<ProductSearch onAddProduct={mockOnAdd} />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar producto/i), {
      target: { value: 'xyz' },
    })
    await waitFor(() => {
      expect(screen.getByText(/Sin resultados|No products found/i)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows error message on 503', async () => {
    server.use(
      http.get('http://localhost:8088/api/v1/products/search', () =>
        HttpResponse.json({ message: 'Service unavailable' }, { status: 503 })
      )
    )
    render(<ProductSearch onAddProduct={mockOnAdd} />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar producto/i), {
      target: { value: 'le' },
    })
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('renders product results and add button', async () => {
    render(<ProductSearch onAddProduct={mockOnAdd} />)
    fireEvent.change(screen.getByPlaceholderText(/Buscar producto/i), {
      target: { value: 'le' },
    })
    await waitFor(() => {
      expect(screen.getByText('Leche Entera')).toBeInTheDocument()
    }, { timeout: 1000 })
    const addBtn = screen.getByRole('button', { name: /Agregar/i })
    fireEvent.click(addBtn)
    expect(mockOnAdd).toHaveBeenCalled()
  })
})
