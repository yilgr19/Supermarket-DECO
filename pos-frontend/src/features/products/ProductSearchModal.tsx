// ES: Modal de búsqueda y agregado de productos
// EN: Product search and add modal

import { X } from 'lucide-react'
import { ProductSearch } from './ProductSearch'
import { BarcodeScanner } from './BarcodeScanner'
import type { Product } from '../../core/types/product.types'

interface ProductSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProduct: (product: Product) => void
  onBarcodeProduct: (product: Product) => void
}

export function ProductSearchModal({
  isOpen,
  onClose,
  onAddProduct,
  onBarcodeProduct,
}: ProductSearchModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="pos-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-search-title"
    >
      <div className="pos-modal-panel flex max-h-[min(90vh,720px)] max-w-xl flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="pos-modal-eyebrow">
              Productos / Products
            </p>
            <h2 id="product-search-title" className="pos-modal-title">
              Buscar producto / Search product
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pos-modal-close"
            aria-label="Cerrar / Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <ProductSearch onAddProduct={onAddProduct} />
          <div className="mt-4 border-t border-slate-100 pt-4">
            <BarcodeScanner onProductFound={onBarcodeProduct} />
          </div>
        </div>

        <div className="mt-4 shrink-0 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="pos-btn-secondary w-full justify-center">
            Cerrar / Close
          </button>
        </div>
      </div>
    </div>
  )
}
