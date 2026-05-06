// ES: Pruebas de componente para ReceiptView
// EN: Component tests for ReceiptView

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReceiptView from './ReceiptView';
import type { Receipt } from '../../core/types/receipt.types';

const baseReceipt: Receipt = {
  transactionId: 'tx-001',
  saleId: 'sale-1',
  receiptType: 'SALE',
  storeName: 'Supermercado POS',
  terminalId: 'TERM-001',
  cashierId: 'CAJERO-001',
  paymentType: 'CASH',
  amountReceived: 10000,
  changeAmount: 4288,
  items: [
    {
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
  createdAt: '2026-05-05T10:30:00Z',
};

describe('ReceiptView', () => {
  it('should render store name and terminal info', () => {
    render(<ReceiptView receipt={baseReceipt} />);

    expect(screen.getByText('Supermercado POS')).toBeInTheDocument();
    expect(screen.getByText(/TERM-001/)).toBeInTheDocument();
    expect(screen.getByText(/CAJERO-001/)).toBeInTheDocument();
  });

  it('should render product lines', () => {
    render(<ReceiptView receipt={baseReceipt} />);

    expect(screen.getByText('Leche 1L')).toBeInTheDocument();
    expect(screen.getByText('x2')).toBeInTheDocument();
  });

  it('should show cash payment details with change', () => {
    render(<ReceiptView receipt={baseReceipt} />);

    expect(screen.getByText(/EFECTIVO/i)).toBeInTheDocument();
    // ES: Verificar que se muestra el vuelto / EN: Verify change is shown
    expect(screen.getByText(/Vuelto/i)).toBeInTheDocument();
  });

  it('should show credit reference for credit payment', () => {
    const creditReceipt: Receipt = {
      ...baseReceipt,
      paymentType: 'CREDIT',
      amountReceived: undefined,
      changeAmount: undefined,
      creditReference: 'CRED-001',
    };

    render(<ReceiptView receipt={creditReceipt} />);

    // ES: Verificar que se muestra la referencia de crédito
    // EN: Verify credit reference is shown
    expect(screen.getByText('CRED-001')).toBeInTheDocument();
    expect(screen.getByText(/Ref. Crédito/i)).toBeInTheDocument();
  });

  it('should show return type badge for full return receipt', () => {
    const returnReceipt: Receipt = {
      ...baseReceipt,
      receiptType: 'FULL_RETURN',
      originalTransactionId: 'tx-000',
    };

    render(<ReceiptView receipt={returnReceipt} />);

    expect(screen.getByText(/DEVOLUCIÓN TOTAL/i)).toBeInTheDocument();
    expect(screen.getByText(/tx-000/)).toBeInTheDocument();
  });

  it('should show partial return type badge', () => {
    const partialReturnReceipt: Receipt = {
      ...baseReceipt,
      receiptType: 'PARTIAL_RETURN',
      originalTransactionId: 'tx-000',
    };

    render(<ReceiptView receipt={partialReturnReceipt} />);

    expect(screen.getByText(/DEVOLUCIÓN PARCIAL/i)).toBeInTheDocument();
  });

  it('should show transaction ID', () => {
    render(<ReceiptView receipt={baseReceipt} />);

    expect(screen.getByText(/tx-001/)).toBeInTheDocument();
  });

  it('should show customer name when provided', () => {
    const receiptWithCustomer: Receipt = {
      ...baseReceipt,
      customerName: 'Juan Pérez',
    };

    render(<ReceiptView receipt={receiptWithCustomer} />);

    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
  });
});
