// ES: Panel del carrito de compras
// EN: Shopping cart panel

import CartItem from './CartItem';
import ErrorMessage from '../../shared/components/ErrorMessage';
import type { Sale } from '../../core/types/sale.types';

interface CartPanelProps {
  sale: Sale | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  stockError?: {
    message: string;
    items?: { productId: string; productName: string; availableStock: number }[];
  } | null;
  disabled?: boolean;
}

export default function CartPanel({
  sale,
  onUpdateQuantity,
  onRemoveItem,
  stockError,
  disabled = false,
}: CartPanelProps) {
  const isEditable = sale?.status === 'ACTIVE';

  return (
    <div className="flex flex-col h-full">
      {/* ES: Error de stock 409 / EN: Stock error 409 */}
      {stockError && (
        <div className="mb-3">
          <ErrorMessage message={stockError.message} />
          {stockError.items && stockError.items.length > 0 && (
            <ul className="mt-2 text-sm text-red-700 bg-red-50 rounded-lg p-3">
              {stockError.items.map((item) => (
                <li key={item.productId}>
                  {item.productName}: {item.availableStock} disponibles / available
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ES: Lista de ítems / EN: Items list */}
      {!sale || sale.items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-center py-8" role="status">
            🛒 Carrito vacío / Empty cart
            <br />
            <span className="text-sm">Busque y agregue productos / Search and add products</span>
          </p>
        </div>
      ) : (
        <ul
          className="flex-1 overflow-y-auto"
          aria-label="Ítems del carrito / Cart items"
        >
          {sale.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
              disabled={disabled || !isEditable}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
