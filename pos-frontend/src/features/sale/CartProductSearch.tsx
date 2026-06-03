// ES: Búsqueda y barcode integrados en el carrito (sin modal)
// EN: Inline cart product search and barcode (no modal)

import type { RefObject } from 'react'
import { ProductSearch } from '../products/ProductSearch'
import { BarcodeScanner } from '../products/BarcodeScanner'
import type { Product } from '../../core/types/product.types'

interface CartProductSearchProps {
  searchInputRef?: RefObject<HTMLInputElement | null>
  disabled?: boolean
  onAddProduct: (product: Product) => void
  onBarcodeProduct: (product: Product) => void
}

export function CartProductSearch({
  searchInputRef,
  disabled = false,
  onAddProduct,
  onBarcodeProduct,
}: CartProductSearchProps) {
  if (disabled) return null

  return (
    <section
      className="shrink-0 border-t border-slate-200 bg-slate-50/80 px-1 pt-4"
      aria-label="Agregar productos al carrito / Add products to cart"
    >
      <h3 className="pos-section-title mb-3">Agregar producto / Add product</h3>
      <ProductSearch
        searchInputRef={searchInputRef}
        onAddProduct={onAddProduct}
        compact
      />
      <div className="mt-3 border-t border-slate-200/80 pt-3">
        <BarcodeScanner onProductFound={onBarcodeProduct} />
      </div>
    </section>
  )
}
