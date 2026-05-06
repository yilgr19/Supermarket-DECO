// ES: Pruebas unitarias para el hook useCheckout
// EN: Unit tests for the useCheckout hook

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { useCheckout } from './useCheckout';
import { useSaleStore } from '../../infrastructure/store/saleStore';

const BASE_URL = 'http://localhost:8080';

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
};

const mockCustomerApproved = {
  id: 'cust-1',
  fullName: 'Juan Pérez',
  documentType: 'CC',
  documentNumber: '12345678',
  creditStatus: 'APPROVED' as const,
};

const mockCustomerRejected = {
  ...mockCustomerApproved,
  creditStatus: 'REJECTED' as const,
};

const mockReceipt = {
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
};

describe('useCheckout', () => {
  beforeEach(() => {
    useSaleStore.setState({ activeSale: mockSale, selectedCustomer: null });
  });

  it('should complete cash checkout successfully', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/checkout`, () => {
        return HttpResponse.json(mockReceipt);
      })
    );

    const { result } = renderHook(() => useCheckout());

    let receipt = null;
    await act(async () => {
      receipt = await result.current.checkoutCash(10000);
    });

    expect(receipt).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should reject cash checkout when amount is insufficient', async () => {
    const { result } = renderHook(() => useCheckout());

    let receipt = null;
    await act(async () => {
      receipt = await result.current.checkoutCash(1000); // Less than total 5712
    });

    expect(receipt).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('menor al total');
  });

  it('should reject credit checkout when no customer is selected', async () => {
    useSaleStore.setState({ activeSale: mockSale, selectedCustomer: null });

    const { result } = renderHook(() => useCheckout());

    let receipt = null;
    await act(async () => {
      receipt = await result.current.checkoutCredit();
    });

    expect(receipt).toBeNull();
    expect(result.current.error?.message).toContain('cliente');
  });

  it('should reject credit checkout when customer credit is not approved', async () => {
    useSaleStore.setState({ activeSale: mockSale, selectedCustomer: mockCustomerRejected });

    const { result } = renderHook(() => useCheckout());

    let receipt = null;
    await act(async () => {
      receipt = await result.current.checkoutCredit();
    });

    expect(receipt).toBeNull();
    expect(result.current.error?.message).toContain('REJECTED');
  });

  it('should complete credit checkout with approved customer', async () => {
    useSaleStore.setState({ activeSale: mockSale, selectedCustomer: mockCustomerApproved });

    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/checkout`, () => {
        return HttpResponse.json({
          ...mockReceipt,
          paymentType: 'CREDIT',
          creditReference: 'CRED-001',
        });
      })
    );

    const { result } = renderHook(() => useCheckout());

    let receipt = null;
    await act(async () => {
      receipt = await result.current.checkoutCredit();
    });

    expect(receipt).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle 409 stock error during checkout', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/checkout`, () => {
        return HttpResponse.json(
          {
            message: 'Stock insuficiente / Insufficient stock',
            outOfStockItems: [
              { productId: 'prod-1', productName: 'Leche 1L', requestedQuantity: 2, availableStock: 0 },
            ],
          },
          { status: 409 }
        );
      })
    );

    const { result } = renderHook(() => useCheckout());

    let receipt = null;
    await act(async () => {
      receipt = await result.current.checkoutCash(10000);
    });

    expect(receipt).toBeNull();
    expect(result.current.error?.outOfStockItems).toHaveLength(1);
  });

  it('should handle 503 service unavailable during checkout', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/checkout`, () => {
        return HttpResponse.json(
          { message: 'Servicio no disponible / Service unavailable' },
          { status: 503 }
        );
      })
    );

    const { result } = renderHook(() => useCheckout());

    let receipt = null;
    await act(async () => {
      receipt = await result.current.checkoutCash(10000);
    });

    expect(receipt).toBeNull();
    expect(result.current.error).not.toBeNull();
  });
});
