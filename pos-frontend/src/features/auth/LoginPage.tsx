// ES: Página de inicio de sesión del cajero
// EN: Cashier login page

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../infrastructure/store/sessionStore';

export default function LoginPage() {
  const [cashierId, setCashierId] = useState('');
  const [terminalId, setTerminalId] = useState(
    import.meta.env.VITE_TERMINAL_ID || 'TERM-001'
  );
  const [errors, setErrors] = useState<{ cashierId?: string; terminalId?: string }>({});

  const { login } = useSessionStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { cashierId?: string; terminalId?: string } = {};
    if (!cashierId.trim()) {
      newErrors.cashierId = 'El ID del cajero es requerido / Cashier ID is required';
    }
    if (!terminalId.trim()) {
      newErrors.terminalId = 'El ID del terminal es requerido / Terminal ID is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    login(cashierId.trim(), terminalId.trim());
    navigate('/sale');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* ES: Encabezado / EN: Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {import.meta.env.VITE_STORE_NAME || 'Supermercado POS'}
          </h1>
          <p className="text-gray-500 mt-2">
            Sistema de Punto de Venta / Point of Sale System
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ES: Campo ID del cajero / EN: Cashier ID field */}
          <div className="mb-6">
            <label
              htmlFor="cashierId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ID del Cajero / Cashier ID
            </label>
            <input
              id="cashierId"
              type="text"
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
              placeholder="Ej: CAJERO-001"
              aria-label="ID del cajero / Cashier ID"
              aria-describedby={errors.cashierId ? 'cashierId-error' : undefined}
              aria-invalid={!!errors.cashierId}
              className={`w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cashierId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cashierId && (
              <p id="cashierId-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.cashierId}
              </p>
            )}
          </div>

          {/* ES: Campo ID del terminal / EN: Terminal ID field */}
          <div className="mb-8">
            <label
              htmlFor="terminalId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ID del Terminal / Terminal ID
            </label>
            <input
              id="terminalId"
              type="text"
              value={terminalId}
              onChange={(e) => setTerminalId(e.target.value)}
              placeholder="Ej: TERM-001"
              aria-label="ID del terminal / Terminal ID"
              aria-describedby={errors.terminalId ? 'terminalId-error' : undefined}
              aria-invalid={!!errors.terminalId}
              className={`w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.terminalId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.terminalId && (
              <p id="terminalId-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.terminalId}
              </p>
            )}
          </div>

          {/* ES: Botón de inicio de sesión / EN: Login button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors min-h-[44px]"
            aria-label="Iniciar sesión / Login"
          >
            Iniciar Sesión / Login
          </button>
        </form>
      </div>
    </div>
  );
}
