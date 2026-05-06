// ES: Casos de uso de cobro sobre SalePort.checkout
// EN: Checkout use cases wrapping SalePort.checkout

import type { SalePort } from '../ports/SalePort'

export function makeCheckoutUseCases(port: SalePort) {
  return {
    checkoutCash: (saleId: string, saleTotal: number, amountReceived: number) => {
      if (amountReceived < saleTotal) {
        throw new Error(
          `El monto recibido es menor al total (mínimo $${saleTotal.toLocaleString(
            'es-CO'
          )}) / Received amount below sale total (minimum $${saleTotal.toLocaleString('es-CO')})`
        )
      }
      return port.checkout(saleId, 'CASH', amountReceived)
    },
    checkoutCredit: (saleId: string) => port.checkout(saleId, 'CREDIT'),
  }
}
