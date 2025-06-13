import { ProductImage } from '@/types/database'
import { getImageVariants, getCloudflareImageUrl } from './cloudflare-images'

/**
 * 调试图片显示问题
 */
export function debugImageDisplay(images: ProductImage[], primaryImageId?: string | null) {
  console.group('🖼️ 图片显示调试')
  
  console.log('📊 基本信息:')
  console.log('- 图片数量:', images?.length || 0)
  console.log('- 主图ID:', primaryImageId)
  console.log('- CLOUDFLARE_IMAGES_HASH:', process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH ? '已配置' : '未配置')
  
  if (images && images.length > 0) {
    console.log('\n📋 图片列表:')
    images.forEach((image, index) => {
      console.log(`图片 ${index + 1}:`)
      console.log('  - ID:', image.id)
      console.log('  - Cloudflare ID:', image.cloudflare_id)
      console.log('  - 原始URL:', image.url)
      console.log('  - 是否主图:', image.is_primary)
      console.log('  - Alt文本:', image.alt)
      
      if (image.cloudflare_id) {
        const variants = getImageVariants(image.cloudflare_id)
        console.log('  - 变体URLs:')
        Object.entries(variants).forEach(([variant, url]) => {
          console.log(`    ${variant}: ${url}`)
        })
      }
      console.log('---')
    })
    
    // 检查主图
    const primaryImage = images.find(img => img.id === primaryImageId) || images[0]
    console.log('\n🎯 主图信息:')
    console.log('- 主图对象:', primaryImage)
    
    if (primaryImage) {
      const displayUrl = primaryImage.cloudflare_id 
        ? getImageVariants(primaryImage.cloudflare_id).medium 
        : primaryImage.url
      console.log('- 显示URL:', displayUrl)
      
      // 测试URL是否可访问
      if (displayUrl) {
        console.log('- 正在测试URL可访问性...')
        fetch(displayUrl, { method: 'HEAD' })
          .then(response => {
            console.log(`- URL状态: ${response.status} ${response.statusText}`)
          })
          .catch(error => {
            console.error('- URL访问失败:', error)
          })
      }
    }
  } else {
    console.log('❌ 没有找到图片')
  }
  
  console.groupEnd()
}

/**
 * 调试图片上传结果
 */
export function debugImageUpload(cloudflareResult: any, productImage: ProductImage) {
  console.group('📤 图片上传调试')
  
  console.log('Cloudflare 响应:', cloudflareResult)
  console.log('生成的 ProductImage:', productImage)
  
  if (cloudflareResult?.id) {
    const testUrls = getImageVariants(cloudflareResult.id)
    console.log('生成的变体URLs:', testUrls)
    
    // 测试主要的几个变体 - 只有在testUrls存在时才执行
    if (testUrls) {
      ['thumbnail', 'medium', 'original'].forEach(variant => {
        const url = testUrls[variant as keyof typeof testUrls]
        console.log(`测试 ${variant} URL:`, url)
        
        if (url) {
          fetch(url, { method: 'HEAD' })
            .then(response => {
              console.log(`${variant} 状态: ${response.status}`)
            })
            .catch(error => {
              console.error(`${variant} 失败:`, error)
            })
        }
      })
    }
  }
  
  console.groupEnd()
}

/**
 * 调试图片删除
 */
export function debugImageDeletion(imageId: string, cloudflareId: string | null) {
  console.group('🗑️ 图片删除调试')
  
  console.log('删除图片ID:', imageId)
  console.log('Cloudflare ID:', cloudflareId)
  console.log('API Token 配置:', process.env.CLOUDFLARE_API_TOKEN ? '已配置' : '未配置')
  console.log('Account ID 配置:', process.env.CLOUDFLARE_ACCOUNT_ID ? '已配置' : '未配置')
  
  console.groupEnd()
}

/**
 * 验证环境配置
 */
export function validateCloudflareConfig() {
  console.group('⚙️ Cloudflare 配置验证')
  
  const config = {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    imagesHash: process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH,
  }
  
  console.log('环境变量状态:')
  Object.entries(config).forEach(([key, value]) => {
    console.log(`- ${key}: ${value ? '✅ 已配置' : '❌ 未配置'}`)
  })
  
  // 生成测试URL
  if (config.imagesHash) {
    const testUrl = `https://imagedelivery.net/${config.imagesHash}/test-id/public`
    console.log('测试URL格式:', testUrl)
  }
  
  console.groupEnd()
  
  return config
}