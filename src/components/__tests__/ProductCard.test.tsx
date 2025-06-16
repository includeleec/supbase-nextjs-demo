import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../ProductCard'
import { Product, ProductTranslation } from '@/types/database'

// Mock the cloudflare-images module
jest.mock('@/lib/cloudflare-images', () => ({
  getImageVariants: jest.fn((imageId: string) => ({
    thumbnail: `https://imagedelivery.net/hash/${imageId}/thumbnail`,
    small: `https://imagedelivery.net/hash/${imageId}/small`,
    medium: `https://imagedelivery.net/hash/${imageId}/medium`,
    large: `https://imagedelivery.net/hash/${imageId}/large`,
    original: `https://imagedelivery.net/hash/${imageId}/original`,
  }))
}))

// Mock debug-images
jest.mock('@/lib/debug-images', () => ({
  debugImageDisplay: jest.fn()
}))

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
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/image1.jpg',
      cloudflare_id: 'cf-id-1',
      is_primary: false,
      alt: '图片1',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'img-2',
      url: 'https://example.com/image2.jpg',
      cloudflare_id: 'cf-id-2',
      is_primary: true,
      alt: '图片2',
      created_at: '2024-01-02T00:00:00Z',
    }
  ],
  primary_image_id: 'img-2',
  category: '电子产品',
  stock_quantity: 10,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
}

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly with default Chinese language', () => {
    render(<ProductCard product={mockProduct} {...mockHandlers} />)
    
    expect(screen.getByText('测试商品')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试商品的描述')).toBeInTheDocument()
    expect(screen.getByText('¥99.99')).toBeInTheDocument()
    expect(screen.getByText('电子产品')).toBeInTheDocument()
    expect(screen.getByText('库存: 10')).toBeInTheDocument()
    expect(screen.getByText('上架')).toBeInTheDocument()
    expect(screen.getByText('Slug: test-product')).toBeInTheDocument()
  })

  it('displays placeholder when no image is provided', () => {
    const productWithoutImage = { ...mockProduct, images: [], primary_image_id: null }
    render(<ProductCard product={productWithoutImage} {...mockHandlers} />)
    
    expect(screen.getByText('暂无图片')).toBeInTheDocument()
  })

  it('shows inactive status correctly', () => {
    const inactiveProduct = { ...mockProduct, is_active: false }
    render(<ProductCard product={inactiveProduct} {...mockHandlers} />)
    
    expect(screen.getByText('下架')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<ProductCard product={mockProduct} {...mockHandlers} />)
    
    const editButton = screen.getByText('编辑')
    fireEvent.click(editButton)
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockProduct)
    expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<ProductCard product={mockProduct} {...mockHandlers} />)
    
    const deleteButton = screen.getByText('删除')
    fireEvent.click(deleteButton)
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockProduct.id)
    expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
  })

  it('renders without description when description is null', () => {
    const productWithoutDescription = { ...mockProduct, description: null }
    render(<ProductCard product={productWithoutDescription} {...mockHandlers} />)
    
    expect(screen.queryByText('这是一个测试商品的描述')).not.toBeInTheDocument()
    expect(screen.getByText('测试商品')).toBeInTheDocument()
  })

  it('renders with fallback URL when cloudflare_id is missing', () => {
    const productWithFallback = {
      ...mockProduct,
      images: [{
        id: 'img-3',
        url: 'https://example.com/fallback.jpg',
        cloudflare_id: null,
        is_primary: true,
        alt: '图片3',
        created_at: '2024-01-03T00:00:00Z',
      }],
      primary_image_id: 'img-3'
    }
    
    render(<ProductCard product={productWithFallback} {...mockHandlers} />)
    
    const image = screen.getByAltText('图片3')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/fallback.jpg')
  })

  it('renders with first image when primary_image_id is not found', () => {
    const productWithMissingPrimary = {
      ...mockProduct,
      primary_image_id: 'non-existent-id'
    }
    
    render(<ProductCard product={productWithMissingPrimary} {...mockHandlers} />)
    
    const image = screen.getByAltText('图片1')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })

  it('renders with primary image when images are provided', () => {
    render(<ProductCard product={mockProduct} {...mockHandlers} />)
    
    const image = screen.getByAltText('图片2')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image2.jpg')
  })

  it('applies correct CSS classes for active/inactive status', () => {
    const { rerender } = render(<ProductCard product={mockProduct} {...mockHandlers} />)
    
    let statusElement = screen.getByText('上架')
    expect(statusElement).toHaveClass('bg-green-100', 'text-green-800')
    
    const inactiveProduct = { ...mockProduct, is_active: false }
    rerender(<ProductCard product={inactiveProduct} {...mockHandlers} />)
    
    statusElement = screen.getByText('下架')
    expect(statusElement).toHaveClass('bg-red-100', 'text-red-800')
  })

  describe('Image carousel functionality', () => {
    it('displays image count indicator when multiple images exist', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      expect(screen.getByText('2/2')).toBeInTheDocument()
    })

    it('shows navigation arrows when multiple images exist', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      expect(screen.getByLabelText('上一张图片')).toBeInTheDocument()
      expect(screen.getByLabelText('下一张图片')).toBeInTheDocument()
    })

    it('does not show navigation arrows for single image', () => {
      const singleImageProduct = {
        ...mockProduct,
        images: [mockProduct.images[0]],
        primary_image_id: mockProduct.images[0].id
      }
      
      render(<ProductCard product={singleImageProduct} {...mockHandlers} />)
      
      expect(screen.queryByLabelText('上一张图片')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('下一张图片')).not.toBeInTheDocument()
    })

    it('navigates to next image when next button is clicked', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      // Initially showing primary image (index 1)
      expect(screen.getByText('2/2')).toBeInTheDocument()
      
      const nextButton = screen.getByLabelText('下一张图片')
      fireEvent.click(nextButton)
      
      // Should cycle to first image
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    it('navigates to previous image when prev button is clicked', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      // Initially showing primary image (index 1)
      expect(screen.getByText('2/2')).toBeInTheDocument()
      
      const prevButton = screen.getByLabelText('上一张图片')
      fireEvent.click(prevButton)
      
      // Should cycle to first image
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    it('displays dot indicators for each image', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      const dotIndicators = screen.getAllByLabelText(/查看第\d+张图片/)
      expect(dotIndicators).toHaveLength(2)
    })

    it('navigates to specific image when dot indicator is clicked', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      // Initially showing primary image (index 1)
      expect(screen.getByText('2/2')).toBeInTheDocument()
      
      const firstDot = screen.getByLabelText('查看第1张图片')
      fireEvent.click(firstDot)
      
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    it('starts with primary image displayed', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      // Should start with primary image (img-2, which is index 1)
      expect(screen.getByText('2/2')).toBeInTheDocument()
      expect(screen.getByText('主图')).toBeInTheDocument()
    })

    it('starts with first image when no primary image is set', () => {
      const productWithoutPrimary = {
        ...mockProduct,
        primary_image_id: null
      }
      
      render(<ProductCard product={productWithoutPrimary} {...mockHandlers} />)
      
      // Should start with first image
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })
  })

  describe('Multilingual support', () => {
    it('renders content in English when language is set to en', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} language="en" />)
      
      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('This is a test product description')).toBeInTheDocument()
    })

    it('renders content in Chinese when language is set to zh', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} language="zh" />)
      
      expect(screen.getByText('测试商品')).toBeInTheDocument()
      expect(screen.getByText('这是一个测试商品的描述')).toBeInTheDocument()
    })

    it('falls back to English when requested language is not available', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} language="ja" />)
      
      // Should fall back to English translation
      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('This is a test product description')).toBeInTheDocument()
    })

    it('falls back to original fields when no translations are available', () => {
      const productWithoutTranslations = { ...mockProduct, translations: [] }
      render(<ProductCard product={productWithoutTranslations} {...mockHandlers} language="en" />)
      
      // Should use original name and description fields
      expect(screen.getByText('测试商品')).toBeInTheDocument()
      expect(screen.getByText('这是一个测试商品的描述')).toBeInTheDocument()
    })
  })

  describe('Slug functionality', () => {
    it('displays slug when available', () => {
      render(<ProductCard product={mockProduct} {...mockHandlers} />)
      
      expect(screen.getByText('Slug: test-product')).toBeInTheDocument()
    })

    it('does not display slug section when slug is null', () => {
      const productWithoutSlug = { ...mockProduct, slug: null }
      render(<ProductCard product={productWithoutSlug} {...mockHandlers} />)
      
      expect(screen.queryByText(/Slug:/)).not.toBeInTheDocument()
    })

    it('does not display slug section when slug is empty', () => {
      const productWithEmptySlug = { ...mockProduct, slug: '' }
      render(<ProductCard product={productWithEmptySlug} {...mockHandlers} />)
      
      expect(screen.queryByText(/Slug:/)).not.toBeInTheDocument()
    })
  })
})