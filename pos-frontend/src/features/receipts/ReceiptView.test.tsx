// ES: Pruebas del componente ReceiptView
// EN: ReceiptView component tests

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReceiptView } from './ReceiptView'
import type { Receipt } from '../../core/types/receipt.types'

const baseReceipt: Receipt = {
  id: 'r1',
  transactionId: 'tx-1234',
  saleId: 'sale-1',
  receiptType: 'SALE',
  storeName: 'Supermercado POS',
  terminalId: 'TERM-001',
  cashierId: 'CAJERO-01',
  paymentType: 'CASH',
  amountReceived: 10000,
  changeAmount: 7144,
  items: [
    {
      id: 'ri-1',
      productId: 'p1',
      productName: 'Leche Entera',
      unitPrice: 2400,
      quantity: 1,
      lineTotal: 2400,
    },
  ],
  subtotal: 2400,
  tax: 456,
  discount: 0,
  total: 2856,
  createdAt: '2026-05-05T10:30:00Z',
}

describe('ReceiptView', () => {
  it('renders store name and terminal', () => {
    render(<ReceiptView receipt={baseReceipt} />)
    expect(screen.getByText(/Supermercado POS/i)).toBeInTheDocument()
    expect(screen.getByText(/TERM-001/i)).toBeInTheDocument()
  })

  it('renders product line items', () => {
    render(<ReceiptView receipt={baseReceipt} />)
    expect(screen.getByText(/Leche Entera/i)).toBeInTheDocument()
  })

  it('renders cash payment details with change', () => {
    render(<ReceiptView receipt={baseReceipt} />)
    expect(screen.getByText(/CASH/i)).toBeInTheDocument()
    expect(screen.getByText(/Vuelto/i)).toBeInTheDocument()
  })

  it('renders credit reference for CREDIT payment', () => {
    const creditReceipt: Receipt = {
      ...baseReceipt,
      paymentType: 'CREDIT',
      creditReference: 'CRED-ABC123',
      amountReceived: undefined,
      changeAmount: undefined,
    }
    render(<ReceiptView receipt={creditReceipt} />)
    expect(screen.getByText(/CRED-ABC123/i)).toBeInTheDocument()
  })

  it('shows FULL RETURN label for return receipts', () => {
    const returnReceipt: Receipt = {
      ...baseReceipt,
      receiptType: 'FULL_RETURN',
      originalTransactionId: 'tx-original',
    }
    render(<ReceiptView receipt={returnReceipt} />)
    expect(screen.getByText(/DEVOLUCIÓN TOTAL/i)).toBeInTheDocument()
  })

  it('shows credit note badge for CREDIT returns', () => {
    const creditReturn: Receipt = {
      ...baseReceipt,
      receiptType: 'PARTIAL_RETURN',
      paymentType: 'CREDIT',
      creditReference: 'CRM-RETURN-01',
      originalTransactionId: 'tx-original',
    }
    render(<ReceiptView receipt={creditReturn} />)
    expect(screen.getByText(/Nota de crédito/i)).toBeInTheDocument()
    expect(screen.getByText(/sin reembolso en efectivo/i)).toBeInTheDocument()
  })

  it('renders transaction ID', () => {
    render(<ReceiptView receipt={baseReceipt} />)
    expect(screen.getByText(/tx-1234/i)).toBeInTheDocument()
  })
})
