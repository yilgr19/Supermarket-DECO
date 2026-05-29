// ES: Catálogo solo lectura desde GET /api/productos (Lambda)
// EN: Read-only catalog from GET /api/productos (Lambda)

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'
import { formatCop } from '../../shared/utils/formatCurrency'
import { loadLambdaCatalog, mapProductoToProduct } from '../../adapters/http/lambdaCatalogCache'
import { LAMBDA_UNAVAILABLE_MSG } from '../../config/api'
import { PosAppHeader } from '../../shared/components/PosAppHeader'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { Product } from '../../core/types/product.types'
import { getErrorMessage } from '../../infrastructure/http/ApiError'

export function LambdaCatalogReadOnly() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLambdaCatalog()
      .then((rows) => setItems(rows.map(mapProductoToProduct)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <PosAppHeader
        icon={<Package className="h-5 w-5" aria-hidden="true" />}
        title="Catálogo (solo lectura)"
        subtitle="Lambda · sin crear/editar/eliminar"
        actions={
          <button type="button" className="pos-btn-secondary" onClick={() => navigate('/sale')}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a venta
          </button>
        }
      />
      <main className="pos-page pos-page--wide flex-1">
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {LAMBDA_UNAVAILABLE_MSG}
        </p>
        {loading && <LoadingSpinner label="Cargando catálogo" />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          <div className="pos-card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Código barras</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="p-3 font-mono text-xs">{p.id}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{formatCop(p.unitPrice)}</td>
                    <td className="p-3">{p.availableStock}</td>
                    <td className="p-3 font-mono text-xs">{p.barcode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
