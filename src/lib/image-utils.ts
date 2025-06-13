import { ProductImage } from '@/types/database'
import { getImageVariants } from './cloudflare-images'

/**
 * 获取产品的主图
 */
export function getPrimaryImage(images: ProductImage[], primaryImageId?: string | null): ProductImage | null {
  if (!images || images.length === 0) return null
  
  // 如果指定了主图ID，查找对应的图片
  if (primaryImageId) {
    const primaryImage = images.find(img => img.id === primaryImageId)
    if (primaryImage) return primaryImage
  }
  
  // 否则查找标记为主图的图片
  const markedPrimaryImage = images.find(img => img.is_primary)
  if (markedPrimaryImage) return markedPrimaryImage
  
  // 如果都没有，返回第一张图片
  return images[0]
}

/**
 * 获取产品主图的URL
 */
export function getPrimaryImageUrl(images: ProductImage[], primaryImageId?: string | null, variant: string = 'medium'): string | null {
  const primaryImage = getPrimaryImage(images, primaryImageId)
  if (!primaryImage) return null
  
  if (primaryImage.cloudflare_id) {
    return getImageVariants(primaryImage.cloudflare_id)[variant as keyof ReturnType<typeof getImageVariants>]
  }
  
  return primaryImage.url
}

/**
 * 获取所有图片的URL（用于图片画廊等）
 */
export function getAllImageUrls(images: ProductImage[], variant: string = 'medium'): string[] {
  if (!images || images.length === 0) return []
  
  return images.map(image => {
    if (image.cloudflare_id) {
      return getImageVariants(image.cloudflare_id)[variant as keyof ReturnType<typeof getImageVariants>]
    }
    return image.url
  }).filter(Boolean)
}

/**
 * 更新图片列表中的主图
 */
export function updatePrimaryImage(images: ProductImage[], newPrimaryId: string): ProductImage[] {
  return images.map(image => ({
    ...image,
    is_primary: image.id === newPrimaryId
  }))
}

/**
 * 添加图片到列表
 */
export function addImagesToList(existingImages: ProductImage[], newImages: ProductImage[]): ProductImage[] {
  return [...existingImages, ...newImages]
}

/**
 * 从列表中删除图片
 */
export function removeImageFromList(images: ProductImage[], imageId: string): ProductImage[] {
  return images.filter(image => image.id !== imageId)
}

/**
 * 重新排序图片列表
 */
export function reorderImages(images: ProductImage[], fromIndex: number, toIndex: number): ProductImage[] {
  const result = Array.from(images)
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  return result
}

/**
 * 验证图片数据完整性
 */
export function validateProductImages(images: ProductImage[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!Array.isArray(images)) {
    errors.push('图片数据必须是数组格式')
    return { isValid: false, errors }
  }
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    
    if (!image.id) {
      errors.push(`第 ${i + 1} 张图片缺少 ID`)
    }
    
    if (!image.url && !image.cloudflare_id) {
      errors.push(`第 ${i + 1} 张图片缺少 URL 或 Cloudflare ID`)
    }
    
    if (!image.alt) {
      errors.push(`第 ${i + 1} 张图片缺少 alt 文本`)
    }
    
    if (!image.created_at) {
      errors.push(`第 ${i + 1} 张图片缺少创建时间`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 生成图片的 alt 文本
 */
export function generateImageAlt(productName: string, imageIndex: number, isMain: boolean = false): string {
  if (isMain) {
    return `${productName} - 主图`
  }
  return `${productName} - 图片 ${imageIndex + 1}`
}

/**
 * 检查图片是否是有效的URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

/**
 * 获取图片的缩略图URL
 */
export function getThumbnailUrl(image: ProductImage): string {
  if (image.cloudflare_id) {
    return getImageVariants(image.cloudflare_id).thumbnail
  }
  return image.url
}

/**
 * 计算图片列表的总大小（估算）
 */
export function estimateImagesSize(images: ProductImage[]): number {
  // 这是一个估算值，实际大小可能不同
  return images.length * 500 * 1024 // 假设每张图片平均 500KB
}

/**
 * 检查是否需要压缩图片
 */
export function shouldCompressImages(images: ProductImage[]): boolean {
  const estimatedSize = estimateImagesSize(images)
  const maxSize = 5 * 1024 * 1024 // 5MB
  return estimatedSize > maxSize
}