// ES: Puerto de dominio para búsqueda de clientes
// EN: Domain port for customer search

import type { Customer } from '../types/customer.types'

export interface CustomerPort {
  searchByName(name: string): Promise<Customer[]>
  searchByDocument(documentNumber: string): Promise<Customer>
}
