import {
  getPrimaryImage,
  getPrimaryImageUrl,
  getAllImageUrls,
  updatePrimaryImage,
  addImagesToList,
  removeImageFromList,
  validateProductImages,
  generateImageAlt,
  isValidImageUrl
} from '../image-utils'
import { ProductImage } from '@/types/database'

// Mock cloudflare-images module
jest.mock('../cloudflare-images', () => ({
  getImageVariants: (imageId: string) => ({
    thumbnail: `https://imagedelivery.net/hash/${imageId}/thumbnail`,
    small: `https://imagedelivery.net/hash/${imageId}/small`,
    medium: `https://imagedelivery.net/hash/${imageId}/medium`,
    large: `https://imagedelivery.net/hash/${imageId}/large`,
    original: `https://imagedelivery.net/hash/${imageId}/public`,
  })
}))

const mockImages: ProductImage[] = [
  {
    id: '1',
    url: 'https://example.com/image1.jpg',
    cloudflare_id: 'cf-id-1',
    is_primary: false,
    alt: '测试图片1',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    url: 'https://example.com/image2.jpg',
    cloudflare_id: 'cf-id-2',
    is_primary: true,
    alt: '测试图片2',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    url: 'https://example.com/image3.jpg',
    cloudflare_id: null,
    is_primary: false,
    alt: '测试图片3',
    created_at: '2024-01-03T00:00:00Z',
  },
]

describe('image-utils', () => {
  describe('getPrimaryImage', () => {
    it('should return image with specified primary ID', () => {
      const result = getPrimaryImage(mockImages, '1')
      expect(result?.id).toBe('1')
    })

    it('should return image marked as primary when no ID specified', () => {
      const result = getPrimaryImage(mockImages)
      expect(result?.id).toBe('2')
      expect(result?.is_primary).toBe(true)
    })

    it('should return first image when no primary image exists', () => {
      const imagesWithoutPrimary = mockImages.map(img => ({ ...img, is_primary: false }))
      const result = getPrimaryImage(imagesWithoutPrimary)
      expect(result?.id).toBe('1')
    })

    it('should return null for empty array', () => {
      const result = getPrimaryImage([])
      expect(result).toBeNull()
    })
  })

  describe('getPrimaryImageUrl', () => {
    it('should return Cloudflare URL for image with cloudflare_id', () => {
      const result = getPrimaryImageUrl(mockImages, '2', 'medium')
      expect(result).toBe('https://imagedelivery.net/hash/cf-id-2/medium')
    })

    it('should return original URL for image without cloudflare_id', () => {
      const result = getPrimaryImageUrl(mockImages, '3')
      expect(result).toBe('https://example.com/image3.jpg')
    })

    it('should return null for empty images', () => {
      const result = getPrimaryImageUrl([])
      expect(result).toBeNull()
    })
  })

  describe('getAllImageUrls', () => {
    it('should return all image URLs', () => {
      const result = getAllImageUrls(mockImages, 'small')
      expect(result).toEqual([
        'https://imagedelivery.net/hash/cf-id-1/small',
        'https://imagedelivery.net/hash/cf-id-2/small',
        'https://example.com/image3.jpg'
      ])
    })

    it('should return empty array for empty images', () => {
      const result = getAllImageUrls([])
      expect(result).toEqual([])
    })
  })

  describe('updatePrimaryImage', () => {
    it('should update primary image correctly', () => {
      const result = updatePrimaryImage(mockImages, '3')
      
      expect(result.find(img => img.id === '1')?.is_primary).toBe(false)
      expect(result.find(img => img.id === '2')?.is_primary).toBe(false)
      expect(result.find(img => img.id === '3')?.is_primary).toBe(true)
    })
  })

  describe('addImagesToList', () => {
    it('should add new images to existing list', () => {
      const newImages: ProductImage[] = [
        {
          id: '4',
          url: 'https://example.com/image4.jpg',
          cloudflare_id: null,
          is_primary: false,
          alt: '测试图片4',
          created_at: '2024-01-04T00:00:00Z',
        }
      ]

      const result = addImagesToList(mockImages, newImages)
      expect(result).toHaveLength(4)
      expect(result[3].id).toBe('4')
    })
  })

  describe('removeImageFromList', () => {
    it('should remove image with specified ID', () => {
      const result = removeImageFromList(mockImages, '2')
      expect(result).toHaveLength(2)
      expect(result.find(img => img.id === '2')).toBeUndefined()
    })
  })

  describe('validateProductImages', () => {
    it('should validate correct images', () => {
      const result = validateProductImages(mockImages)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should detect missing required fields', () => {
      const invalidImages: ProductImage[] = [
        {
          id: '',
          url: '',
          cloudflare_id: null,
          is_primary: false,
          alt: '',
          created_at: '',
        }
      ]

      const result = validateProductImages(invalidImages)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('第 1 张图片缺少 ID')
      expect(result.errors).toContain('第 1 张图片缺少 URL 或 Cloudflare ID')
      expect(result.errors).toContain('第 1 张图片缺少 alt 文本')
      expect(result.errors).toContain('第 1 张图片缺少创建时间')
    })

    it('should handle non-array input', () => {
      const result = validateProductImages('not an array' as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('图片数据必须是数组格式')
    })
  })

  describe('generateImageAlt', () => {
    it('should generate alt text for main image', () => {
      const result = generateImageAlt('测试商品', 0, true)
      expect(result).toBe('测试商品 - 主图')
    })

    it('should generate alt text for non-main image', () => {
      const result = generateImageAlt('测试商品', 1, false)
      expect(result).toBe('测试商品 - 图片 2')
    })
  })

  describe('isValidImageUrl', () => {
    it('should validate HTTP URLs', () => {
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true)
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidImageUrl('ftp://example.com/image.jpg')).toBe(false)
      expect(isValidImageUrl('not-a-url')).toBe(false)
      expect(isValidImageUrl('')).toBe(false)
    })
  })
})