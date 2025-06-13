import { ProductImage } from '@/types/database'

// Cloudflare Images API 配置
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const CLOUDFLARE_IMAGES_HASH = process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH

// Cloudflare Images API 基础 URL
const CF_IMAGES_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`

export interface CloudflareImageResponse {
  id: string
  filename: string
  meta?: Record<string, any>
  uploaded: string
  requireSignedURLs: boolean
  variants: string[]
}

export interface CloudflareUploadResponse {
  result: CloudflareImageResponse
  success: boolean
  errors: any[]
  messages: any[]
}

/**
 * 上传图片到 Cloudflare Images (客户端版本，通过 API 路由)
 */
export async function uploadImageToCloudflare(file: File, metadata?: Record<string, any>): Promise<CloudflareImageResponse> {
  const formData = new FormData()
  formData.append('file', file)
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata))
  }

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || '图片上传失败')
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || '图片上传失败')
  }

  return result.data
}

/**
 * 服务器端上传图片到 Cloudflare Images
 */
export async function uploadImageToCloudflareServer(file: File, metadata?: Record<string, any>): Promise<CloudflareImageResponse> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare Images 配置不完整')
  }

  const formData = new FormData()
  formData.append('file', file)
  
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata))
  }

  const response = await fetch(CF_IMAGES_API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`图片上传失败: ${response.statusText}`)
  }

  const result: CloudflareUploadResponse = await response.json()
  
  if (!result.success) {
    throw new Error(`图片上传失败: ${result.errors?.[0]?.message || '未知错误'}`)
  }

  return result.result
}

/**
 * 从 Cloudflare Images 删除图片
 */
export async function deleteImageFromCloudflare(imageId: string): Promise<boolean> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare Images 配置不完整')
  }

  const response = await fetch(`${CF_IMAGES_API_BASE}/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  })

  if (!response.ok) {
    console.error(`删除图片失败: ${response.statusText}`)
    return false
  }

  const result = await response.json()
  return result.success
}

/**
 * 生成 Cloudflare Images URL
 */
export function getCloudflareImageUrl(imageId: string, variant: string = 'public'): string {
  if (!CLOUDFLARE_IMAGES_HASH) {
    console.warn('Cloudflare Images Hash 未配置')
    return ''
  }
  return `https://imagedelivery.net/${CLOUDFLARE_IMAGES_HASH}/${imageId}/${variant}`
}

/**
 * 获取图片的不同尺寸变体
 */
export function getImageVariants(imageId: string) {
  return {
    thumbnail: getCloudflareImageUrl(imageId, 'thumbnail'), // 150x150
    small: getCloudflareImageUrl(imageId, 'small'),         // 400px width
    medium: getCloudflareImageUrl(imageId, 'medium'),       // 800px width
    large: getCloudflareImageUrl(imageId, 'large'),         // 1200px width
    original: getCloudflareImageUrl(imageId, 'public'),     // 原图
  }
}

/**
 * 将文件转换为 ProductImage 对象
 */
export function createProductImageFromFile(file: File, cloudflareId?: string): ProductImage {
  const id = Math.random().toString(36).substr(2, 9)
  return {
    id,
    url: cloudflareId ? getCloudflareImageUrl(cloudflareId, 'public') : URL.createObjectURL(file),
    cloudflare_id: cloudflareId || null,
    is_primary: false,
    alt: file.name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名作为 alt 文本
    created_at: new Date().toISOString(),
  }
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '只支持 JPEG、PNG、WebP 和 GIF 格式的图片'
    }
  }

  // 检查文件大小 (最大 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '图片大小不能超过 10MB'
    }
  }

  return { isValid: true }
}

/**
 * 批量上传图片
 */
export async function uploadMultipleImages(
  files: File[], 
  onProgress?: (completed: number, total: number) => void
): Promise<ProductImage[]> {
  const results: ProductImage[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      const cloudflareImage = await uploadImageToCloudflare(file, {
        productImage: true,
        originalName: file.name,
      })
      
      const productImage = createProductImageFromFile(file, cloudflareImage.id)
      results.push(productImage)
      
      onProgress?.(i + 1, files.length)
    } catch (error) {
      console.error(`上传图片 ${file.name} 失败:`, error)
      // 如果上传失败，创建一个本地预览的图片对象
      const localImage = createProductImageFromFile(file)
      results.push(localImage)
      
      onProgress?.(i + 1, files.length)
    }
  }
  
  return results
}