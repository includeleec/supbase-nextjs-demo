import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUpload from '../ImageUpload'
import { ProductImage } from '@/types/database'

// Mock dependencies
jest.mock('@/lib/cloudflare-images', () => ({
  validateImageFile: jest.fn(),
  uploadMultipleImages: jest.fn(),
  getImageVariants: jest.fn(),
  deleteImageFromCloudflare: jest.fn(),
}))

jest.mock('@/lib/toast', () => ({
  showToast: jest.fn(),
}))

const mockValidateImageFile = require('@/lib/cloudflare-images').validateImageFile
const mockUploadMultipleImages = require('@/lib/cloudflare-images').uploadMultipleImages
const mockGetImageVariants = require('@/lib/cloudflare-images').getImageVariants
const mockDeleteImageFromCloudflare = require('@/lib/cloudflare-images').deleteImageFromCloudflare
const mockShowToast = require('@/lib/toast').showToast

const mockImages: ProductImage[] = [
  {
    id: '1',
    url: 'https://example.com/image1.jpg',
    cloudflare_id: 'cf-id-1',
    is_primary: true,
    alt: '测试图片1',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    url: 'https://example.com/image2.jpg',
    cloudflare_id: 'cf-id-2',
    is_primary: false,
    alt: '测试图片2',
    created_at: '2024-01-02T00:00:00Z',
  },
]

const defaultProps = {
  images: [],
  primaryImageId: null,
  onImagesChange: jest.fn(),
  onPrimaryImageChange: jest.fn(),
}

describe('ImageUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateImageFile.mockReturnValue({ isValid: true })
    mockGetImageVariants.mockReturnValue({
      small: 'https://imagedelivery.net/hash/test/small',
      thumbnail: 'https://imagedelivery.net/hash/test/thumbnail',
    })
  })

  it('renders upload area', () => {
    render(<ImageUpload {...defaultProps} />)
    
    expect(screen.getByText('拖拽图片到此处，或')).toBeInTheDocument()
    expect(screen.getByText('点击选择')).toBeInTheDocument()
    expect(screen.getByText(/支持 JPEG、PNG、WebP、GIF 格式/)).toBeInTheDocument()
  })

  it('displays existing images', () => {
    render(
      <ImageUpload 
        {...defaultProps} 
        images={mockImages} 
        primaryImageId="1"
      />
    )
    
    expect(screen.getByText('已上传图片 (2/10)')).toBeInTheDocument()
    expect(screen.getByText('主图')).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    const user = userEvent.setup()
    const onImagesChange = jest.fn()
    const onPrimaryImageChange = jest.fn()
    
    mockUploadMultipleImages.mockResolvedValue([
      {
        id: '3',
        url: 'https://example.com/image3.jpg',
        cloudflare_id: 'cf-id-3',
        is_primary: false,
        alt: 'test image',
        created_at: '2024-01-03T00:00:00Z',
      }
    ])

    render(
      <ImageUpload 
        {...defaultProps} 
        onImagesChange={onImagesChange}
        onPrimaryImageChange={onPrimaryImageChange}
      />
    )
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      // Simulate file input change event
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(input)
    }

    await waitFor(() => {
      expect(mockUploadMultipleImages).toHaveBeenCalledWith([file], expect.any(Function))
      expect(onImagesChange).toHaveBeenCalled()
      expect(onPrimaryImageChange).toHaveBeenCalledWith('3') // Set first image as primary
    })
  })

  it('validates file types', async () => {
    mockValidateImageFile.mockReturnValue({ 
      isValid: false, 
      error: '只支持 JPEG、PNG、WebP 和 GIF 格式的图片' 
    })

    render(<ImageUpload {...defaultProps} />)
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(input)
    }

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'test.txt: 只支持 JPEG、PNG、WebP 和 GIF 格式的图片', 
        'error'
      )
    })
  })

  it('handles image removal', async () => {
    const user = userEvent.setup()
    const onImagesChange = jest.fn()
    const onPrimaryImageChange = jest.fn()
    
    mockDeleteImageFromCloudflare.mockResolvedValue(true)

    render(
      <ImageUpload 
        {...defaultProps} 
        images={mockImages}
        primaryImageId="1"
        onImagesChange={onImagesChange}
        onPrimaryImageChange={onPrimaryImageChange}
      />
    )
    
    // Find and click delete button for first image
    const deleteButtons = screen.getAllByTitle('删除图片')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteImageFromCloudflare).toHaveBeenCalledWith('cf-id-1')
      expect(onImagesChange).toHaveBeenCalled()
      expect(onPrimaryImageChange).toHaveBeenCalled()
    })
  })

  it('handles setting primary image', async () => {
    const user = userEvent.setup()
    const onPrimaryImageChange = jest.fn()

    render(
      <ImageUpload 
        {...defaultProps} 
        images={mockImages}
        primaryImageId="1"
        onPrimaryImageChange={onPrimaryImageChange}
      />
    )
    
    // Find and click "set as primary" button for second image
    const setPrimaryButton = screen.getByTitle('设为主图')
    await user.click(setPrimaryButton)

    expect(onPrimaryImageChange).toHaveBeenCalledWith('2')
    expect(mockShowToast).toHaveBeenCalledWith('主图设置成功', 'success')
  })

  it('respects maximum image limit', async () => {
    render(
      <ImageUpload 
        {...defaultProps} 
        images={mockImages}
        maxImages={2}
      />
    )
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(input)
    }

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('最多只能上传 2 张图片', 'error')
    })
  })

  it('shows upload progress', async () => {
    let progressCallback: ((completed: number, total: number) => void) | undefined

    mockUploadMultipleImages.mockImplementation((files, onProgress) => {
      progressCallback = onProgress
      return new Promise(resolve => {
        setTimeout(() => {
          progressCallback?.(1, 1)
          resolve([])
        }, 100)
      })
    })

    render(<ImageUpload {...defaultProps} />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(input)
    }

    // Should show upload progress
    await waitFor(() => {
      expect(screen.getByText(/上传中/)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.queryByText(/上传中/)).not.toBeInTheDocument()
    })
  })

  it('handles drag and drop', async () => {
    const onImagesChange = jest.fn()
    
    mockUploadMultipleImages.mockResolvedValue([])

    render(
      <ImageUpload 
        {...defaultProps} 
        onImagesChange={onImagesChange}
      />
    )
    
    const dropZone = screen.getByText('拖拽图片到此处，或').closest('div')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    if (dropZone) {
      Object.defineProperty(file, 'type', {
        value: 'image/jpeg',
        writable: false,
      })
      
      const dataTransfer = {
        files: [file],
      }
      
      fireEvent.drop(dropZone, { dataTransfer })
    }

    await waitFor(() => {
      expect(mockUploadMultipleImages).toHaveBeenCalledWith([file], expect.any(Function))
    })
  })
})