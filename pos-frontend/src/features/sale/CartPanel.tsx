// ES: Panel del carrito de compras
// EN: Shopping cart panel

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { CartItemRow } from './CartItem'
import type { Sale, SaleItem } from '../../core/types/sale.types'
import type { DiscountType, OutOfStockItem } from '../../core/types/sale.types'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'

interface CartPanelProps {
  sale: Sale | null
  isLoading: boolean
  stockError: OutOfStockItem[] | null
  discountErrorItemId: string | null
  discountErrorMessage: string | null
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onApplyItemDiscount: (itemId: string, type: DiscountType, value: number) => void
  onRemoveItemDiscount: (itemId: string) => void
}

export function CartPanel({
  sale,
  isLoading,
  stockError,
  discountErrorItemId,
  discountErrorMessage,
  onUpdateQuantity,
  onRemoveItem,
  onApplyItemDiscount,
  onRemoveItemDiscount,
}: CartPanelProps) {
  const [itemPendingRemove, setItemPendingRemove] = useState<SaleItem | null>(null)

  const isEditable = sale?.status === 'ACTIVE'

  if (!sale && isLoading) {
    return null
  }

  if (!sale || sale.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <ShoppingCart className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-600">Carrito vacío / Empty cart</p>
        <p className="mt-1 max-w-[240px] text-xs text-slate-400">
          Busca productos o usa el código de barras / Search or scan barcode
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {stockError && stockError.length > 0 && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm"
          >
            <p className="mb-2 text-sm font-semibold text-amber-900">Stock insuficiente</p>
            <ul className="space-y-1.5">
              {stockError.map((item) => (
                <li key={item.productId} className="text-xs text-amber-800">
                  <span className="font-semibold">{item.productName}</span>
                  {' — '}
                  solicitado {item.requested}, disponible {item.available}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul className="divide-y divide-slate-100" aria-label="Ítems del carrito / Cart items">
          {sale.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              isEditable={isEditable && !isLoading}
              isLoading={isLoading}
              discountError={
                discountErrorItemId === item.id ? discountErrorMessage : null
              }
              onUpdateQuantity={onUpdateQuantity}
              onRequestRemove={(line) => setItemPendingRemove(line)}
              onApplyDiscount={(type, value) => onApplyItemDiscount(item.id, type, value)}
              onRemoveDiscount={() => onRemoveItemDiscount(item.id)}
            />
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={!!itemPendingRemove}
        onOpenChange={(open) => {
          if (!open) setItemPendingRemove(null)
        }}
        title="Quitar producto / Remove line"
        description={
          itemPendingRemove
            ? `¿Eliminar «${itemPendingRemove.productName}» del carrito? / Remove this line from the cart?`
            : undefined
        }
        cancelLabel="Cancelar / Cancel"
        confirmLabel="Confirmar eliminación / Confirm removal"
        pending={isLoading}
        onConfirm={() => {
          if (itemPendingRemove) {
            onRemoveItem(itemPendingRemove.id)
            setItemPendingRemove(null)
          }
        }}
      />
    </>
  )
}
