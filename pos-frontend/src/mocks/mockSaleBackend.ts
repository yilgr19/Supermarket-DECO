// ES: Estado en memoria para MSW en navegador y tests / EN: In-memory backend for MSW

import type { Sale, SaleItem } from '../core/types/sale.types'
import type { Receipt } from '../core/types/receipt.types'

const TAX = 0.19

let saleSeq = 1
let itemSeq = 1
let txSeq = 1

const sales = new Map<string, Sale>()
const receiptsByTxId = new Map<string, Receipt>()

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T
}

export function resetMockSaleBackend(): void {
  saleSeq = 1
  itemSeq = 1
  txSeq = 1
  sales.clear()
  receiptsByTxId.clear()
}

function resolveProduct(
  productId?: string,
  barcode?: string
): { pid: string; name: string; price: number } {
  const b = barcode?.trim()
  const p = productId?.trim()
  if (p === 'prod-1' || b === '7501234567890') {
    return { pid: 'prod-1', name: 'Leche Entera', price: 2400 }
  }
  if (p) return { pid: p, name: `Producto ${p}`, price: 1000 }
  if (b) return { pid: `bc-${b}`, name: `Producto ${b}`, price: 1000 }
  return { pid: 'unknown', name: 'Producto', price: 1000 }
}

function recalc(sale: Sale): void {
  const subtotal = sale.items.reduce((s, i) => s + i.lineTotal, 0)
  const tax = Math.round(subtotal * TAX)
  let discountAmt = 0
  const dt = sale.discountType
  const dv = sale.discountValue
  if (dt === 'PERCENTAGE' && dv != null && dv > 0) {
    discountAmt = Math.round(subtotal * (dv / 100))
  } else if (dt === 'FIXED_AMOUNT' && dv != null) {
    discountAmt = dv === 0 ? 0 : Math.max(0, dv)
  }
  sale.subtotal = subtotal
  sale.tax = tax
  sale.discount = discountAmt
  sale.total = Math.max(0, subtotal + tax - discountAmt)
  sale.updatedAt = new Date().toISOString()
}

export function mockCreateSale(
  terminalId: string,
  customerId: string | undefined,
  cashierId: string
): Sale {
  const id = `sale-${saleSeq++}`
  const now = new Date().toISOString()
  const sale: Sale = {
    id,
    terminalId,
    cashierId,
    customerId,
    status: 'ACTIVE',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    createdAt: now,
    updatedAt: now,
  }
  sales.set(id, sale)
  return clone(sale)
}

export function mockGetSale(saleId: string): Sale | null {
  const s = sales.get(saleId)
  return s ? clone(s) : null
}

export function mockAddItem(
  saleId: string,
  productId?: string,
  barcode?: string,
  quantity = 1
): Sale | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'ACTIVE') return null
  const prod = resolveProduct(productId, barcode)
  const q = Math.max(1, Math.floor(Number(quantity) || 1))
  let item = sale.items.find((i) => i.productId === prod.pid)
  if (item) {
    item.quantity += q
    item.lineTotal = item.unitPrice * item.quantity
  } else {
    item = {
      id: `item-${itemSeq++}`,
      productId: prod.pid,
      productName: prod.name,
      unitPrice: prod.price,
      quantity: q,
      lineTotal: prod.price * q,
    }
    sale.items.push(item)
  }
  recalc(sale)
  return clone(sale)
}

export function mockUpdateItem(saleId: string, itemId: string, quantity: number): Sale | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'ACTIVE') return null
  const q = Math.max(1, Math.floor(Number(quantity) || 1))
  const item = sale.items.find((i) => i.id === itemId)
  if (!item) return null
  item.quantity = q
  item.lineTotal = item.unitPrice * q
  recalc(sale)
  return clone(sale)
}

export function mockRemoveItem(saleId: string, itemId: string): Sale | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'ACTIVE') return null
  sale.items = sale.items.filter((i) => i.id !== itemId)
  recalc(sale)
  return clone(sale)
}

export function mockApplyDiscount(
  saleId: string,
  discountType: string,
  discountValue: number
): Sale | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'ACTIVE') return null
  if (discountType === 'FIXED_AMOUNT' && discountValue === 0) {
    delete sale.discountType
    delete sale.discountValue
  } else {
    sale.discountType = discountType as Sale['discountType']
    sale.discountValue = discountValue
  }
  recalc(sale)
  return clone(sale)
}

export function mockFreeze(saleId: string): Sale | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'ACTIVE') return null
  sale.status = 'FROZEN'
  sale.frozenAt = new Date().toISOString()
  sale.updatedAt = sale.frozenAt
  return clone(sale)
}

export function mockResume(saleId: string): Sale | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'FROZEN') return null
  sale.status = 'ACTIVE'
  delete sale.frozenAt
  sale.updatedAt = new Date().toISOString()
  return clone(sale)
}

export function mockCancel(saleId: string, reason: string): Sale | null {
  const sale = sales.get(saleId)
  if (!sale || (sale.status !== 'ACTIVE' && sale.status !== 'FROZEN')) return null
  sale.status = 'CANCELLED'
  sale.cancelReason = reason
  sale.updatedAt = new Date().toISOString()
  return clone(sale)
}

export function mockListFrozen(terminalId: string): Sale[] {
  return Array.from(sales.values())
    .filter((s) => s.terminalId === terminalId && s.status === 'FROZEN')
    .map(clone)
}

export function mockCheckout(
  saleId: string,
  paymentType: 'CASH' | 'CREDIT',
  amountReceived?: number
): Receipt | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'ACTIVE') return null
  if (sale.items.length === 0) return null

  const transactionId = `tx-${Date.now()}-${txSeq++}`
  recalc(sale)
  const receipt: Receipt = {
    id: `receipt-${transactionId}`,
    transactionId,
    saleId,
    receiptType: 'SALE',
    storeName: 'Supermercado POS',
    terminalId: sale.terminalId,
    cashierId: sale.cashierId,
    customerId: sale.customerId,
    paymentType,
    amountReceived: paymentType === 'CASH' ? amountReceived : undefined,
    changeAmount:
      paymentType === 'CASH' && amountReceived !== undefined
        ? Math.max(0, amountReceived - sale.total)
        : undefined,
    creditReference: paymentType === 'CREDIT' ? `CR-${txSeq}` : undefined,
    items: sale.items.map((i, idx) => ({
      id: `ri-${idx}`,
      productId: i.productId,
      productName: i.productName,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
    subtotal: sale.subtotal,
    tax: sale.tax,
    discount: sale.discount,
    total: sale.total,
    createdAt: new Date().toISOString(),
  }

  sale.status = 'COMPLETED'
  sale.updatedAt = new Date().toISOString()
  sales.set(saleId, sale)
  receiptsByTxId.set(transactionId, receipt)
  return clone(receipt)
}

export function mockGetReceipt(transactionId: string): Receipt | null {
  const r = receiptsByTxId.get(transactionId)
  return r ? clone(r) : null
}

function receiptItemsFromSaleItems(
  items: SaleItem[],
  reasons?: Record<string, string>
): Receipt['items'] {
  return items.map((i, idx) => ({
    id: `ri-${idx}`,
    productId: i.productId,
    productName: i.productName,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
    lineTotal: i.lineTotal,
    returnReason: reasons?.[i.id],
  }))
}

export function mockFullReturn(saleId: string, reason: string): Receipt | null {
  const sale = sales.get(saleId)
  if (!sale || sale.status !== 'COMPLETED') return null
  const transactionId = `tx-ret-${Date.now()}-${txSeq++}`
  const items = [...sale.items]
  const reasons = Object.fromEntries(items.map((i) => [i.id, reason]))
  const mapped = receiptItemsFromSaleItems(items, reasons)
  const subtotal = mapped.reduce((s, i) => s + i.lineTotal, 0)
  const tax = Math.round(subtotal * TAX)
  sale.status = 'RETURNED'
  sale.updatedAt = new Date().toISOString()

  const receipt: Receipt = {
    id: `receipt-${transactionId}`,
    transactionId,
    saleId,
    receiptType: 'FULL_RETURN',
    storeName: 'Supermercado POS',
    terminalId: sale.terminalId,
    cashierId: sale.cashierId,
    customerId: sale.customerId,
    paymentType: 'CASH',
    items: mapped,
    subtotal,
    tax,
    discount: 0,
    total: subtotal + tax,
    createdAt: new Date().toISOString(),
  }
  receiptsByTxId.set(transactionId, receipt)
  return clone(receipt)
}

export function mockPartialReturn(
  saleId: string,
  returnRows: Array<{ saleItemId: string; quantity: number; reason: string }>
): Receipt | null {
  const sale = sales.get(saleId)
  if (
    !sale ||
    (sale.status !== 'COMPLETED' && sale.status !== 'PARTIALLY_RETURNED')
  )
    return null
  if (!returnRows?.length) return null

  const reasonByItem: Record<string, string> = {}
  const partialItems: SaleItem[] = []

  for (const row of returnRows) {
    const line = sale.items.find((i) => i.id === row.saleItemId)
    if (!line) return null
    const q = Math.min(Math.max(1, row.quantity), line.quantity)
    reasonByItem[line.id] = row.reason
    partialItems.push({
      ...line,
      quantity: q,
      lineTotal: line.unitPrice * q,
    })
  }

  const transactionId = `tx-retp-${Date.now()}-${txSeq++}`
  const mapped = receiptItemsFromSaleItems(partialItems, reasonByItem)
  const subtotal = mapped.reduce((s, i) => s + i.lineTotal, 0)
  const tax = Math.round(subtotal * TAX)

  sale.status = 'PARTIALLY_RETURNED'
  sale.updatedAt = new Date().toISOString()

  const receipt: Receipt = {
    id: `receipt-${transactionId}`,
    transactionId,
    saleId,
    receiptType: 'PARTIAL_RETURN',
    storeName: 'Supermercado POS',
    terminalId: sale.terminalId,
    cashierId: sale.cashierId,
    customerId: sale.customerId,
    paymentType: 'CASH',
    items: mapped,
    subtotal,
    tax,
    discount: 0,
    total: subtotal + tax,
    createdAt: new Date().toISOString(),
  }
  receiptsByTxId.set(transactionId, receipt)
  return clone(receipt)
}
