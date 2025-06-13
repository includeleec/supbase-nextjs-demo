import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { Admin } from '@/types/database'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

const mockAdmin: Admin = {
  id: '1',
  username: 'admin',
  password: 'hashedpassword',
  email: 'admin@example.com',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Test component to access the auth context
const TestComponent = () => {
  const { admin, isAuthenticated, isLoading, login, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="username">{admin?.username || 'null'}</div>
      <button onClick={() => login(mockAdmin)}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide initial state when no stored admin', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('username')).toHaveTextContent('null')
  })

  it('should load stored admin from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAdmin))
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('username')).toHaveTextContent('admin')
  })

  it('should handle corrupt localStorage data', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('username')).toHaveTextContent('null')
  })

  it('should login and store admin', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Initial state - not authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    
    // Login
    act(() => {
      screen.getByText('Login').click()
    })
    
    // Should be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('username')).toHaveTextContent('admin')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_session', JSON.stringify(mockAdmin))
  })

  it('should logout and clear admin', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAdmin))
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Should be authenticated initially
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    
    // Logout
    act(() => {
      screen.getByText('Logout').click()
    })
    
    // Should not be authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('username')).toHaveTextContent('null')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_session')
  })

  it('should throw error when used outside provider', () => {
    // Suppress console error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })
})