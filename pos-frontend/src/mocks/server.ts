// ES: Servidor MSW para pruebas unitarias y de componentes
// EN: MSW server for unit and component tests

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
