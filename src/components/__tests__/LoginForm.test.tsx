import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'
import { AuthProvider } from '@/contexts/AuthContext'
import { login } from '@/lib/auth'
import { showToast } from '@/lib/toast'

// Mock the dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/toast')

const mockLogin = login as jest.MockedFunction<typeof login>
const mockShowToast = showToast as jest.MockedFunction<typeof showToast>

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

const mockAdmin = {
  id: '1',
  username: 'admin',
  password: 'hashedpassword',
  email: 'admin@example.com',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const renderLoginForm = () => {
  localStorageMock.getItem.mockReturnValue(null)
  
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form', () => {
    renderLoginForm()
    
    expect(screen.getByText('管理员登录')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
    expect(screen.getByText('默认账户: admin / admin123')).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(mockAdmin)
    
    renderLoginForm()
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const passwordInput = screen.getByPlaceholderText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'admin123')
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123')
      expect(mockShowToast).toHaveBeenCalledWith('登录成功！', 'success')
    })
  })

  it('handles login error', async () => {
    const user = userEvent.setup()
    const errorMessage = '用户名或密码错误'
    mockLogin.mockRejectedValue(new Error(errorMessage))
    
    renderLoginForm()
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const passwordInput = screen.getByPlaceholderText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', 'wrongpassword')
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error')
    })
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    // Mock a slow login
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockAdmin), 1000)))
    
    renderLoginForm()
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const passwordInput = screen.getByPlaceholderText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'admin123')
    await user.click(loginButton)
    
    expect(screen.getByText('登录中...')).toBeInTheDocument()
    expect(loginButton).toBeDisabled()
  })

  it('requires username and password fields', async () => {
    const user = userEvent.setup()
    
    renderLoginForm()
    
    const loginButton = screen.getByRole('button', { name: '登录' })
    await user.click(loginButton)
    
    // Form should not submit without required fields
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error('网络错误'))
    
    renderLoginForm()
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const passwordInput = screen.getByPlaceholderText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'admin123')
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('网络错误', 'error')
    })
  })

  it('handles unknown errors', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue('unknown error')
    
    renderLoginForm()
    
    const usernameInput = screen.getByPlaceholderText('用户名')
    const passwordInput = screen.getByPlaceholderText('密码')
    const loginButton = screen.getByRole('button', { name: '登录' })
    
    await user.type(usernameInput, 'admin')
    await user.type(passwordInput, 'admin123')
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('登录失败', 'error')
    })
  })
})