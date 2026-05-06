// ES: Devoluciones totales / parciales sobre SalePort
// EN: Full and partial returns over SalePort

import type { SalePort } from '../ports/SalePort'
import type { ReturnItemRequest } from '../types/sale.types'

export function makeReturnUseCases(port: SalePort) {
  return {
    fullReturn: (saleId: string, reason: string) => port.fullReturn(saleId, reason),
    partialReturn: (saleId: string, items: ReturnItemRequest[]) =>
      port.partialReturn(saleId, items),
  }
}
