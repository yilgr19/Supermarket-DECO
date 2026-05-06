// ES: Adaptador HTTP para la Customer API
// EN: HTTP adapter for the Customer API

import axiosClient from '../../infrastructure/http/axiosClient'
import type { CustomerPort } from '../../core/ports/CustomerPort'
import type { Customer } from '../../core/types/customer.types'

export const customerApiAdapter: CustomerPort = {
  async searchByName(name: string): Promise<Customer[]> {
    const response = await axiosClient.get<Customer[]>('/api/v1/customers/search', {
      params: { name },
    })
    return response.data
  },

  async searchByDocument(documentNumber: string): Promise<Customer> {
    const response = await axiosClient.get<Customer>(
      `/api/v1/customers/document/${documentNumber}`
    )
    return response.data
  },
}
