// ES: Pruebas unitarias para el mapeo de errores del cliente HTTP
// EN: Unit tests for HTTP client error mapping

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import axiosInstance from './axiosClient'
import { ApiError } from './ApiError'

const BASE_URL = 'http://localhost:8088';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('axiosClient error mapping', () => {
  it('should throw ApiError with status 503 for service unavailable', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/test`, () => {
        return HttpResponse.json(
          { message: 'Servicio no disponible, intente de nuevo / Service unavailable, please try again' },
          { status: 503 }
        );
      })
    );

    try {
      await axiosInstance.get('/api/v1/test');
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(503);
      expect((err as ApiError).message).toContain('Servicio no disponible');
    }
  });

  it('should throw ApiError with status 409 and outOfStockItems for conflict', async () => {
    const outOfStockItems = [
      { productId: 'p1', productName: 'Leche', requestedQuantity: 5, availableStock: 2 },
    ];

    server.use(
      http.post(`${BASE_URL}/api/v1/test`, () => {
        return HttpResponse.json(
          { message: 'Stock insuficiente / Insufficient stock', outOfStockItems },
          { status: 409 }
        );
      })
    );

    try {
      await axiosInstance.post('/api/v1/test', {});
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(409);
      expect((err as ApiError).outOfStockItems).toEqual(outOfStockItems);
    }
  });

  it('should throw ApiError with status 422 for unprocessable entity', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/test`, () => {
        return HttpResponse.json(
          { message: 'El descuento excede el subtotal / Discount exceeds subtotal' },
          { status: 422 }
        );
      })
    );

    try {
      await axiosInstance.post('/api/v1/test', {});
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(422);
      expect((err as ApiError).message).toContain('descuento excede');
    }
  });

  it('should throw ApiError with status 404 for not found', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/test`, () => {
        return HttpResponse.json(
          { message: 'Recurso no encontrado / Resource not found' },
          { status: 404 }
        );
      })
    );

    try {
      await axiosInstance.get('/api/v1/test');
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });

  it('should return data for successful requests', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/test`, () => {
        return HttpResponse.json({ id: '1', name: 'Test' });
      })
    );

    const response = await axiosInstance.get('/api/v1/test');
    expect(response.data).toEqual({ id: '1', name: 'Test' });
  });
});
