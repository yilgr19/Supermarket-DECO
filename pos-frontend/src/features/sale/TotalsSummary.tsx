// ES: Resumen de totales de la venta
// EN: Sale totals summary

import type { Sale } from '../../core/types/sale.types';

// ES: Formatea precio en pesos colombianos
// EN: Formats price in Colombian pesos
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface TotalsSummaryProps {
  sale: Sale | null;
}

export default function TotalsSummary({ sale }: TotalsSummaryProps) {
  if (!sale) {
    return (
      <div className="border-t border-gray-200 pt-4">
        <p className="text-gray-400 text-center text-sm">Sin venta activa / No active sale</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      {/* ES: Subtotal / EN: Subtotal */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Subtotal:</span>
        <span>{formatCOP(sale.subtotal)}</span>
      </div>

      {/* ES: Impuesto 19% / EN: Tax 19% */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Impuesto (19%) / Tax (19%):</span>
        <span>{formatCOP(sale.tax)}</span>
      </div>

      {/* ES: Descuento / EN: Discount */}
      {sale.discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Descuento / Discount:</span>
          <span>-{formatCOP(sale.discount)}</span>
        </div>
      )}

      {/* ES: Total / EN: Total */}
      <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
        <span>TOTAL:</span>
        <span>{formatCOP(sale.total)}</span>
      </div>
    </div>
  );
}
