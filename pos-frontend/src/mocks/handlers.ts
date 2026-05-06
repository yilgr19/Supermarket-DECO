// ES: Handlers de MSW para interceptar peticiones HTTP en pruebas
// EN: MSW handlers to intercept HTTP requests in tests

import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080';

// ES: Datos de prueba / EN: Test data
const mockProduct = {
  id: 'prod-1',
  name: 'Leche 1L',
  barcode: '7501234567890',
  unitPrice: 2400,
  availableStock: 50,
  category: 'Lácteos',
};

const mockProduct2 = {
  id: 'prod-2',
  name: 'Pan Integral',
  barcode: '7509876543210',
  unitPrice: 1200,
  availableStock: 30,
  category: 'Panadería',
};

const mockCustomer = {
  id: 'cust-1',
  fullName: 'Juan Pérez',
  documentType: 'CC',
  documentNumber: '12345678',
  creditStatus: 'APPROVED',
};

const mockSale = {
  id: 'sale-1',
  terminalId: 'TERM-001',
  cashierId: 'cashier-1',
  status: 'ACTIVE',
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

const mockReceipt = {
  transactionId: 'tx-1',
  saleId: 'sale-1',
  receiptType: 'SALE',
  storeName: 'Supermercado POS',
  terminalId: 'TERM-001',
  cashierId: 'cashier-1',
  paymentType: 'CASH',
  amountReceived: 10000,
  changeAmount: 4288,
  items: mockSaleWithItems.items,
  subtotal: 4800,
  tax: 912,
  discount: 0,
  total: 5712,
  createdAt: new Date().toISOString(),
};

export const handlers = [
  // ES: Búsqueda de productos por nombre
  // EN: Product search by name
  http.get(`${BASE_URL}/api/v1/products/search`, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || '';
    const results = [mockProduct, mockProduct2].filter((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );
    return HttpResponse.json(results);
  }),

  // ES: Búsqueda de producto por barcode
  // EN: Product search by barcode
  http.get(`${BASE_URL}/api/v1/products/barcode/:barcode`, ({ params }) => {
    const { barcode } = params;
    if (barcode === mockProduct.barcode) {
      return HttpResponse.json(mockProduct);
    }
    if (barcode === mockProduct2.barcode) {
      return HttpResponse.json(mockProduct2);
    }
    return HttpResponse.json({ message: `Producto no encontrado con barcode: ${barcode}` }, { status: 404 });
  }),

  // ES: Búsqueda de clientes por nombre
  // EN: Customer search by name
  http.get(`${BASE_URL}/api/v1/customers/search`, ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || '';
    const results = [mockCustomer].filter((c) =>
      c.fullName.toLowerCase().includes(name.toLowerCase())
    );
    return HttpResponse.json(results);
  }),

  // ES: Búsqueda de cliente por documento
  // EN: Customer search by document
  http.get(`${BASE_URL}/api/v1/customers/document/:doc`, ({ params }) => {
    const { doc } = params;
    if (doc === mockCustomer.documentNumber) {
      return HttpResponse.json(mockCustomer);
    }
    return HttpResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
  }),

  // ES: Crear venta
  // EN: Create sale
  http.post(`${BASE_URL}/api/v1/sales`, () => {
    return HttpResponse.json(mockSale, { status: 201 });
  }),

  // ES: Obtener venta por ID
  // EN: Get sale by ID
  http.get(`${BASE_URL}/api/v1/sales/:saleId`, ({ params }) => {
    const { saleId } = params;
    if (saleId === 'sale-1') {
      return HttpResponse.json(mockSaleWithItems);
    }
    return HttpResponse.json({ message: 'Venta no encontrada' }, { status: 404 });
  }),

  // ES: Agregar ítem a la venta
  // EN: Add item to sale
  http.post(`${BASE_URL}/api/v1/sales/:saleId/items`, () => {
    return HttpResponse.json(mockSaleWithItems);
  }),

  // ES: Actualizar ítem de la venta
  // EN: Update sale item
  http.put(`${BASE_URL}/api/v1/sales/:saleId/items/:itemId`, () => {
    return HttpResponse.json(mockSaleWithItems);
  }),

  // ES: Eliminar ítem de la venta
  // EN: Remove sale item
  http.delete(`${BASE_URL}/api/v1/sales/:saleId/items/:itemId`, () => {
    return HttpResponse.json(mockSale);
  }),

  // ES: Aplicar descuento
  // EN: Apply discount
  http.post(`${BASE_URL}/api/v1/sales/:saleId/discount`, () => {
    return HttpResponse.json({
      ...mockSaleWithItems,
      discount: 500,
      total: 5212,
    });
  }),

  // ES: Congelar venta
  // EN: Freeze sale
  http.post(`${BASE_URL}/api/v1/sales/:saleId/freeze`, () => {
    return HttpResponse.json({ ...mockSaleWithItems, status: 'FROZEN' });
  }),

  // ES: Reanudar venta
  // EN: Resume sale
  http.post(`${BASE_URL}/api/v1/sales/:saleId/resume`, () => {
    return HttpResponse.json({ ...mockSaleWithItems, status: 'ACTIVE' });
  }),

  // ES: Cancelar venta
  // EN: Cancel sale
  http.post(`${BASE_URL}/api/v1/sales/:saleId/cancel`, () => {
    return HttpResponse.json({ ...mockSaleWithItems, status: 'CANCELLED' });
  }),

  // ES: Listar ventas congeladas
  // EN: List frozen sales
  http.get(`${BASE_URL}/api/v1/sales/frozen`, () => {
    return HttpResponse.json([
      { ...mockSaleWithItems, id: 'sale-frozen-1', status: 'FROZEN', frozenAt: new Date().toISOString() },
    ]);
  }),

  // ES: Checkout
  // EN: Checkout
  http.post(`${BASE_URL}/api/v1/sales/:saleId/checkout`, () => {
    return HttpResponse.json(mockReceipt);
  }),

  // ES: Obtener recibo
  // EN: Get receipt
  http.get(`${BASE_URL}/api/v1/receipts/:transactionId`, ({ params }) => {
    const { transactionId } = params;
    if (transactionId === 'tx-1') {
      return HttpResponse.json(mockReceipt);
    }
    return HttpResponse.json({ message: 'Recibo no encontrado' }, { status: 404 });
  }),

  // ES: Devolución total
  // EN: Full return
  http.post(`${BASE_URL}/api/v1/sales/:saleId/return`, () => {
    return HttpResponse.json({
      ...mockReceipt,
      transactionId: 'tx-return-1',
      receiptType: 'FULL_RETURN',
      originalTransactionId: 'tx-1',
    });
  }),

  // ES: Devolución parcial
  // EN: Partial return
  http.post(`${BASE_URL}/api/v1/sales/:saleId/partial-return`, () => {
    return HttpResponse.json({
      ...mockReceipt,
      transactionId: 'tx-partial-1',
      receiptType: 'PARTIAL_RETURN',
      originalTransactionId: 'tx-1',
    });
  }),
];
