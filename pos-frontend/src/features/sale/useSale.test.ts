// ES: Pruebas unitarias para el hook useSale
// EN: Unit tests for the useSale hook

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { useSale } from './useSale';
import { useSaleStore } from '../../infrastructure/store/saleStore';
import { useSessionStore } from '../../infrastructure/store/sessionStore';

const BASE_URL = 'http://localhost:8088';

const mockSale = {
  id: 'sale-1',
  terminalId: 'TERM-001',
  cashierId: 'cashier-1',
  status: 'ACTIVE' as const,
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  createdAt: new Date().toISOString(),
};

const mockSaleWithItems = {
  ...mockSale,
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
};

describe('useSale', () => {
  beforeEach(() => {
    // ES: Resetear stores antes de cada prueba
    // EN: Reset stores before each test
    useSaleStore.setState({ activeSale: null, selectedCustomer: null });
    useSessionStore.setState({
      cashierId: 'cashier-1',
      terminalId: 'TERM-001',
      isAuthenticated: true,
    });
  });

  it('should create a new sale', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/sales`, () => {
        return HttpResponse.json(mockSale, { status: 201 });
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.createSale();
    });

    expect(useSaleStore.getState().activeSale).toEqual(mockSale);
    expect(result.current.error?.message).toBeNull();
  });

  it('should add an item to the sale', async () => {
    useSaleStore.setState({ activeSale: mockSale });

    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/items`, () => {
        return HttpResponse.json(mockSaleWithItems);
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.addItemToSale('prod-1', undefined, 2);
    });

    expect(useSaleStore.getState().activeSale?.items).toHaveLength(1);
    expect(result.current.error?.message).toBeNull();
  });

  it('should handle 409 stock error when adding item', async () => {
    useSaleStore.setState({ activeSale: mockSale });

    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/items`, () => {
        return HttpResponse.json(
          {
            message: 'Stock insuficiente / Insufficient stock',
            outOfStockItems: [
              { productId: 'prod-1', productName: 'Leche 1L', requestedQuantity: 100, availableStock: 5 },
            ],
          },
          { status: 409 }
        );
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.addItemToSale('prod-1', undefined, 100);
    });

    expect(result.current.error?.outOfStockItems).not.toBeNull();
    expect(result.current.error?.outOfStockItems?.[0]?.productName).toBe('Leche 1L');
  });

  it('should update item quantity', async () => {
    useSaleStore.setState({ activeSale: mockSaleWithItems });

    server.use(
      http.put(`${BASE_URL}/api/v1/sales/sale-1/items/item-1`, () => {
        return HttpResponse.json({
          ...mockSaleWithItems,
          items: [{ ...mockSaleWithItems.items[0], quantity: 3, lineTotal: 7200 }],
          subtotal: 7200,
          total: 8568,
        });
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.updateItemQuantity('item-1', 3);
    });

    expect(useSaleStore.getState().activeSale?.items[0].quantity).toBe(3);
  });

  it('should remove an item from the sale', async () => {
    useSaleStore.setState({ activeSale: mockSaleWithItems });

    server.use(
      http.delete(`${BASE_URL}/api/v1/sales/sale-1/items/item-1`, () => {
        return HttpResponse.json(mockSale);
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.removeItem('item-1');
    });

    expect(useSaleStore.getState().activeSale?.items).toHaveLength(0);
  });

  it('should apply a discount', async () => {
    useSaleStore.setState({ activeSale: mockSaleWithItems });

    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/discount`, () => {
        return HttpResponse.json({
          ...mockSaleWithItems,
          discount: 500,
          total: 5212,
        });
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.applyDiscount('FIXED_AMOUNT', 500);
    });

    expect(useSaleStore.getState().activeSale?.discount).toBe(500);
  });

  it('should freeze the sale', async () => {
    useSaleStore.setState({ activeSale: mockSaleWithItems });

    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/freeze`, () => {
        return HttpResponse.json({ ...mockSaleWithItems, status: 'FROZEN' });
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.freezeSale();
    });

    expect(useSaleStore.getState().activeSale?.status).toBe('FROZEN');
  });

  it('should cancel the sale with a reason', async () => {
    useSaleStore.setState({ activeSale: mockSaleWithItems });

    server.use(
      http.post(`${BASE_URL}/api/v1/sales/sale-1/cancel`, () => {
        return HttpResponse.json({ ...mockSaleWithItems, status: 'CANCELLED' });
      })
    );

    const { result } = renderHook(() => useSale());

    await act(async () => {
      await result.current.cancelSale('Cliente cambió de opinión / Customer changed mind');
    });

    expect(useSaleStore.getState().activeSale?.status).toBe('CANCELLED');
  });
});
