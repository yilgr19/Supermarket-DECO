// ES: SalePort local + POST /api/v1/ventas al cobrar (lambda-ventas)
// EN: Local SalePort + POST /api/v1/ventas on checkout (lambda-ventas)

import { endpoints, LAMBDA_UNAVAILABLE_MSG } from '../../config/api'
import type { SalePort } from '../../core/ports/SalePort'
import type {
  Sale,
  SaleItem,
  ReturnItemRequest,
  PaymentType,
  DiscountType,
} from '../../core/types/sale.types'
import type { Receipt } from '../../core/types/receipt.types'
import type { VentaRequestLambda, VentaResponseLambda } from '../../core/types/lambda.types'
import { lambdaFetch } from '../../infrastructure/http/lambdaFetch'
import { ApiError } from '../../infrastructure/http/ApiError'
import { useSessionStore } from '../../infrastructure/store/sessionStore'
import { useReceiptStore } from '../../infrastructure/store/receiptStore'
import {
  loadLambdaCatalog,
  mapProductoToProduct,
  invalidateLambdaCatalog,
} from './lambdaCatalogCache'
import type { ProductoLambda } from '../../core/types/lambda.types'

const sales = new Map<string, Sale>()

function notAvailable(): never {
  throw new ApiError(501, LAMBDA_UNAVAILABLE_MSG)
}

function roundIva(subtotal: number, descuento: number): number {
  const base = Math.max(0, subtotal - descuento)
  return Math.round(base * 0.19)
}

function recalcSale(sale: Sale): Sale {
  const subtotal = sale.items.reduce((s, i) => s + i.lineTotal, 0)
  const discount = sale.discount ?? 0
  const tax = roundIva(subtotal, discount)
  const total = Math.max(0, subtotal - discount) + tax
  return {
    ...sale,
    subtotal,
    tax,
    discount,
    total,
    updatedAt: new Date().toISOString(),
  }
}

function newLocalSale(terminalId: string, customerId?: string): Sale {
  const cashierId = useSessionStore.getState().cashierId || 'CAJERO-DEMO'
  const now = new Date().toISOString()
  const sale: Sale = {
    id: `local-${Date.now()}`,
    terminalId,
    cashierId,
    status: 'ACTIVE',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    createdAt: now,
    updatedAt: now,
    ...(customerId ? { customerId } : {}),
  }
  sales.set(sale.id, sale)
  return sale
}

function getSaleOrThrow(saleId: string): Sale {
  const sale = sales.get(saleId)
  if (!sale) throw new ApiError(404, 'Venta no encontrada / Sale not found')
  return sale
}

function saveSale(sale: Sale): Sale {
  const next = recalcSale(sale)
  sales.set(next.id, next)
  return next
}

async function resolveProduct(
  productId?: string,
  barcode?: string
): Promise<{ productId: string; productName: string; unitPrice: number }> {
  const catalog = await loadLambdaCatalog()
  const match =
    (productId && catalog.find((p) => p.id === productId)) ||
    (barcode && catalog.find((p) => p.codigo_barras === barcode || p.id === barcode))
  if (!match) {
    throw new ApiError(404, 'Producto no encontrado / Product not found')
  }
  const mapped = mapProductoToProduct(match)
  return {
    productId: mapped.id,
    productName: mapped.name,
    unitPrice: mapped.unitPrice,
  }
}

function assertStockAvailable(
  catalog: ProductoLambda[],
  productId: string,
  qtyInCart: number
): void {
  const row = catalog.find((p) => p.id === productId)
  if (!row) {
    throw new ApiError(404, 'Producto no encontrado / Product not found')
  }
  const available = Number(row.stock_disponible ?? 0)
  if (qtyInCart > available) {
    throw new ApiError(
      409,
      `Stock insuficiente para ${row.nombre} (disponible: ${available}) / Insufficient stock for ${row.nombre}`,
      [{ productId, productName: row.nombre, available }]
    )
  }
}

function mergeLine(
  sale: Sale,
  productId: string,
  productName: string,
  unitPrice: number,
  quantity: number
): Sale {
  const existing = sale.items.find((i) => i.productId === productId)
  let items: SaleItem[]
  if (existing) {
    const qty = existing.quantity + quantity
    items = sale.items.map((i) =>
      i.productId === productId
        ? { ...i, quantity: qty, lineTotal: qty * i.unitPrice }
        : i
    )
  } else {
    const item: SaleItem = {
      id: `item-${productId}-${Date.now()}`,
      productId,
      productName,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    }
    items = [...sale.items, item]
  }
  return saveSale({ ...sale, items })
}

function ventaResponseToReceipt(
  sale: Sale,
  res: VentaResponseLambda,
  paymentType: PaymentType,
  amountReceived?: number
): Receipt {
  const storeName = import.meta.env.VITE_STORE_NAME || 'Supermercado POS'
  return {
    id: res.idVenta,
    transactionId: res.idVenta,
    saleId: sale.id,
    receiptType: 'SALE',
    storeName,
    terminalId: sale.terminalId,
    cashierId: sale.cashierId,
    customerId: sale.customerId,
    paymentType,
    ...(amountReceived !== undefined ? { amountReceived } : {}),
    ...(paymentType === 'CASH' && amountReceived !== undefined
      ? { changeAmount: Math.max(0, amountReceived - res.total) }
      : {}),
    items: res.items.map((item, idx) => ({
      id: `r-${idx}`,
      productId: item.id,
      productName: item.nombre,
      unitPrice: item.precio,
      quantity: item.cantidad,
      lineTotal: item.precio * item.cantidad,
    })),
    subtotal: res.subtotal,
    tax: res.iva,
    discount: res.descuento,
    total: res.total,
    createdAt: new Date().toISOString(),
  }
}

export const lambdaSaleApiAdapter: SalePort = {
  createSale(terminalId, customerId) {
    return Promise.resolve(newLocalSale(terminalId, customerId))
  },

  patchSaleCustomer(saleId, customerId) {
    const sale = getSaleOrThrow(saleId)
    const next = { ...sale, customerId: customerId ?? undefined }
    return Promise.resolve(saveSale(next))
  },

  getSale(saleId) {
    return Promise.resolve(getSaleOrThrow(saleId))
  },

  async addItem(saleId, productId, barcode, quantity) {
    const sale = getSaleOrThrow(saleId)
    if (sale.status !== 'ACTIVE') {
      throw new ApiError(422, 'Solo ventas activas admiten ítems / Only active sales accept items')
    }
    const p = await resolveProduct(productId, barcode)
    const catalog = await loadLambdaCatalog(true)
    const existingQty = sale.items.find((i) => i.productId === p.productId)?.quantity ?? 0
    assertStockAvailable(catalog, p.productId, existingQty + quantity)
    return mergeLine(sale, p.productId, p.productName, p.unitPrice, quantity)
  },

  async updateItem(saleId, itemId, quantity) {
    const sale = getSaleOrThrow(saleId)
    if (quantity <= 0) {
      throw new ApiError(400, 'Cantidad debe ser mayor a 0 / Quantity must be > 0')
    }
    const item = sale.items.find((i) => i.id === itemId)
    if (!item) throw new ApiError(404, 'Ítem no encontrado / Item not found')
    const catalog = await loadLambdaCatalog(true)
    assertStockAvailable(catalog, item.productId, quantity)
    const items = sale.items.map((i) =>
      i.id === itemId ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i
    )
    return saveSale({ ...sale, items })
  },

  removeItem(saleId, itemId) {
    const sale = getSaleOrThrow(saleId)
    const items = sale.items.filter((i) => i.id !== itemId)
    return Promise.resolve(saveSale({ ...sale, items }))
  },

  applyItemDiscount(saleId, itemId, type, value) {
    const sale = getSaleOrThrow(saleId)
    const item = sale.items.find((i) => i.id === itemId)
    if (!item) throw new ApiError(404, 'Ítem no encontrado / Item not found')

    let discountAmount = 0
    if (value > 0) {
      discountAmount =
        type === 'PERCENTAGE'
          ? Math.round(item.lineTotal * (value / 100) * 100) / 100
          : Math.min(value, item.lineTotal)
    }

    const items = sale.items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            discount: discountAmount,
            discountType: type,
            discountValue: value,
            lineTotal: Math.max(0, i.unitPrice * i.quantity - discountAmount),
          }
        : i
    )
    const lineDiscountSum = items.reduce((s, i) => s + (i.discount ?? 0), 0)
    return Promise.resolve(
      saveSale({
        ...sale,
        items,
        discount: lineDiscountSum,
      })
    )
  },

  freeze() {
    return Promise.resolve(notAvailable())
  },

  resume() {
    return Promise.resolve(notAvailable())
  },

  cancel(saleId, reason) {
    const sale = getSaleOrThrow(saleId)
    const next: Sale = {
      ...sale,
      status: 'CANCELLED',
      cancelReason: reason,
      updatedAt: new Date().toISOString(),
    }
    sales.set(saleId, next)
    return Promise.resolve(next)
  },

  listFrozen() {
    return Promise.resolve(notAvailable())
  },

  async checkout(saleId, paymentType, amountReceived) {
    if (paymentType === 'CREDIT') {
      throw new ApiError(
        422,
        'Pago a crédito no disponible con backend Lambda / Credit payment not available with Lambda backend'
      )
    }
    const sale = getSaleOrThrow(saleId)
    if (sale.items.length === 0) {
      throw new ApiError(400, 'El carrito está vacío / Cart is empty')
    }

    const body: VentaRequestLambda = {
      items: sale.items.map((i) => ({
        id: i.productId,
        nombre: i.productName,
        precio: i.unitPrice,
        cantidad: i.quantity,
      })),
      descuento: sale.discount ?? 0,
    }

    const res = await lambdaFetch<VentaResponseLambda>(endpoints.ventas, {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 120_000,
    })

    sale.status = 'COMPLETED'
    sales.set(saleId, sale)
    invalidateLambdaCatalog()
    const receipt = ventaResponseToReceipt(sale, res, paymentType, amountReceived)
    useReceiptStore.getState().save(receipt)
    return receipt
  },

  fullReturn() {
    return Promise.resolve(notAvailable())
  },

  partialReturn(_saleId: string, _items: ReturnItemRequest[]) {
    return Promise.resolve(notAvailable())
  },
}
