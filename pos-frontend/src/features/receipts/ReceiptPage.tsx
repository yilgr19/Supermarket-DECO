// ES: Página de recibo — carga y muestra el recibo tras el checkout
// EN: Receipt page — loads and displays the receipt after checkout

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReceipt } from './useReceipt';
import { useSaleStore } from '../../infrastructure/store/saleStore';
import ReceiptView from './ReceiptView';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';

export default function ReceiptPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { receipt, isLoading, error, getReceipt } = useReceipt();
  const { clearSale } = useSaleStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (transactionId) {
      getReceipt(transactionId);
    }
  }, [transactionId, getReceipt]);

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    clearSale();
    navigate('/sale');
  };

  const handleReturn = () => {
    if (receipt) {
      navigate(`/sale/${receipt.saleId}/return`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando recibo... / Loading receipt..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage message={error} onRetry={() => transactionId && getReceipt(transactionId)} />
          <button
            onClick={handleNewSale}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-medium min-h-[44px]"
            aria-label="Nueva venta / New sale"
          >
            Nueva Venta / New Sale
          </button>
        </div>
      </div>
    );
  }

  if (!receipt) return null;

  const isReturn = receipt.receiptType === 'FULL_RETURN' || receipt.receiptType === 'PARTIAL_RETURN';
  const isCompleted = !isReturn;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* ES: Vista del recibo / EN: Receipt view */}
        <ReceiptView receipt={receipt} />

        {/* ES: Botones de acción / EN: Action buttons */}
        <div className="mt-6 space-y-3 print:hidden">
          {/* ES: Botón imprimir / EN: Print button */}
          <button
            onClick={handlePrint}
            className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-lg transition-colors min-h-[44px]"
            aria-label="Imprimir recibo / Print receipt"
          >
            🖨️ Imprimir / Print
          </button>

          {/* ES: Botón nueva venta / EN: New sale button */}
          <button
            onClick={handleNewSale}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors min-h-[44px]"
            aria-label="Nueva venta / New sale"
          >
            ➕ Nueva Venta / New Sale
          </button>

          {/* ES: Botón devolución (solo para ventas completadas) / EN: Return button (only for completed sales) */}
          {isCompleted && (
            <button
              onClick={handleReturn}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-colors min-h-[44px]"
              aria-label="Procesar devolución / Process return"
            >
              ↩️ Procesar Devolución / Process Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
