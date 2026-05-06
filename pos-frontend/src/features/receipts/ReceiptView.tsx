// ES: Vista del recibo de venta o devolución
// EN: Sale or return receipt view

import type { Receipt } from '../../core/types/receipt.types';

// ES: Formatea precio en pesos colombianos
// EN: Formats price in Colombian pesos
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(new Date(dateStr));
}

interface ReceiptViewProps {
  receipt: Receipt;
}

export default function ReceiptView({ receipt }: ReceiptViewProps) {
  const isReturn = receipt.receiptType === 'FULL_RETURN' || receipt.receiptType === 'PARTIAL_RETURN';
  const isCreditSale = receipt.paymentType === 'CREDIT';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto font-mono text-sm">
      {/* ES: Encabezado del recibo / EN: Receipt header */}
      <div className="text-center mb-4 border-b border-dashed border-gray-300 pb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {receipt.storeName || import.meta.env.VITE_STORE_NAME || 'Supermercado POS'}
        </h1>
        {isReturn && (
          <div className="mt-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium inline-block">
            {receipt.receiptType === 'FULL_RETURN' ? '↩ DEVOLUCIÓN TOTAL / FULL RETURN' : '↩ DEVOLUCIÓN PARCIAL / PARTIAL RETURN'}
          </div>
        )}
        <p className="text-gray-500 mt-2">Terminal: {receipt.terminalId}</p>
        <p className="text-gray-500">Cajero / Cashier: {receipt.cashierId}</p>
        <p className="text-gray-500">{formatDate(receipt.createdAt)}</p>
        {receipt.customerName && (
          <p className="text-gray-700 font-medium mt-1">Cliente / Customer: {receipt.customerName}</p>
        )}
      </div>

      {/* ES: Líneas de productos / EN: Product lines */}
      <div className="mb-4 border-b border-dashed border-gray-300 pb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left">Producto / Product</th>
              <th className="text-center">Cant</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} className="border-t border-gray-100">
                <td className="py-1">
                  <p>{item.productName}</p>
                  <p className="text-gray-400">{formatCOP(item.unitPrice)} c/u</p>
                </td>
                <td className="text-center py-1">x{item.quantity}</td>
                <td className="text-right py-1 font-medium">{formatCOP(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ES: Totales / EN: Totals */}
      <div className="mb-4 border-b border-dashed border-gray-300 pb-4 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal:</span>
          <span>{formatCOP(receipt.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Impuesto / Tax:</span>
          <span>{formatCOP(receipt.tax)}</span>
        </div>
        {receipt.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento / Discount:</span>
            <span>-{formatCOP(receipt.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1 mt-1">
          <span>TOTAL:</span>
          <span>{formatCOP(receipt.total)}</span>
        </div>
      </div>

      {/* ES: Información de pago / EN: Payment information */}
      <div className="mb-4 border-b border-dashed border-gray-300 pb-4 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Pago / Payment:</span>
          <span className="font-medium">
            {receipt.paymentType === 'CASH' ? '💵 EFECTIVO / CASH' : '💳 CRÉDITO / CREDIT'}
          </span>
        </div>

        {/* ES: Efectivo: monto recibido y vuelto / EN: Cash: amount received and change */}
        {receipt.paymentType === 'CASH' && receipt.amountReceived !== undefined && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-500">Recibido / Received:</span>
              <span>{formatCOP(receipt.amountReceived)}</span>
            </div>
            <div className="flex justify-between font-medium text-green-700">
              <span>Vuelto / Change:</span>
              <span>{formatCOP(receipt.changeAmount || 0)}</span>
            </div>
          </>
        )}

        {/* ES: Crédito: referencia / EN: Credit: reference */}
        {isCreditSale && receipt.creditReference && (
          <div className="flex justify-between">
            <span className="text-gray-500">Ref. Crédito / Credit Ref:</span>
            <span className="font-medium text-blue-700">{receipt.creditReference}</span>
          </div>
        )}

        {/* ES: Devolución a crédito: nota de crédito / EN: Credit return: credit note */}
        {isReturn && isCreditSale && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 text-xs">
            📋 Nota de Crédito / Credit Note emitida
          </div>
        )}
      </div>

      {/* ES: Referencia a transacción original (devoluciones) / EN: Reference to original transaction (returns) */}
      {receipt.originalTransactionId && (
        <div className="mb-4 text-xs text-gray-500">
          <p>Ref. Original TX: {receipt.originalTransactionId}</p>
        </div>
      )}

      {/* ES: ID de transacción / EN: Transaction ID */}
      <div className="text-center text-xs text-gray-400">
        <p>TX: {receipt.transactionId}</p>
        <p className="mt-1">¡Gracias por su compra! / Thank you for your purchase!</p>
      </div>
    </div>
  );
}
