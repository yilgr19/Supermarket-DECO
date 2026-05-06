// ES: Pruebas del componente LoginPage
// EN: LoginPage component tests

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'

// ES: Mock del hook useAuth para aislar el componente
// EN: Mock useAuth hook to isolate the component
const mockHandleLogin = vi.fn()
vi.mock('./useAuth', () => ({
  useAuth: () => ({
    cashierId: null,
    terminalId: null,
    isAuthenticated: false,
    handleLogin: mockHandleLogin,
    handleLogout: vi.fn(),
  }),
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders cashier and terminal inputs', () => {
    renderLogin()
    expect(screen.getByLabelText(/ID de Cajero/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ID de Terminal/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', () => {
    renderLogin()
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i })
    // ES: Limpiar el campo de terminal que tiene valor por defecto
    // EN: Clear terminal field that has a default value
    fireEvent.change(screen.getByLabelText(/ID de Terminal/i), { target: { value: '' } })
    fireEvent.click(submitBtn)
    expect(screen.getByText(/ID de cajero requerido/i)).toBeInTheDocument()
    expect(screen.getByText(/ID de terminal requerido/i)).toBeInTheDocument()
  })

  it('calls handleLogin with correct values on valid submit', () => {
    renderLogin()
    fireEvent.change(screen.getByLabelText(/ID de Cajero/i), {
      target: { value: 'CAJERO-01' },
    })
    fireEvent.change(screen.getByLabelText(/ID de Terminal/i), {
      target: { value: 'TERM-001' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))
    expect(mockHandleLogin).toHaveBeenCalledWith('CAJERO-01', 'TERM-001')
  })
})
