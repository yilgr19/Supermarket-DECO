// ES: Tipos del dominio de clientes / EN: Customer domain types

export type CreditStatus = 'APPROVED' | 'REJECTED' | 'PENDING'

export interface Customer {
  id: string
  fullName: string
  documentType: string
  documentNumber: string
  creditStatus: CreditStatus
}
