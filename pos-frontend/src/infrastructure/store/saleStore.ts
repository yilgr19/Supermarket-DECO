// ES: Store de venta activa usando Zustand
// EN: Active sale store using Zustand

import { create } from 'zustand';
import type { Sale } from '../../core/types/sale.types';
import type { Customer } from '../../core/types/customer.types';

interface SaleState {
  activeSale: Sale | null;
  selectedCustomer: Customer | null;
  setActiveSale: (sale: Sale | null) => void;
  clearSale: () => void;
  setSelectedCustomer: (customer: Customer | null) => void;
}

export const useSaleStore = create<SaleState>()((set) => ({
  activeSale: null,
  selectedCustomer: null,

  // ES: Establece la venta activa
  // EN: Sets the active sale
  setActiveSale: (sale: Sale | null) => {
    set({ activeSale: sale });
  },

  // ES: Limpia la venta activa y el cliente seleccionado
  // EN: Clears the active sale and selected customer
  clearSale: () => {
    set({ activeSale: null, selectedCustomer: null });
  },

  // ES: Establece el cliente seleccionado para la venta
  // EN: Sets the selected customer for the sale
  setSelectedCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer });
  },
}));
