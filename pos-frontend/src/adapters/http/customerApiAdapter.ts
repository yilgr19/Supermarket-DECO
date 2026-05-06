// ES: Adaptador HTTP para la API de clientes
// EN: HTTP adapter for the customers API

import axiosInstance from '../../infrastructure/http/axiosClient';
import type { CustomerPort } from '../../core/ports/CustomerPort';
import type { Customer } from '../../core/types/customer.types';

export const customerApiAdapter: CustomerPort = {
  // ES: Busca clientes por nombre (coincidencia parcial)
  // EN: Searches customers by name (partial match)
  async searchByName(name: string): Promise<Customer[]> {
    const response = await axiosInstance.get<Customer[]>('/api/v1/customers/search', {
      params: { name },
    });
    return response.data;
  },

  // ES: Busca un cliente por número de documento (exacto)
  // EN: Searches a customer by document number (exact match)
  async searchByDocument(documentNumber: string): Promise<Customer> {
    const response = await axiosInstance.get<Customer>(`/api/v1/customers/document/${documentNumber}`);
    return response.data;
  },
};
