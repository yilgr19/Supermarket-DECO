// ES: Casos de uso de cobro sobre SalePort.checkout
// EN: Checkout use cases wrapping SalePort.checkout

import type { SalePort } from '../ports/SalePort'
import { formatCop } from '../../shared/utils/formatCurrency'

export function makeCheckoutUseCases(port: SalePort) {
  return {
    checkoutCash: (saleId: string, saleTotal: number, amountReceived: number) => {
      if (amountReceived < saleTotal) {
        const min = formatCop(saleTotal)
        throw new Error(
          `El monto recibido es menor al total (mínimo ${min}) / Received amount below sale total (minimum ${min})`
        )
      }
      return port.checkout(saleId, 'CASH', amountReceived)
    },
    checkoutCredit: (saleId: string) => port.checkout(saleId, 'CREDIT'),
  }
}
