// ES: Modal de checkout con toggle Efectivo/Crédito
// EN: Checkout modal with Cash/Credit toggle

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from './useCheckout';
import { useSaleStore } from '../../infrastructure/store/saleStore';
import CashPaymentForm from './CashPaymentForm';
import CreditPaymentForm from './CreditPaymentForm';
import ErrorMessage from '../../shared/components/ErrorMessage';
import type { PaymentType } from '../../core/types/sale.types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>('CASH');
  const [amountReceived, setAmountReceived] = useState(0);

  const { activeSale, selectedCustomer, clearSale } = useSaleStore();
  const { isLoading, error, checkoutCash, checkoutCredit, clearError } = useCheckout();
  const navigate = useNavigate();

  if (!isOpen || !activeSale) return null;

  const handlePaymentTypeChange = (type: PaymentType) => {
    setPaymentType(type);
    clearError();
  };

  const handleConfirm = async () => {
    let receipt = null;

    if (paymentType === 'CASH') {
      receipt = await checkoutCash(amountReceived);
    } else {
      receipt = await checkoutCredit();
    }

    if (receipt) {
      clearSale();
      navigate(`/receipt/${receipt.transactionId}`);
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  const isCreditBlocked =
    paymentType === 'CREDIT' &&
    (!selectedCustomer || selectedCustomer.creditStatus !== 'APPROVED');

  const isCashBlocked =
    paymentType === 'CASH' && amountReceived < activeSale.total;

  const isConfirmDisabled = isLoading || isCreditBlocked || isCashBlocked;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        {/* ES: Encabezado / EN: Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="checkout-title" className="text-2xl font-bold text-gray-900">
            💳 Checkout
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar checkout / Close checkout"
          >
            ✕
          </button>
        </div>

        {/* ES: Toggle Efectivo/Crédito / EN: Cash/Credit toggle */}
        <div className="flex gap-2 mb-6" role="group" aria-label="Método de pago / Payment method">
          <button
            onClick={() => handlePaymentTypeChange('CASH')}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] ${
              paymentType === 'CASH'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
            aria-pressed={paymentType === 'CASH'}
            aria-label="Pago en efectivo / Cash payment"
          >
            💵 Efectivo / Cash
          </button>
          <button
            onClick={() => handlePaymentTypeChange('CREDIT')}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors min-h-[44px] ${
              paymentType === 'CREDIT'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
            aria-pressed={paymentType === 'CREDIT'}
            aria-label="Pago a crédito / Credit payment"
          >
            💳 Crédito / Credit
          </button>
        </div>

        {/* ES: Formulario según método de pago / EN: Form based on payment method */}
        {paymentType === 'CASH' ? (
          <CashPaymentForm
            total={activeSale.total}
            onAmountChange={setAmountReceived}
            disabled={isLoading}
          />
        ) : (
          <CreditPaymentForm
            customer={selectedCustomer}
            total={activeSale.total}
          />
        )}

        {/* ES: Error de checkout / EN: Checkout error */}
        {error && (
          <div className="mt-4">
            <ErrorMessage message={error.message} />
            {error.outOfStockItems && error.outOfStockItems.length > 0 && (
              <ul className="mt-2 text-sm text-red-700 bg-red-50 rounded-lg p-3">
                <p className="font-medium mb-1">Productos sin stock / Out of stock products:</p>
                {error.outOfStockItems.map((item) => (
                  <li key={item.productId}>
                    {item.productName}: {item.availableStock} disponibles / available
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ES: Botones de acción / EN: Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            aria-label="Cancelar checkout / Cancel checkout"
          >
            Cancelar / Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors min-h-[44px] disabled:opacity-50"
            aria-label="Confirmar pago / Confirm payment"
          >
            {isLoading ? 'Procesando...' : '✓ Confirmar Pago / Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
