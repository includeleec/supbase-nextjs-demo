import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../page'
import { supabase } from '@/lib/supabase'
import { AuthProvider } from '@/contexts/AuthContext'
import { Admin } from '@/types/database'

// Mock the supabase module
jest.mock('@/lib/supabase')

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

const renderWithAuth = (component: React.ReactNode, isAuthenticated = true) => {
  if (isAuthenticated) {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAdmin))
  } else {
    localStorageMock.getItem.mockReturnValue(null)
  }
  
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

const mockSupabase = supabase as jest.Mocked<typeof supabase>

const mockProducts = [
  {
    id: '1',
    name: '笔记本电脑',
    description: '高性能笔记本电脑',
    price: 5999.99,
    image_url: 'https://example.com/laptop.jpg',
    category: '电子产品',
    stock_quantity: 10,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '智能手机',
    description: '最新款智能手机',
    price: 3999.99,
    image_url: 'https://example.com/phone.jpg',
    category: '电子产品',
    stock_quantity: 15,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: '咖啡杯',
    description: '陶瓷咖啡杯',
    price: 29.99,
    image_url: 'https://example.com/mug.jpg',
    category: '家居用品',
    stock_quantity: 50,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock implementation
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockProducts, error: null }),
    } as any)
  })

  it('renders login form when not authenticated', () => {
    renderWithAuth(<HomePage />, false)
    expect(screen.getByText('管理员登录')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument()
  })

  it('renders loading state initially when authenticated', () => {
    // Mock a long-running request
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves
    } as any)

    renderWithAuth(<HomePage />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('renders products list when data is loaded', async () => {
    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('商品列表')).toBeInTheDocument()
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
      expect(screen.getByText('智能手机')).toBeInTheDocument()
      expect(screen.getByText('咖啡杯')).toBeInTheDocument()
    })
  })

  it('renders empty state when no products exist', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    } as any)

    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('暂无商品')).toBeInTheDocument()
      expect(screen.getByText('添加第一个商品')).toBeInTheDocument()
    })
  })

  it('opens modal when add product button is clicked', async () => {
    const user = userEvent.setup()
    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
    })
    
    const addButton = screen.getByRole('button', { name: '添加商品' })
    await user.click(addButton)
    
    expect(screen.getByRole('heading', { name: '添加商品' })).toBeInTheDocument()
  })

  it('filters products by search term', async () => {
    const user = userEvent.setup()
    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('搜索商品名称或描述...')
    await user.type(searchInput, '笔记本')
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
      expect(screen.queryByText('智能手机')).not.toBeInTheDocument()
      expect(screen.queryByText('咖啡杯')).not.toBeInTheDocument()
    })
  })

  it('filters products by category', async () => {
    const user = userEvent.setup()
    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
    })
    
    const categorySelect = screen.getByDisplayValue('所有分类')
    await user.selectOptions(categorySelect, '家居用品')
    
    await waitFor(() => {
      expect(screen.queryByText('笔记本电脑')).not.toBeInTheDocument()
      expect(screen.queryByText('智能手机')).not.toBeInTheDocument()
      expect(screen.getByText('咖啡杯')).toBeInTheDocument()
    })
  })

  it('shows "没有找到匹配的商品" when filter returns no results', async () => {
    const user = userEvent.setup()
    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText('搜索商品名称或描述...')
    await user.type(searchInput, '不存在的商品')
    
    await waitFor(() => {
      expect(screen.getByText('没有找到匹配的商品')).toBeInTheDocument()
    })
  })

  it('handles product deletion', async () => {
    const user = userEvent.setup()
    
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
    })
    
    // Mock successful deletion after initial render
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
      order: jest.fn().mockResolvedValue({ data: mockProducts.slice(1), error: null }),
    } as any)
    
    const deleteButtons = screen.getAllByText('删除')
    await user.click(deleteButtons[0])
    
    expect(confirmSpy).toHaveBeenCalledWith('确定要删除这个商品吗？')
    
    confirmSpy.mockRestore()
  })

  it('handles product editing', async () => {
    const user = userEvent.setup()
    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
    })
    
    const editButtons = screen.getAllByText('编辑')
    await user.click(editButtons[0])
    
    expect(screen.getByText('编辑商品')).toBeInTheDocument()
    expect(screen.getByDisplayValue('笔记本电脑')).toBeInTheDocument()
  })

  it('handles product creation', async () => {
    const user = userEvent.setup()
    
    // Mock successful creation
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ 
        data: [...mockProducts, {
          id: '4',
          name: '新商品',
          description: '新商品描述',
          price: 99.99,
          image_url: null,
          category: '测试分类',
          stock_quantity: 5,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }], 
        error: null 
      }),
    } as any)

    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(screen.getByText('笔记本电脑')).toBeInTheDocument()
    })
    
    // Open modal
    const addButton = screen.getByRole('button', { name: '添加商品' })
    await user.click(addButton)
    
    // Fill form
    await user.type(screen.getByLabelText('商品名称 *'), '新商品')
    await user.type(screen.getByLabelText('商品描述'), '新商品描述')
    await user.type(screen.getByLabelText('价格 *'), '99.99')
    await user.type(screen.getByLabelText('分类'), '测试分类')
    await user.type(screen.getByLabelText('库存数量'), '5')
    
    // Submit
    const submitButton = screen.getByText('添加')
    await user.click(submitButton)
    
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('编辑商品')).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: new Error('API Error') }),
    } as any)

    renderWithAuth(<HomePage />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('获取商品失败:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })
})