// ES: Handlers MSW — catálogo + Sales API con estado en memoria
// EN: MSW handlers — catalog + in-memory Sales API

import { http, HttpResponse } from 'msw'
import {
  mockAddItem,
  mockApplyDiscount,
  mockCancel,
  mockCheckout,
  mockCreateSale,
  mockFreeze,
  mockFullReturn,
  mockGetReceipt,
  mockGetSale,
  mockListFrozen,
  mockPartialReturn,
  mockRemoveItem,
  mockResume,
  mockUpdateItem,
} from './mockSaleBackend'

const BASE = 'http://localhost:8080'

function cashierFrom(request: Request): string {
  return request.headers.get('X-Cashier-Id') || 'CAJERO-DEMO'
}

export const handlers = [
  // --- Product API ---
  http.get(`${BASE}/api/v1/products/search`, ({ request }) => {
    const url = new URL(request.url)
    const name = url.searchParams.get('name') ?? ''
    return HttpResponse.json([
      {
        id: 'prod-1',
        name: name ? `${name.trim()} · result` : 'Leche Entera',
        barcode: '7501234567890',
        unitPrice: 2400,
        availableStock: 50,
        category: 'Lácteos',
      },
    ])
  }),

  http.get(`${BASE}/api/v1/products/barcode/:barcode`, ({ params }) => {
    if (params.barcode === '0000000000000') {
      return HttpResponse.json({ message: 'Product not found' }, { status: 404 })
    }
    return HttpResponse.json({
      id: 'prod-1',
      name: 'Leche Entera',
      barcode: params.barcode,
      unitPrice: 2400,
      availableStock: 50,
      category: 'Lácteos',
    })
  }),

  // --- Customer API ---
  http.get(`${BASE}/api/v1/customers/search`, () =>
    HttpResponse.json([
      {
        id: 'cust-1',
        fullName: 'Juan Pérez',
        documentType: 'CC',
        documentNumber: '12345678',
        creditStatus: 'APPROVED',
      },
    ])
  ),

  http.get(`${BASE}/api/v1/customers/document/:doc`, () =>
    HttpResponse.json({
      id: 'cust-1',
      fullName: 'Juan Pérez',
      documentType: 'CC',
      documentNumber: '12345678',
      creditStatus: 'APPROVED',
    })
  ),

  // --- Sales API ---
  http.post(`${BASE}/api/v1/sales`, async ({ request }) => {
    const body = (await request.json()) as {
      terminalId?: string
      customerId?: string
    }
    const terminalId = body.terminalId || 'TERM-001'
    const sale = mockCreateSale(terminalId, body.customerId, cashierFrom(request))
    return HttpResponse.json(sale, { status: 201 })
  }),

  http.get(`${BASE}/api/v1/sales/:saleId`, ({ params }) => {
    const sale = mockGetSale(params.saleId as string)
    if (!sale) return HttpResponse.json({ message: 'Sale not found' }, { status: 404 })
    return HttpResponse.json(sale)
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/items`, async ({ params, request }) => {
    const body = (await request.json()) as {
      productId?: string
      barcode?: string
      quantity?: number
    }
    const sale = mockAddItem(
      params.saleId as string,
      body.productId,
      body.barcode,
      body.quantity ?? 1
    )
    if (!sale) return HttpResponse.json({ message: 'Cannot add item' }, { status: 422 })
    return HttpResponse.json(sale, { status: 201 })
  }),

  http.put(`${BASE}/api/v1/sales/:saleId/items/:itemId`, async ({ params, request }) => {
    const body = (await request.json()) as { quantity: number }
    const sale = mockUpdateItem(
      params.saleId as string,
      params.itemId as string,
      body.quantity
    )
    if (!sale) return HttpResponse.json({ message: 'Cannot update item' }, { status: 422 })
    return HttpResponse.json(sale)
  }),

  http.delete(`${BASE}/api/v1/sales/:saleId/items/:itemId`, ({ params }) => {
    const sale = mockRemoveItem(params.saleId as string, params.itemId as string)
    if (!sale) return HttpResponse.json({ message: 'Cannot remove item' }, { status: 422 })
    return HttpResponse.json(sale)
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/discount`, async ({ params, request }) => {
    const body = (await request.json()) as {
      discountType: string
      discountValue: number
    }
    const sale = mockApplyDiscount(
      params.saleId as string,
      body.discountType,
      Number(body.discountValue)
    )
    if (!sale) return HttpResponse.json({ message: 'Cannot apply discount' }, { status: 422 })
    return HttpResponse.json(sale)
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/freeze`, ({ params }) => {
    const sale = mockFreeze(params.saleId as string)
    if (!sale) return HttpResponse.json({ message: 'Cannot freeze' }, { status: 422 })
    return HttpResponse.json(sale)
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/resume`, ({ params }) => {
    const sale = mockResume(params.saleId as string)
    if (!sale) return HttpResponse.json({ message: 'Cannot resume' }, { status: 422 })
    return HttpResponse.json(sale)
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/cancel`, async ({ params, request }) => {
    const body = (await request.json()) as { reason: string }
    const sale = mockCancel(params.saleId as string, body.reason ?? '')
    if (!sale) return HttpResponse.json({ message: 'Cannot cancel' }, { status: 422 })
    return HttpResponse.json(sale)
  }),

  http.get(`${BASE}/api/v1/sales/frozen`, ({ request }) => {
    const url = new URL(request.url)
    const terminalId = url.searchParams.get('terminalId') ?? 'TERM-001'
    return HttpResponse.json(mockListFrozen(terminalId))
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/checkout`, async ({ params, request }) => {
    const body = (await request.json()) as {
      paymentType: 'CASH' | 'CREDIT'
      amountReceived?: number
    }
    const receipt = mockCheckout(
      params.saleId as string,
      body.paymentType,
      body.amountReceived
    )
    if (!receipt) return HttpResponse.json({ message: 'Checkout failed' }, { status: 422 })
    return HttpResponse.json(receipt)
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/return`, async ({ params, request }) => {
    const body = (await request.json()) as { reason: string }
    const receipt = mockFullReturn(params.saleId as string, body.reason ?? '')
    if (!receipt) return HttpResponse.json({ message: 'Return failed' }, { status: 422 })
    return HttpResponse.json(receipt)
  }),

  http.post(`${BASE}/api/v1/sales/:saleId/partial-return`, async ({ params, request }) => {
    const body = (await request.json()) as {
      items: Array<{ saleItemId: string; quantity: number; reason: string }>
    }
    const receipt = mockPartialReturn(params.saleId as string, body.items ?? [])
    if (!receipt) return HttpResponse.json({ message: 'Partial return failed' }, { status: 422 })
    return HttpResponse.json(receipt)
  }),

  http.get(`${BASE}/api/v1/receipts/:transactionId`, ({ params }) => {
    const r = mockGetReceipt(params.transactionId as string)
    if (!r) return HttpResponse.json({ message: 'Receipt not found' }, { status: 404 })
    return HttpResponse.json(r)
  }),
]
