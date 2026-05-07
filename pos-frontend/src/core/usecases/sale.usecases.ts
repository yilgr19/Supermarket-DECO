// ES: Casos de uso de venta (puerto SalePort, sin React)
// EN: Sale use cases over SalePort, no React

import type { SalePort } from '../ports/SalePort'
import type { DiscountType } from '../types/sale.types'

/** ES: Factoría ligera para operaciones de venta según hexagonal EN: Thin factory over SalePort */
export function makeSaleUseCases(port: SalePort) {
  return {
    createSale: (terminalId: string, customerId?: string) =>
      port.createSale(terminalId, customerId),
    patchSaleCustomer: (saleId: string, customerId: string | null) =>
      port.patchSaleCustomer(saleId, customerId),
    getSale: (saleId: string) => port.getSale(saleId),
    addItemToSale: (
      saleId: string,
      productId?: string,
      barcode?: string,
      quantity = 1
    ) => port.addItem(saleId, productId, barcode, quantity),
    updateItemQuantity: (saleId: string, itemId: string, quantity: number) =>
      port.updateItem(saleId, itemId, quantity),
    removeItem: (saleId: string, itemId: string) => port.removeItem(saleId, itemId),
    applyDiscount: (saleId: string, type: DiscountType, value: number) =>
      port.applyDiscount(saleId, type, value),
    freezeSale: (saleId: string) => port.freeze(saleId),
    resumeSale: (saleId: string) => port.resume(saleId),
    cancelSale: (saleId: string, reason: string) => port.cancel(saleId, reason),
    listFrozen: (terminalId: string) => port.listFrozen(terminalId),
  }
}
