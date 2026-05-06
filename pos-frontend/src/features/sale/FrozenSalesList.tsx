// ES: Lista de ventas congeladas del terminal
// EN: Terminal frozen sales list

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter';
import { useSessionStore } from '../../infrastructure/store/sessionStore';
import { useSale } from './useSale';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
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

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateStr));
}

export default function FrozenSalesList() {
  const [frozenSales, setFrozenSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { terminalId } = useSessionStore();
  const { resumeSale, isLoading: isResuming } = useSale();
  const navigate = useNavigate();

  const loadFrozenSales = async () => {
    if (!terminalId) return;
    setIsLoading(true);
    setError(null);
    try {
      const sales = await salesApiAdapter.listFrozen(terminalId);
      // ES: Ordenar por fecha de congelamiento / EN: Sort by freeze date
      const sorted = [...sales].sort((a, b) => {
        const dateA = a.frozenAt ? new Date(a.frozenAt).getTime() : 0;
        const dateB = b.frozenAt ? new Date(b.frozenAt).getTime() : 0;
        return dateB - dateA;
      });
      setFrozenSales(sorted);
    } catch (err) {
      setError('Error al cargar ventas congeladas / Error loading frozen sales');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFrozenSales();
  }, [terminalId]);

  const handleResume = async (saleId: string) => {
    await resumeSale(saleId);
    navigate('/sale');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner label="Cargando ventas congeladas... / Loading frozen sales..." />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ❄️ Ventas Congeladas / Frozen Sales
        </h1>
        <button
          onClick={() => navigate('/sale')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors min-h-[44px]"
          aria-label="Volver a la venta / Back to sale"
        >
          ← Volver / Back
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadFrozenSales} className="mb-4" />}

      {frozenSales.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">❄️</p>
          <p>No hay ventas congeladas / No frozen sales</p>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Lista de ventas congeladas / Frozen sales list">
          {frozenSales.map((sale) => {
            const isExpired = sale.status === 'CANCELLED';

            return (
              <li
                key={sale.id}
                className={`bg-white rounded-xl border p-4 ${isExpired ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">#{sale.id.slice(0, 8)}</span>
                      <StatusBadge status={isExpired ? 'CANCELLED' : 'FROZEN'} />
                      {isExpired && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Expirada / Expired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {sale.frozenAt
                        ? `Congelada: ${formatDate(sale.frozenAt)} / Frozen: ${formatDate(sale.frozenAt)}`
                        : `Creada: ${formatDate(sale.createdAt)} / Created: ${formatDate(sale.createdAt)}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sale.items.length} ítem(s) — Total: {formatCOP(sale.total)}
                    </p>
                  </div>

                  {/* ES: Botón reanudar / EN: Resume button */}
                  {!isExpired ? (
                    <button
                      onClick={() => handleResume(sale.id)}
                      disabled={isResuming}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors min-h-[44px] min-w-[44px] disabled:opacity-50"
                      aria-label={`Reanudar venta ${sale.id} / Resume sale ${sale.id}`}
                    >
                      ▶ Reanudar / Resume
                    </button>
                  ) : (
                    <div className="text-sm text-red-600 text-right">
                      <p>Venta expirada</p>
                      <p>Sale expired</p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
