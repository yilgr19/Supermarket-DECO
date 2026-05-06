// ES: Tipos para clientes y estado de crédito
// EN: Types for customers and credit status

export type CreditStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

export interface Customer {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  creditStatus: CreditStatus;
}
