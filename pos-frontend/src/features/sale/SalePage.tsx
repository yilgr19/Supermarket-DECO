// ES: Pantalla principal de venta POS
// EN: Main POS sale screen

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Snowflake, XCircle, ShoppingBag, LogOut, List, Package, Search, UserSearch, UserCheck } from 'lucide-react'
import { useSale } from './useSale'
import { CartPanel } from './CartPanel'
import { TotalsSummary } from './TotalsSummary'
import { CancelDialog } from './CancelDialog'
import { ProductSearchModal } from '../products/ProductSearchModal'
import { CustomerSearchModal } from '../customers/CustomerSearchModal'
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
    applyItemDiscount,
    freezeSale,
    cancelSale,
  } = useSale()

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [discountErrorItemId, setDiscountErrorItemId] = useState<string | null>(null)

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

  const handleApplyItemDiscount = async (itemId: string, type: DiscountType, value: number) => {
    setDiscountErrorItemId(null)
    const result = await applyItemDiscount(itemId, type, value)
    if (!result) setDiscountErrorItemId(itemId)
  }

  const handleRemoveItemDiscount = async (itemId: string) => {
    setDiscountErrorItemId(null)
    await applyItemDiscount(itemId, 'FIXED_AMOUNT', 0)
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

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-3 p-4">
        <div className="pos-action-bar">
          <button
            type="button"
            onClick={() => setShowProductSearch(true)}
            disabled={!isActive || isLoading}
            className="pos-action-btn pos-action-btn--product"
          >
            <span className="pos-action-btn__icon" aria-hidden="true">
              <Search className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="pos-action-btn__label">Buscar producto</span>
              <span className="pos-action-btn__hint">Search product</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowCustomerSearch(true)}
            disabled={!isActive || isLoading}
            className="pos-action-btn pos-action-btn--customer"
          >
            <span className="pos-action-btn__icon" aria-hidden="true">
              <UserSearch className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="pos-action-btn__label">Buscar cliente</span>
              <span className="pos-action-btn__hint">Search customer</span>
            </span>
          </button>
          {selectedCustomer && (
            <button
              type="button"
              onClick={() => setShowCustomerSearch(true)}
              className="pos-customer-chip"
            >
              <span className="pos-customer-chip__icon" aria-hidden="true">
                <UserCheck className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="pos-customer-chip__name">{selectedCustomer.fullName}</span>
                <span className="pos-customer-chip__meta">
                  {selectedCustomer.documentType}: {selectedCustomer.documentNumber}
                </span>
              </span>
            </button>
          )}
        </div>

        <section className="pos-card flex min-h-0 flex-1 flex-col">
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

          <div className="min-h-0 flex-1 overflow-y-auto">
            <CartPanel
              sale={activeSale}
              isLoading={isLoading}
              stockError={error?.outOfStockItems ?? null}
              discountErrorItemId={discountErrorItemId}
              discountErrorMessage={error?.message ?? null}
              onUpdateQuantity={updateItemQuantity}
              onRemoveItem={removeItem}
              onApplyItemDiscount={handleApplyItemDiscount}
              onRemoveItemDiscount={handleRemoveItemDiscount}
            />
          </div>
        </section>

        {activeSale && (
          <>
            <TotalsSummary sale={activeSale} />

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
      </main>

      <ProductSearchModal
        isOpen={showProductSearch}
        onClose={() => setShowProductSearch(false)}
        onAddProduct={handleAddProduct}
        onBarcodeProduct={handleBarcodeProduct}
      />

      <CustomerSearchModal
        isOpen={showCustomerSearch}
        onClose={() => setShowCustomerSearch(false)}
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
