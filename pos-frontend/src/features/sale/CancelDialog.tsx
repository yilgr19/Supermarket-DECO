// ES: Modal de cancelación de venta con campo de motivo
// EN: Sale cancellation modal with reason field

import { useState } from 'react';

const MAX_REASON_LENGTH = 255;

interface CancelDialogProps {
  isOpen: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CancelDialog({ isOpen, onConfirm, onCancel, isLoading = false }: CancelDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('El motivo es requerido / Reason is required');
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    setError(null);
    onCancel();
  };

  const charsRemaining = MAX_REASON_LENGTH - reason.length;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 id="cancel-dialog-title" className="text-xl font-bold text-gray-900 mb-2">
          ✕ Cancelar Venta / Cancel Sale
        </h2>
        <p className="text-gray-600 mb-4">
          Esta acción no se puede deshacer. / This action cannot be undone.
        </p>

        {/* ES: Campo de motivo / EN: Reason field */}
        <div className="mb-4">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de cancelación / Cancellation reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => {
              if (e.target.value.length <= MAX_REASON_LENGTH) {
                setReason(e.target.value);
                setError(null);
              }
            }}
            placeholder="Ingrese el motivo de cancelación / Enter cancellation reason"
            rows={4}
            maxLength={MAX_REASON_LENGTH}
            aria-label="Motivo de cancelación / Cancellation reason"
            aria-describedby="reason-counter"
            aria-invalid={!!error}
            className={`w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {/* ES: Contador de caracteres / EN: Character counter */}
          <p
            id="reason-counter"
            className={`text-right text-xs mt-1 ${charsRemaining < 20 ? 'text-red-500' : 'text-gray-400'}`}
          >
            {charsRemaining} caracteres restantes / characters remaining
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* ES: Botones de acción / EN: Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Volver / Go back"
          >
            Volver / Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors min-h-[44px] min-w-[44px] disabled:opacity-50"
            aria-label="Confirmar cancelación / Confirm cancellation"
          >
            {isLoading ? 'Cancelando...' : '✕ Confirmar Cancelación'}
          </button>
        </div>
      </div>
    </div>
  );
}
