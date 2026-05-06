// ES: Pruebas de componente para CartPanel
// EN: Component tests for CartPanel

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPanel from './CartPanel';
import type { Sale } from '../../core/types/sale.types';

const mockSale: Sale = {
  id: 'sale-1',
  terminalId: 'TERM-001',
  cashierId: 'cashier-1',
  status: 'ACTIVE',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productName: 'Leche 1L',
      unitPrice: 2400,
      quantity: 2,
      lineTotal: 4800,
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      productName: 'Pan Integral',
      unitPrice: 1200,
      quantity: 1,
      lineTotal: 1200,
    },
  ],
  subtotal: 6000,
  tax: 1140,
  discount: 0,
  total: 7140,
  createdAt: new Date().toISOString(),
};

describe('CartPanel', () => {
  const mockOnUpdateQuantity = vi.fn();
  const mockOnRemoveItem = vi.fn();

  beforeEach(() => {
    mockOnUpdateQuantity.mockClear();
    mockOnRemoveItem.mockClear();
  });

  it('should show empty cart message when no items', () => {
    render(
      <CartPanel
        sale={null}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    expect(screen.getByText(/Carrito vacío/i)).toBeInTheDocument();
  });

  it('should render cart items', () => {
    render(
      <CartPanel
        sale={mockSale}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    expect(screen.getByText('Leche 1L')).toBeInTheDocument();
    expect(screen.getByText('Pan Integral')).toBeInTheDocument();
  });

  it('should show stock error when provided', () => {
    const stockError = {
      message: 'Stock insuficiente / Insufficient stock',
      items: [
        { productId: 'prod-1', productName: 'Leche 1L', availableStock: 3 },
      ],
    };

    render(
      <CartPanel
        sale={mockSale}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        stockError={stockError}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    // ES: Verificar que el mensaje de stock aparece en la lista de error
    // EN: Verify stock message appears in the error list
    expect(screen.getByText(/3 disponibles/i)).toBeInTheDocument();
  });

  it('should disable controls when sale is not ACTIVE', () => {
    const frozenSale = { ...mockSale, status: 'FROZEN' as const };

    render(
      <CartPanel
        sale={frozenSale}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    // ES: Los inputs de cantidad deben estar deshabilitados
    // EN: Quantity inputs should be disabled
    const quantityInputs = screen.getAllByRole('spinbutton');
    quantityInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('should call onRemoveItem after confirmation', async () => {
    render(
      <CartPanel
        sale={mockSale}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
      />
    );

    // ES: Hacer clic en el botón de eliminar del primer ítem
    // EN: Click the remove button of the first item
    const removeButtons = screen.getAllByRole('button', { name: /eliminar/i });
    await userEvent.click(removeButtons[0]);

    // ES: Confirmar la eliminación
    // EN: Confirm the removal
    const confirmButton = screen.getByRole('button', { name: /confirmar eliminación/i });
    await userEvent.click(confirmButton);

    expect(mockOnRemoveItem).toHaveBeenCalledWith('item-1');
  });
});
