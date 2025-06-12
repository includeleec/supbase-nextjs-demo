import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../ProductCard'
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
  onEdit: jest.fn(),
  onDelete: jest.fn(),
}

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} {...mockHandlers} />)
    
    expect(screen.getByText('测试商品')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试商品的描述')).toBeInTheDocument()
    expect(screen.getByText('¥99.99')).toBeInTheDocument()
    expect(screen.getByText('电子产品')).toBeInTheDocument()
    expect(screen.getByText('库存: 10')).toBeInTheDocument()
    expect(screen.getByText('上架')).toBeInTheDocument()
  })

  it('displays placeholder when no image is provided', () => {
    const productWithoutImage = { ...mockProduct, image_url: null }
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

  it('renders with image when image_url is provided', () => {
    render(<ProductCard product={mockProduct} {...mockHandlers} />)
    
    const image = screen.getByAltText('测试商品')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockProduct.image_url)
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
})