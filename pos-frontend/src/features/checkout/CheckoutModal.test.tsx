// ES: Pruebas de componente para CheckoutModal
// EN: Component tests for CheckoutModal

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { CheckoutModal } from './CheckoutModal'
import { useSaleStore } from '../../infrastructure/store/saleStore'

const BASE_URL = 'http://localhost:8080'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockSale = {
  id: 'sale-1',
  terminalId: 'TERM-001',
  cashierId: 'cashier-1',
  status: 'ACTIVE' as const,
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productName: 'Leche 1L',
      unitPrice: 2400,
      quantity: 2,
      lineTotal: 4800,
    },
  ],
  subtotal: 4800,
  tax: 912,
  discount: 0,
  total: 5712,
  createdAt: new Date().toISOString(),
}

const mockReceipt = {
  id: 'rec-1',
  transactionId: 'tx-1',
  saleId: 'sale-1',
  receiptType: 'SALE' as const,
  storeName: 'Supermercado POS',
  terminalId: 'TERM-001',
  cashierId: 'cashier-1',
  paymentType: 'CASH' as const,
  amountReceived: 10000,
  changeAmount: 4288,
  items: mockSale.items,
  subtotal: 4800,
  tax: 912,
  discount: 0,
  total: 5712,
  createdAt: new Date().toISOString(),
}

function renderCheckoutModal(isOpen = true) {
  return render(
    <MemoryRouter>
      <CheckoutModal
        isOpen={isOpen}
        onClose={vi.fn()}
        selectedCustomer={null}
      />
    </MemoryRouter>
  )
}

describe('CheckoutModal', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    useSaleStore.setState({ activeSale: mockSale, selectedCustomer: null })
  })

  it('should render checkout modal when open', () => {
    renderCheckoutModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/checkout/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    renderCheckoutModal(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should show cash and credit payment options', () => {
    renderCheckoutModal()
    expect(screen.getByRole('button', { name: /^efectivo$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^crédito$/i })).toBeInTheDocument()
  })

  it('should show cash payment form by default', () => {
    renderCheckoutModal()
    expect(screen.getByLabelText(/monto recibido/i)).toBeInTheDocument()
  })

  it('should switch to credit payment form', async () => {
    renderCheckoutModal()

    const creditButton = screen.getByRole('button', { name: /^crédito$/i })
    await userEvent.click(creditButton)

    await waitFor(() => {
      expect(screen.getByText(/Se requiere un cliente/i)).toBeInTheDocument()
    })
  })

  it('should navigate to receipt after successful cash checkout', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/checkout`, () => {
        return HttpResponse.json(mockReceipt)
      })
    )

    renderCheckoutModal()

    const amountInput = screen.getByLabelText(/monto recibido/i)
    await userEvent.clear(amountInput)
    await userEvent.type(amountInput, '10000')

    await waitFor(() => {
      const payButton = screen.getByRole('button', { name: /pagar/i })
      expect(payButton).not.toBeDisabled()
    })

    await userEvent.click(screen.getByRole('button', { name: /pagar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/receipt/tx-1')
    })
  })

  it('should show 409 error with out-of-stock items', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/checkout`, () => {
        return HttpResponse.json(
          {
            message: 'Stock insuficiente / Insufficient stock',
            outOfStockItems: [
              {
                productId: 'prod-1',
                productName: 'Leche 1L',
                requested: 2,
                available: 0,
              },
            ],
          },
          { status: 409 }
        )
      })
    )

    renderCheckoutModal()

    const amountInput = screen.getByLabelText(/monto recibido/i)
    await userEvent.clear(amountInput)
    await userEvent.type(amountInput, '10000')

    await userEvent.click(screen.getByRole('button', { name: /pagar/i }))

    await waitFor(() => {
      expect(screen.getByText(/stock insuficiente/i)).toBeInTheDocument()
    })
  })
})
