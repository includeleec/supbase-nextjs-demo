// Mock cloudflare-images module first (before imports)
jest.mock('../cloudflare-images', () => ({
  getImageVariants: jest.fn((imageId: string) => ({
    thumbnail: `https://imagedelivery.net/test-hash/${imageId}/thumbnail`,
    small: `https://imagedelivery.net/test-hash/${imageId}/small`,
    medium: `https://imagedelivery.net/test-hash/${imageId}/medium`,
    large: `https://imagedelivery.net/test-hash/${imageId}/large`,
    original: `https://imagedelivery.net/test-hash/${imageId}/public`,
  }))
}))

import {
  debugImageDisplay,
  debugImageUpload,
  debugImageDeletion,
  validateCloudflareConfig
} from '../debug-images'
import { ProductImage } from '@/types/database'

// Mock console methods
const consoleSpy = {
  group: jest.spyOn(console, 'group').mockImplementation(),
  groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation(),
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
}

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  status: 200,
  statusText: 'OK'
} as Response))

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
    cloudflare_id: null,
    is_primary: false,
    alt: '测试图片2',
    created_at: '2024-01-02T00:00:00Z',
  },
]

describe('debug-images', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH
    delete process.env.CLOUDFLARE_ACCOUNT_ID
    delete process.env.CLOUDFLARE_API_TOKEN
  })

  afterAll(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore())
  })

  describe('debugImageDisplay', () => {
    it('should log image display information', () => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH = 'test-hash'
      
      debugImageDisplay(mockImages, '1')

      expect(consoleSpy.group).toHaveBeenCalledWith('🖼️ 图片显示调试')
      expect(consoleSpy.log).toHaveBeenCalledWith('📊 基本信息:')
      expect(consoleSpy.log).toHaveBeenCalledWith('- 图片数量:', 2)
      expect(consoleSpy.log).toHaveBeenCalledWith('- 主图ID:', '1')
      expect(consoleSpy.log).toHaveBeenCalledWith('- CLOUDFLARE_IMAGES_HASH:', '已配置')
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it('should handle empty images array', () => {
      debugImageDisplay([], null)

      expect(consoleSpy.log).toHaveBeenCalledWith('❌ 没有找到图片')
    })

    it('should detect missing cloudflare hash', () => {
      debugImageDisplay(mockImages, '1')

      expect(consoleSpy.log).toHaveBeenCalledWith('- CLOUDFLARE_IMAGES_HASH:', '未配置')
    })

    it('should test URL accessibility', async () => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH = 'test-hash'

      debugImageDisplay(mockImages, '1')

      // Wait for async fetch call
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(fetch).toHaveBeenCalled()
    })
  })

  describe('debugImageUpload', () => {
    it('should log upload results', () => {
      const cloudflareResult = {
        id: 'cf-test-id',
        filename: 'test.jpg',
        uploaded: '2024-01-01T00:00:00Z'
      }

      debugImageUpload(cloudflareResult, mockImages[0])

      expect(consoleSpy.group).toHaveBeenCalledWith('📤 图片上传调试')
      expect(consoleSpy.log).toHaveBeenCalledWith('Cloudflare 响应:', cloudflareResult)
      expect(consoleSpy.log).toHaveBeenCalledWith('生成的 ProductImage:', mockImages[0])
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it('should test variant URLs', async () => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH = 'test-hash'

      const cloudflareResult = { id: 'cf-test-id' }
      debugImageUpload(cloudflareResult, mockImages[0])

      // Wait for async fetch calls
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(fetch).toHaveBeenCalledTimes(3) // thumbnail, medium, original
    })
  })

  describe('debugImageDeletion', () => {
    it('should log deletion information', () => {
      process.env.CLOUDFLARE_API_TOKEN = 'test-token'
      process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account'

      debugImageDeletion('image-1', 'cf-id-1')

      expect(consoleSpy.group).toHaveBeenCalledWith('🗑️ 图片删除调试')
      expect(consoleSpy.log).toHaveBeenCalledWith('删除图片ID:', 'image-1')
      expect(consoleSpy.log).toHaveBeenCalledWith('Cloudflare ID:', 'cf-id-1')
      expect(consoleSpy.log).toHaveBeenCalledWith('API Token 配置:', '已配置')
      expect(consoleSpy.log).toHaveBeenCalledWith('Account ID 配置:', '已配置')
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it('should detect missing configuration', () => {
      debugImageDeletion('image-1', 'cf-id-1')

      expect(consoleSpy.log).toHaveBeenCalledWith('API Token 配置:', '未配置')
      expect(consoleSpy.log).toHaveBeenCalledWith('Account ID 配置:', '未配置')
    })
  })

  describe('validateCloudflareConfig', () => {
    it('should return configuration status', () => {
      process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account'
      process.env.CLOUDFLARE_API_TOKEN = 'test-token'
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH = 'test-hash'

      const result = validateCloudflareConfig()

      expect(result).toEqual({
        accountId: 'test-account',
        apiToken: 'test-token',
        imagesHash: 'test-hash',
      })

      expect(consoleSpy.group).toHaveBeenCalledWith('⚙️ Cloudflare 配置验证')
      expect(consoleSpy.log).toHaveBeenCalledWith('环境变量状态:')
      expect(consoleSpy.log).toHaveBeenCalledWith('- accountId: ✅ 已配置')
      expect(consoleSpy.log).toHaveBeenCalledWith('- apiToken: ✅ 已配置')
      expect(consoleSpy.log).toHaveBeenCalledWith('- imagesHash: ✅ 已配置')
    })

    it('should detect missing configuration', () => {
      const result = validateCloudflareConfig()

      expect(result).toEqual({
        accountId: undefined,
        apiToken: undefined,
        imagesHash: undefined,
      })

      expect(consoleSpy.log).toHaveBeenCalledWith('- accountId: ❌ 未配置')
      expect(consoleSpy.log).toHaveBeenCalledWith('- apiToken: ❌ 未配置')
      expect(consoleSpy.log).toHaveBeenCalledWith('- imagesHash: ❌ 未配置')
    })

    it('should generate test URL when hash is available', () => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH = 'test-hash'

      validateCloudflareConfig()

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '测试URL格式:',
        'https://imagedelivery.net/test-hash/test-id/public'
      )
    })
  })
})