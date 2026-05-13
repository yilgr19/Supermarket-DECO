// ES: Pantalla principal de venta POS
// EN: Main POS sale screen

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Snowflake, XCircle, ShoppingBag, LogOut, List, Package } from 'lucide-react'
import { useSale } from './useSale'
import { CartPanel } from './CartPanel'
import { TotalsSummary } from './TotalsSummary'
import { DiscountForm } from './DiscountForm'
import { CancelDialog } from './CancelDialog'
import { ProductSearch } from '../products/ProductSearch'
import { BarcodeScanner } from '../products/BarcodeScanner'
import { CustomerSearch } from '../customers/CustomerSearch'
import { CheckoutModal } from '../checkout/CheckoutModal'
import { SaleStatusBadge } from '../../shared/components/StatusBadge'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { useSessionStore } from '../../infrastructure/store/sessionStore'
import { useSaleStore } from '../../infrastructure/store/saleStore'
import type { Product } from '../../core/types/product.types'
import type { DiscountType } from '../../core/types/sale.types'

export function SalePage() {
  const navigate = useNavigate()
  const { cashierId, terminalId, logout } = useSessionStore()
  const { selectedCustomer, setSelectedCustomer } = useSaleStore()
  const {
    activeSale,
    isLoading,
    error,
    clearError,
    createSale,
    patchSaleCustomer,
    addItemToSale,
    updateItemQuantity,
    removeItem,
    applyDiscount,
    freezeSale,
    cancelSale,
  } = useSale()

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [discountError, setDiscountError] = useState<string | null>(null)

  // ES: Crear venta automáticamente al montar si no hay una activa
  // EN: Auto-create sale on mount if none is active
  useEffect(() => {
    if (!activeSale && terminalId) {
      void createSale()
    }
  }, [activeSale, terminalId, createSale])

  const handleAddProduct = async (product: Product) => {
    await addItemToSale(product.id, undefined, 1)
  }

  const handleBarcodeProduct = async (product: Product) => {
    await addItemToSale(product.id, undefined, 1)
  }

  const handleApplyDiscount = async (type: DiscountType, value: number) => {
    setDiscountError(null)
    const result = await applyDiscount(type, value)
    if (!result) setDiscountError(error?.message ?? 'Error al aplicar descuento')
  }

  const handleRemoveDiscount = async () => {
    await applyDiscount('FIXED_AMOUNT', 0)
  }

  const handleFreeze = async () => {
    await freezeSale()
  }

  const handleCancel = async (reason: string) => {
    await cancelSale(reason)
    setShowCancelDialog(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = activeSale?.status === 'ACTIVE'
  const isFrozenOrActive =
    activeSale?.status === 'ACTIVE' || activeSale?.status === 'FROZEN'

  return (
    <div className="flex min-h-screen flex-col">
      {/* ES: Header / EN: Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3.5 text-white shadow-pos-lg">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <ShoppingBag className="h-5 w-5 text-violet-200" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">
                {import.meta.env.VITE_STORE_NAME || 'Supermercado POS'}
              </p>
              <p className="truncate text-xs text-slate-400">
                Terminal <span className="text-violet-200">{terminalId}</span>
                {' · '}
                Cajero <span className="text-violet-200">{cashierId}</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {activeSale && <SaleStatusBadge status={activeSale.status} />}
            <button
              onClick={() => navigate('/products')}
              className="pos-btn-quiet"
              aria-label="Administrar catálogo / Manage catalog"
              type="button"
            >
              <Package className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/sale/frozen')}
              className="pos-btn-quiet"
              aria-label="Ver ventas congeladas / View frozen sales"
              type="button"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="pos-btn-quiet"
              aria-label="Cerrar sesión / Logout"
              type="button"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ES: Contenido principal / EN: Main content */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-5">
        {/* ES: Panel izquierdo: búsqueda / EN: Left panel: search */}
        <aside className="flex flex-col gap-4 lg:w-80 xl:w-96 lg:shrink-0">
          <section className="pos-card !p-4 sm:!p-5">
            <h2 className="pos-section-title">Productos / Products</h2>
            <ProductSearch onAddProduct={handleAddProduct} />
            <div className="mt-3">
              <BarcodeScanner onProductFound={handleBarcodeProduct} />
            </div>
          </section>

          <section className="pos-card !p-4 sm:!p-5">
            <h2 className="pos-section-title">Cliente / Customer</h2>
            <CustomerSearch
              selectedCustomer={selectedCustomer}
              onSelectCustomer={async (customer) => {
                const updated = await patchSaleCustomer(customer.id)
                if (updated) setSelectedCustomer(customer)
              }}
              onClearCustomer={async () => {
                const updated = await patchSaleCustomer(null)
                if (updated) setSelectedCustomer(null)
              }}
            />
          </section>
        </aside>

        {/* ES: Panel derecho: carrito / EN: Right panel: cart */}
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="pos-card flex-1">
            <h2 className="pos-section-title">Carrito / Cart</h2>

            {isLoading && !activeSale && (
              <div className="flex justify-center py-8">
                <LoadingSpinner label="Creando venta..." />
              </div>
            )}

            {error && !isLoading && (
              <ErrorMessage
                message={error.message ?? ''}
                onRetry={() => {
                  clearError()
                  void createSale()
                }}
              />
            )}

            <CartPanel
              sale={activeSale}
              isLoading={isLoading}
              stockError={error?.outOfStockItems ?? null}
              onUpdateQuantity={updateItemQuantity}
              onRemoveItem={removeItem}
            />
          </div>

          {activeSale && (
            <>
              <TotalsSummary sale={activeSale} />

              {isActive && (
                <DiscountForm
                  hasDiscount={(activeSale.discount ?? 0) > 0}
                  isLoading={isLoading}
                  error={discountError}
                  onApply={handleApplyDiscount}
                  onRemove={handleRemoveDiscount}
                />
              )}

              {/* ES: Barra de acciones / EN: Action bar */}
              <div className="flex flex-wrap gap-3">
                {isActive && (
                  <button
                    onClick={handleFreeze}
                    disabled={isLoading}
                    type="button"
                    className="pos-btn-freeze disabled:opacity-50"
                  >
                    <Snowflake className="h-4 w-4" aria-hidden="true" />
                    Congelar / Freeze
                  </button>
                )}

                {isFrozenOrActive && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isLoading}
                    type="button"
                    className="pos-btn-danger flex-1 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Cancelar / Cancel
                  </button>
                )}

                {isActive && (
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={isLoading || activeSale.items.length === 0}
                    type="button"
                    className="pos-btn-primary min-w-[140px] flex-1 shadow-indigo-500/20 disabled:opacity-50"
                  >
                    Checkout
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ES: Modales / EN: Modals */}
      <CancelDialog
        isOpen={showCancelDialog}
        isLoading={isLoading}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
      />

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        selectedCustomer={selectedCustomer}
      />
    </div>
  )
}
