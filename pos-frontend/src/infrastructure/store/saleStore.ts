// ES: Store de la venta activa (Zustand)
// EN: Active sale store (Zustand)

import { create } from 'zustand'
import type { Sale } from '../../core/types/sale.types'
import type { Customer } from '../../core/types/customer.types'

interface SaleState {
  activeSale: Sale | null
  selectedCustomer: Customer | null
  setActiveSale: (sale: Sale | null) => void
  setSelectedCustomer: (customer: Customer | null) => void
  clearSale: () => void
}

export const useSaleStore = create<SaleState>()((set) => ({
  activeSale: null,
  selectedCustomer: null,
  setActiveSale: (sale) => set({ activeSale: sale }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  clearSale: () => set({ activeSale: null, selectedCustomer: null }),
}))
