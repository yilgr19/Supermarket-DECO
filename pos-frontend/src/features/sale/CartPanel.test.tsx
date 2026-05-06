// ES: Pruebas de componente para CartPanel
// EN: Component tests for CartPanel

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartPanel } from './CartPanel'
import type { Sale } from '../../core/types/sale.types'

const mockSale: Sale = {
  id: 'sale-1',
  terminalId: 'TERM-001',
  cashierId: 'cashier-1',
  status: 'ACTIVE',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productName: 'Leche 1L',
      unitPrice: 2400,
      quantity: 2,
      lineTotal: 4800,
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      productName: 'Pan Integral',
      unitPrice: 1200,
      quantity: 1,
      lineTotal: 1200,
    },
  ],
  subtotal: 6000,
  tax: 1140,
  discount: 0,
  total: 7140,
  createdAt: new Date().toISOString(),
}

describe('CartPanel', () => {
  const mockOnUpdateQuantity = vi.fn()
  const mockOnRemoveItem = vi.fn()

  beforeEach(() => {
    mockOnUpdateQuantity.mockClear()
    mockOnRemoveItem.mockClear()
  })

  it('should show empty cart message when no items', () => {
    render(
      <CartPanel
        sale={null}
        isLoading={false}
        stockError={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    )

    expect(screen.getByText(/Carrito vacío/i)).toBeInTheDocument()
  })

  it('should render cart items', () => {
    render(
      <CartPanel
        sale={mockSale}
        isLoading={false}
        stockError={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    )

    expect(screen.getByText('Leche 1L')).toBeInTheDocument()
    expect(screen.getByText('Pan Integral')).toBeInTheDocument()
  })

  it('should show stock error when provided', () => {
    const stockError = [
      {
        productId: 'prod-1',
        productName: 'Leche 1L',
        requested: 10,
        available: 3,
      },
    ]

    render(
      <CartPanel
        sale={mockSale}
        isLoading={false}
        stockError={stockError}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/disponible\s+3/i)).toBeInTheDocument()
    expect(screen.getByText(/solicitado\s+10/i)).toBeInTheDocument()
  })

  it('should disable controls when sale is not ACTIVE', () => {
    const frozenSale = { ...mockSale, status: 'FROZEN' as const }

    render(
      <CartPanel
        sale={frozenSale}
        isLoading={false}
        stockError={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    )

    const quantityInputs = screen.getAllByRole('spinbutton')
    quantityInputs.forEach((input) => {
      expect(input).toBeDisabled()
    })
  })

  it('should call onRemoveItem after confirmation', async () => {
    render(
      <CartPanel
        sale={mockSale}
        isLoading={false}
        stockError={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    )

    const removeButtons = screen.getAllByRole('button', { name: /eliminar/i })
    await userEvent.click(removeButtons[0])

    const confirmButton = screen.getByRole('button', {
      name: /confirmar eliminación/i,
    })
    await userEvent.click(confirmButton)

    expect(mockOnRemoveItem).toHaveBeenCalledWith('item-1')
  })
})
