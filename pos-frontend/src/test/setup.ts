// ES: Configuración global de pruebas
// EN: Global test setup

import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';

// ES: Inicia el servidor MSW antes de todas las pruebas
// EN: Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// ES: Resetea los handlers después de cada prueba
// EN: Reset handlers after each test
afterEach(() => server.resetHandlers());

// ES: Cierra el servidor después de todas las pruebas
// EN: Close server after all tests
afterAll(() => server.close());
