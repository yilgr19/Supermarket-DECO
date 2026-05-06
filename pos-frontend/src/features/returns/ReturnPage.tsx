// ES: Página de devoluciones — total o parcial
// EN: Returns page — full or partial

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesApiAdapter } from '../../adapters/http/salesApiAdapter';
import { useReturn } from './useReturn';
import FullReturnForm from './FullReturnForm';
import PartialReturnForm from './PartialReturnForm';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import type { Sale } from '../../core/types/sale.types';
import type { ReturnItemRequest } from '../../core/types/sale.types';

type ReturnMode = 'full' | 'partial';

export default function ReturnPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoadingSale, setIsLoadingSale] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [returnMode, setReturnMode] = useState<ReturnMode>('full');

  const { isLoading, error, fullReturn, partialReturn } = useReturn();
  const navigate = useNavigate();

  useEffect(() => {
    if (!saleId) return;
    const loadSale = async () => {
      setIsLoadingSale(true);
      setLoadError(null);
      try {
        const saleData = await salesApiAdapter.getSale(saleId);
        setSale(saleData);
      } catch {
        setLoadError('Error al cargar la venta / Error loading sale');
      } finally {
        setIsLoadingSale(false);
      }
    };
    loadSale();
  }, [saleId]);

  const handleFullReturn = async (reason: string) => {
    if (!saleId) return;
    const receipt = await fullReturn(saleId, reason);
    if (receipt) {
      navigate(`/receipt/${receipt.transactionId}`);
    }
  };

  const handlePartialReturn = async (items: ReturnItemRequest[]) => {
    if (!saleId) return;
    const receipt = await partialReturn(saleId, items);
    if (receipt) {
      navigate(`/receipt/${receipt.transactionId}`);
    }
  };

  if (isLoadingSale) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando venta... / Loading sale..." />
      </div>
    );
  }

  if (loadError || !sale) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage message={loadError || 'Venta no encontrada / Sale not found'} />
          <button
            onClick={() => navigate('/sale')}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-medium min-h-[44px]"
          >
            Volver / Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* ES: Encabezado / EN: Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ↩️ Devolución / Return
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors min-h-[44px]"
            aria-label="Volver / Back"
          >
            ← Volver / Back
          </button>
        </div>

        {/* ES: Toggle tipo de devolución / EN: Return type toggle */}
        <div className="flex gap-2 mb-6" role="group" aria-label="Tipo de devolución / Return type">
          <button
            onClick={() => setReturnMode('full')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] ${
              returnMode === 'full'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={returnMode === 'full'}
            aria-label="Devolución total / Full return"
          >
            Devolución Total / Full Return
          </button>
          <button
            onClick={() => setReturnMode('partial')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] ${
              returnMode === 'partial'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={returnMode === 'partial'}
            aria-label="Devolución parcial / Partial return"
          >
            Devolución Parcial / Partial Return
          </button>
        </div>

        {/* ES: Formulario según modo / EN: Form based on mode */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {returnMode === 'full' ? (
            <FullReturnForm
              sale={sale}
              onConfirm={handleFullReturn}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <PartialReturnForm
              sale={sale}
              onConfirm={handlePartialReturn}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
