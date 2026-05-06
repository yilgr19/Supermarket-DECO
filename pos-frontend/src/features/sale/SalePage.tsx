// ES: Pantalla principal de venta — integra todos los componentes del POS
// EN: Main sale screen — integrates all POS components

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSale } from './useSale';
import { useSaleStore } from '../../infrastructure/store/saleStore';
import { useAuth } from '../auth/useAuth';
import ProductSearch from '../products/ProductSearch';
import BarcodeScanner from '../products/BarcodeScanner';
import CustomerSearch from '../customers/CustomerSearch';
import CartPanel from './CartPanel';
import TotalsSummary from './TotalsSummary';
import DiscountForm from './DiscountForm';
import CancelDialog from './CancelDialog';
import CheckoutModal from '../checkout/CheckoutModal';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import type { Product } from '../../core/types/product.types';
import { useProductSearch } from '../products/useProductSearch';

export default function SalePage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const { activeSale } = useSaleStore();
  const { cashierId, terminalId, logout } = useAuth();
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    stockError,
    createSale,
    addItemToSale,
    updateItemQuantity,
    removeItem,
    applyDiscount,
    removeDiscount,
    freezeSale,
    cancelSale,
    clearError,
  } = useSale();

  const { searchByBarcode } = useProductSearch();

  // ES: Al montar, si no hay venta activa, crear una nueva
  // EN: On mount, if no active sale, create a new one
  useEffect(() => {
    if (!activeSale) {
      createSale();
    }
  }, []);

  const handleAddProduct = async (product: Product) => {
    await addItemToSale(product.id, undefined, 1);
  };

  const handleBarcodeProduct = async (product: Product) => {
    await addItemToSale(product.id, undefined, 1);
  };

  const handleFreeze = async () => {
    await freezeSale();
  };

  const handleCancelConfirm = async (reason: string) => {
    await cancelSale(reason);
    setShowCancelDialog(false);
  };

  const isActive = activeSale?.status === 'ACTIVE';
  const isFrozenOrActive = activeSale?.status === 'ACTIVE' || activeSale?.status === 'FROZEN';
  const hasDiscount = (activeSale?.discount ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ES: Header / EN: Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            🛒 {import.meta.env.VITE_STORE_NAME || 'Supermercado POS'}
          </h1>
          <span className="text-sm text-gray-500">
            Terminal: {terminalId}
          </span>
          {activeSale && <StatusBadge status={activeSale.status} />}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            👤 {cashierId}
          </span>
          <button
            onClick={() => navigate('/sale/frozen')}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors min-h-[44px]"
            aria-label="Ver ventas congeladas / View frozen sales"
          >
            ❄️ Congeladas / Frozen
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors min-h-[44px]"
            aria-label="Cerrar sesión / Logout"
          >
            Salir / Logout
          </button>
        </div>
      </header>

      {/* ES: Contenido principal / EN: Main content */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* ES: Panel izquierdo — búsqueda / EN: Left panel — search */}
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          {/* ES: Búsqueda de productos / EN: Product search */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              🔍 Productos / Products
            </h2>
            <ProductSearch
              onAddProduct={handleAddProduct}
              disabled={!isActive}
            />
            <div className="mt-4">
              <BarcodeScanner
                onProductFound={handleBarcodeProduct}
                searchByBarcode={searchByBarcode}
                disabled={!isActive}
              />
            </div>
          </div>

          {/* ES: Búsqueda de clientes / EN: Customer search */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <CustomerSearch disabled={!isActive} />
          </div>
        </div>

        {/* ES: Panel derecho — carrito / EN: Right panel — cart */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex-1 flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              🛒 Carrito / Cart
            </h2>

            {/* ES: Estado de carga / EN: Loading state */}
            {isLoading && (
              <div className="flex items-center gap-2 mb-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-500">Procesando... / Processing...</span>
              </div>
            )}

            {/* ES: Error general / EN: General error */}
            {error && (
              <ErrorMessage message={error} onRetry={clearError} className="mb-3" />
            )}

            {/* ES: Panel del carrito / EN: Cart panel */}
            <div className="flex-1 overflow-hidden">
              <CartPanel
                sale={activeSale}
                onUpdateQuantity={updateItemQuantity}
                onRemoveItem={removeItem}
                stockError={stockError}
                disabled={isLoading}
              />
            </div>

            {/* ES: Totales / EN: Totals */}
            <TotalsSummary sale={activeSale} />

            {/* ES: Formulario de descuento / EN: Discount form */}
            {isActive && (
              <DiscountForm
                onApplyDiscount={applyDiscount}
                onRemoveDiscount={removeDiscount}
                hasDiscount={hasDiscount}
                isLoading={isLoading}
                disabled={!isActive}
              />
            )}
          </div>

          {/* ES: Barra de acciones / EN: Action bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex gap-3">
              {/* ES: Botón congelar / EN: Freeze button */}
              {isActive && (
                <button
                  onClick={handleFreeze}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors min-h-[44px] disabled:opacity-50"
                  aria-label="Congelar venta / Freeze sale"
                >
                  ❄️ Congelar / Freeze
                </button>
              )}

              {/* ES: Botón cancelar / EN: Cancel button */}
              {isFrozenOrActive && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors min-h-[44px] disabled:opacity-50"
                  aria-label="Cancelar venta / Cancel sale"
                >
                  ✕ Cancelar / Cancel
                </button>
              )}

              {/* ES: Botón checkout / EN: Checkout button */}
              {isActive && (activeSale?.items?.length ?? 0) > 0 && (
                <button
                  onClick={() => setShowCheckout(true)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors min-h-[44px] disabled:opacity-50"
                  aria-label="Proceder al checkout / Proceed to checkout"
                >
                  💳 CHECKOUT
                </button>
              )}

              {/* ES: Botón nueva venta si no hay activa / EN: New sale button if none active */}
              {!activeSale && (
                <button
                  onClick={createSale}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors min-h-[44px] disabled:opacity-50"
                  aria-label="Nueva venta / New sale"
                >
                  ➕ Nueva Venta / New Sale
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ES: Diálogo de cancelación / EN: Cancel dialog */}
      <CancelDialog
        isOpen={showCancelDialog}
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelDialog(false)}
        isLoading={isLoading}
      />

      {/* ES: Modal de checkout / EN: Checkout modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </div>
  );
}
