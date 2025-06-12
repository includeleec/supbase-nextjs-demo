import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductModal from '../ProductModal'
import { Product } from '@/types/database'

const mockProduct: Product = {
  id: '1',
  name: '测试商品',
  description: '这是一个测试商品的描述',
  price: 99.99,
  image_url: 'https://example.com/image.jpg',
  category: '电子产品',
  stock_quantity: 10,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockHandlers = {
  onClose: jest.fn(),
  onSave: jest.fn(),
}

describe('ProductModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(
      <ProductModal
        isOpen={false}
        {...mockHandlers}
      />
    )
    
    expect(screen.queryByText('添加商品')).not.toBeInTheDocument()
  })

  it('renders add product form when no product is provided', () => {
    render(
      <ProductModal
        isOpen={true}
        {...mockHandlers}
      />
    )
    
    expect(screen.getByText('添加商品')).toBeInTheDocument()
    expect(screen.getByText('添加')).toBeInTheDocument()
    
    // Check all form fields are present
    expect(screen.getByLabelText('商品名称 *')).toBeInTheDocument()
    expect(screen.getByLabelText('商品描述')).toBeInTheDocument()
    expect(screen.getByLabelText('价格 *')).toBeInTheDocument()
    expect(screen.getByLabelText('图片链接')).toBeInTheDocument()
    expect(screen.getByLabelText('分类')).toBeInTheDocument()
    expect(screen.getByLabelText('库存数量')).toBeInTheDocument()
    expect(screen.getByLabelText('上架销售')).toBeInTheDocument()
  })

  it('renders edit product form when product is provided', () => {
    render(
      <ProductModal
        isOpen={true}
        product={mockProduct}
        {...mockHandlers}
      />
    )
    
    expect(screen.getByText('编辑商品')).toBeInTheDocument()
    expect(screen.getByText('更新')).toBeInTheDocument()
    
    // Check form is populated with product data
    expect(screen.getByDisplayValue('测试商品')).toBeInTheDocument()
    expect(screen.getByDisplayValue('这是一个测试商品的描述')).toBeInTheDocument()
    expect(screen.getByDisplayValue('99.99')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeInTheDocument()
    expect(screen.getByDisplayValue('电子产品')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ProductModal
        isOpen={true}
        {...mockHandlers}
      />
    )
    
    const cancelButton = screen.getByText('取消')
    await user.click(cancelButton)
    
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
  })

  it('renders modal with backdrop', () => {
    render(
      <ProductModal
        isOpen={true}
        {...mockHandlers}
      />
    )
    
    // Check that modal backdrop exists
    const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    expect(backdrop).toBeInTheDocument()
  })

  it('submits form for new product creation', async () => {
    const user = userEvent.setup()
    render(
      <ProductModal
        isOpen={true}
        {...mockHandlers}
      />
    )
    
    // Fill form fields
    await user.type(screen.getByLabelText('商品名称 *'), '新商品')
    await user.type(screen.getByLabelText('商品描述'), '新商品描述')
    await user.type(screen.getByLabelText('价格 *'), '199.99')
    await user.type(screen.getByLabelText('图片链接'), 'https://example.com/new-image.jpg')
    await user.type(screen.getByLabelText('分类'), '新分类')
    await user.type(screen.getByLabelText('库存数量'), '20')
    
    // Submit form
    const submitButton = screen.getByText('添加')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockHandlers.onSave).toHaveBeenCalledWith({
        name: '新商品',
        description: '新商品描述',
        price: 199.99,
        image_url: 'https://example.com/new-image.jpg',
        category: '新分类',
        stock_quantity: 20,
        is_active: true,
      })
    })
    
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
  })

  it('submits form for product update', async () => {
    const user = userEvent.setup()
    render(
      <ProductModal
        isOpen={true}
        product={mockProduct}
        {...mockHandlers}
      />
    )
    
    // Modify product name
    const nameInput = screen.getByLabelText('商品名称 *')
    await user.clear(nameInput)
    await user.type(nameInput, '更新后的商品')
    
    // Submit form
    const submitButton = screen.getByText('更新')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockHandlers.onSave).toHaveBeenCalledWith({
        id: mockProduct.id,
        name: '更新后的商品',
        description: mockProduct.description,
        price: mockProduct.price,
        image_url: mockProduct.image_url,
        category: mockProduct.category,
        stock_quantity: mockProduct.stock_quantity,
        is_active: mockProduct.is_active,
      })
    })
    
    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1)
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <ProductModal
        isOpen={true}
        {...mockHandlers}
      />
    )
    
    // Try to submit without required fields
    const submitButton = screen.getByText('添加')
    await user.click(submitButton)
    
    // Form should not be submitted
    expect(mockHandlers.onSave).not.toHaveBeenCalled()
    expect(mockHandlers.onClose).not.toHaveBeenCalled()
  })

  it('handles checkbox toggle correctly', async () => {
    const user = userEvent.setup()
    render(
      <ProductModal
        isOpen={true}
        {...mockHandlers}
      />
    )
    
    const checkbox = screen.getByLabelText('上架销售')
    expect(checkbox).toBeChecked()
    
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('resets form when modal is opened/closed', () => {
    const { rerender } = render(
      <ProductModal
        isOpen={false}
        {...mockHandlers}
      />
    )
    
    // Open modal with product
    rerender(
      <ProductModal
        isOpen={true}
        product={mockProduct}
        {...mockHandlers}
      />
    )
    
    expect(screen.getByDisplayValue('测试商品')).toBeInTheDocument()
    
    // Close and reopen without product
    rerender(
      <ProductModal
        isOpen={false}
        {...mockHandlers}
      />
    )
    
    rerender(
      <ProductModal
        isOpen={true}
        {...mockHandlers}
      />
    )
    
    expect(screen.getByLabelText('商品名称 *')).toHaveValue('')
  })
})