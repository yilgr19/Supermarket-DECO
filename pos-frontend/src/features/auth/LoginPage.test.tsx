// ES: Pruebas de componente para LoginPage
// EN: Component tests for LoginPage

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useSessionStore } from '../../infrastructure/store/sessionStore';

// ES: Mock de useNavigate / EN: Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useSessionStore.setState({ cashierId: null, terminalId: null, isAuthenticated: false });
  });

  it('should render login form with cashier and terminal fields', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/ID del cajero/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ID del terminal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', async () => {
    renderLoginPage();

    // ES: Limpiar el campo de terminal que tiene valor por defecto
    // EN: Clear the terminal field that has a default value
    const terminalInput = screen.getByLabelText(/ID del terminal/i);
    await userEvent.clear(terminalInput);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/El ID del cajero es requerido/i)).toBeInTheDocument();
    });
  });

  it('should show error when cashier ID is empty', async () => {
    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/El ID del cajero es requerido/i)).toBeInTheDocument();
    });
  });

  it('should login and navigate to /sale on successful submit', async () => {
    renderLoginPage();

    const cashierInput = screen.getByLabelText(/ID del cajero/i);
    await userEvent.type(cashierInput, 'CAJERO-001');

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sale');
    });

    expect(useSessionStore.getState().isAuthenticated).toBe(true);
    expect(useSessionStore.getState().cashierId).toBe('CAJERO-001');
  });

  it('should store cashier ID and terminal ID in session store', async () => {
    renderLoginPage();

    const cashierInput = screen.getByLabelText(/ID del cajero/i);
    const terminalInput = screen.getByLabelText(/ID del terminal/i);

    await userEvent.clear(terminalInput);
    await userEvent.type(cashierInput, 'CAJERO-002');
    await userEvent.type(terminalInput, 'TERM-002');

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      const state = useSessionStore.getState();
      expect(state.cashierId).toBe('CAJERO-002');
      expect(state.terminalId).toBe('TERM-002');
    });
  });
});
