// ES: Puerto de clientes — interfaz de contrato para búsqueda de clientes
// EN: Customer port — contract interface for customer search

import type { Customer } from '../types/customer.types';

export interface CustomerPort {
  searchByName(name: string): Promise<Customer[]>;
  searchByDocument(documentNumber: string): Promise<Customer>;
}
