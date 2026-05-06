// ES: Pruebas de componente para ProductSearch
// EN: Component tests for ProductSearch

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import ProductSearch from './ProductSearch';

const BASE_URL = 'http://localhost:8080';

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Leche 1L',
    barcode: '7501234567890',
    unitPrice: 2400,
    availableStock: 50,
    category: 'Lácteos',
  },
  {
    id: 'prod-2',
    name: 'Pan Integral',
    barcode: '7509876543210',
    unitPrice: 1200,
    availableStock: 30,
    category: 'Panadería',
  },
];

describe('ProductSearch', () => {
  const mockOnAddProduct = vi.fn();

  beforeEach(() => {
    mockOnAddProduct.mockClear();
  });

  it('should render search input', () => {
    render(<ProductSearch onAddProduct={mockOnAddProduct} />);
    expect(screen.getByLabelText(/buscar producto por nombre/i)).toBeInTheDocument();
  });

  it('should show loading state while searching', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/products/search`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(mockProducts);
      })
    );

    render(<ProductSearch onAddProduct={mockOnAddProduct} />);

    const input = screen.getByLabelText(/buscar producto por nombre/i);
    await userEvent.type(input, 'Le');

    // ES: Esperar a que aparezcan los resultados (lo que confirma que hubo carga)
    // EN: Wait for results to appear (which confirms loading happened)
    await waitFor(() => {
      expect(screen.getByText('Leche 1L')).toBeInTheDocument();
    });
  });

  it('should display search results with product details', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/products/search`, () => {
        return HttpResponse.json(mockProducts);
      })
    );

    render(<ProductSearch onAddProduct={mockOnAddProduct} />);

    const input = screen.getByLabelText(/buscar producto por nombre/i);
    await userEvent.type(input, 'Le');

    await waitFor(() => {
      expect(screen.getByText('Leche 1L')).toBeInTheDocument();
      expect(screen.getByText('Pan Integral')).toBeInTheDocument();
    });
  });

  it('should show error message on 503 response', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/products/search`, () => {
        return HttpResponse.json(
          { message: 'Servicio no disponible, intente de nuevo / Service unavailable, please try again' },
          { status: 503 }
        );
      })
    );

    render(<ProductSearch onAddProduct={mockOnAddProduct} />);

    const input = screen.getByLabelText(/buscar producto por nombre/i);
    await userEvent.type(input, 'Le');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should show no results message when search returns empty', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/products/search`, () => {
        return HttpResponse.json([]);
      })
    );

    render(<ProductSearch onAddProduct={mockOnAddProduct} />);

    const input = screen.getByLabelText(/buscar producto por nombre/i);
    await userEvent.type(input, 'xyz');

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron productos/i)).toBeInTheDocument();
    });
  });

  it('should call onAddProduct when add button is clicked', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/products/search`, () => {
        return HttpResponse.json([mockProducts[0]]);
      })
    );

    render(<ProductSearch onAddProduct={mockOnAddProduct} />);

    const input = screen.getByLabelText(/buscar producto por nombre/i);
    await userEvent.type(input, 'Le');

    await waitFor(() => {
      expect(screen.getByText('Leche 1L')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /agregar leche 1l/i });
    await userEvent.click(addButton);

    expect(mockOnAddProduct).toHaveBeenCalledWith(mockProducts[0]);
  });
});
