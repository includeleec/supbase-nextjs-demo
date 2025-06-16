import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductModal from '../ProductModal'
import { Product, ProductTranslation } from '@/types/database'

const mockTranslations: ProductTranslation[] = [
  { language: 'en', name: 'Test Product', description: 'This is a test product description' },
  { language: 'zh', name: '测试商品', description: '这是一个测试商品的描述' }
]

const mockProduct: Product = {
  id: '1',
  name: '测试商品',
  description: '这是一个测试商品的描述',
  slug: 'test-product',
  translations: mockTranslations,
  price: 99.99,
  images: [],
  primary_image_id: null,
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
    expect(screen.getByText('支持语言 * (英文必选)')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByLabelText('URL Slug *')).toBeInTheDocument()
    expect(screen.getByLabelText('价格 *')).toBeInTheDocument()
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
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument() // English name
    expect(screen.getByDisplayValue('测试商品')).toBeInTheDocument() // Chinese name
    expect(screen.getByDisplayValue('test-product')).toBeInTheDocument() // slug
    expect(screen.getByDisplayValue('99.99')).toBeInTheDocument()
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
    
    // Fill form fields - English name (required)
    await user.type(screen.getByLabelText('商品名称 *'), 'New Product')
    await user.type(screen.getByLabelText('URL Slug *'), 'new-product')
    await user.type(screen.getByLabelText('价格 *'), '199.99')
    await user.type(screen.getByLabelText('分类'), '新分类')
    await user.type(screen.getByLabelText('库存数量'), '20')
    
    // Submit form
    const submitButton = screen.getByText('添加')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockHandlers.onSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Product',
        slug: 'new-product',
        price: 199.99,
        category: '新分类',
        stock_quantity: 20,
        is_active: true,
        translations: expect.arrayContaining([
          expect.objectContaining({
            language: 'en',
            name: 'New Product'
          })
        ])
      }))
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
    const nameInput = screen.getByDisplayValue('Test Product')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Product')
    
    // Submit form
    const submitButton = screen.getByText('更新')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockHandlers.onSave).toHaveBeenCalledWith(expect.objectContaining({
        id: mockProduct.id,
        name: 'Updated Product',
        slug: mockProduct.slug,
        price: mockProduct.price,
        category: mockProduct.category,
        stock_quantity: mockProduct.stock_quantity,
        is_active: mockProduct.is_active,
        translations: expect.arrayContaining([
          expect.objectContaining({
            language: 'en',
            name: 'Updated Product'
          })
        ])
      }))
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
    
    await act(async () => {
      await user.click(checkbox)
    })
    expect(checkbox).not.toBeChecked()
    
    await act(async () => {
      await user.click(checkbox)
    })
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
    
    expect(screen.getByLabelText('URL Slug *')).toHaveValue('')
  })

  describe('Multilingual functionality', () => {
    it('renders language selection with English required', () => {
      render(
        <ProductModal
          isOpen={true}
          {...mockHandlers}
        />
      )
      
      expect(screen.getByText('支持语言 * (英文必选)')).toBeInTheDocument()
      
      const englishCheckbox = screen.getByLabelText(/English/)
      expect(englishCheckbox).toBeChecked()
      expect(englishCheckbox).toBeDisabled()
    })

    it('allows adding and removing non-English languages', async () => {
      const user = userEvent.setup()
      render(
        <ProductModal
          isOpen={true}
          {...mockHandlers}
        />
      )
      
      // Add Chinese language
      const chineseCheckbox = screen.getByLabelText(/中文/)
      expect(chineseCheckbox).not.toBeChecked()
      
      await user.click(chineseCheckbox)
      expect(chineseCheckbox).toBeChecked()
      
      // Should show Chinese input fields
      expect(screen.getByText('中文')).toBeInTheDocument()
      
      // Remove Chinese language
      await user.click(chineseCheckbox)
      expect(chineseCheckbox).not.toBeChecked()
    })

    it('loads existing translations when editing product', () => {
      render(
        <ProductModal
          isOpen={true}
          product={mockProduct}
          {...mockHandlers}
        />
      )
      
      // Should show both English and Chinese sections
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('中文')).toBeInTheDocument()
      
      // Should show translated content
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
      expect(screen.getByDisplayValue('测试商品')).toBeInTheDocument()
    })
  })

  describe('Slug functionality', () => {
    it('renders slug input field', () => {
      render(
        <ProductModal
          isOpen={true}
          {...mockHandlers}
        />
      )
      
      expect(screen.getByLabelText('URL Slug *')).toBeInTheDocument()
      expect(screen.getByText('用于生成 SEO 友好的 URL，只能包含字母、数字、连字符')).toBeInTheDocument()
    })

    it('allows manual slug input', async () => {
      const user = userEvent.setup()
      render(
        <ProductModal
          isOpen={true}
          {...mockHandlers}
        />
      )
      
      const slugInput = screen.getByLabelText('URL Slug *')
      await user.type(slugInput, 'custom-slug')
      
      expect(slugInput).toHaveValue('custom-slug')
    })

    it('loads existing slug when editing product', () => {
      render(
        <ProductModal
          isOpen={true}
          product={mockProduct}
          {...mockHandlers}
        />
      )
      
      expect(screen.getByDisplayValue('test-product')).toBeInTheDocument()
    })
  })
})