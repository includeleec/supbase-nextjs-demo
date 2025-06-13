'use client'

import Image from 'next/image'
import { Product } from '@/types/database'
import { useState, useEffect } from 'react'
import { getImageVariants } from '@/lib/cloudflare-images'
import { debugImageDisplay } from '@/lib/debug-images'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  
  // 调试图片显示问题
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && product.images && product.images.length > 0) {
      debugImageDisplay(product.images, product.primary_image_id)
    }
  }, [product.images, product.primary_image_id])
  
  // 初始化显示主图
  useEffect(() => {
    if (product.images && product.images.length > 0) {
      // 找到主图的索引，如果没有主图则显示第一张
      const primaryIndex = product.images.findIndex(img => img.id === product.primary_image_id)
      setCurrentImageIndex(primaryIndex >= 0 ? primaryIndex : 0)
    }
  }, [product.images, product.primary_image_id])
  
  // 获取当前显示的图片
  const currentImage = product.images?.[currentImageIndex]
  const hasMultipleImages = (product.images?.length || 0) > 1
  const imageCount = product.images?.length || 0
  
  // 获取图片URL的函数
  const getImageUrl = (image: typeof currentImage) => {
    if (!image) return ''
    
    if (image.cloudflare_id && process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH) {
      const variants = getImageVariants(image.cloudflare_id)
      return variants.medium || variants.original || image.url
    }
    return image.url
  }
  
  const currentImageUrl = getImageUrl(currentImage)
  
  // 切换到下一张图片
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % imageCount)
    }
  }
  
  // 切换到上一张图片
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount)
    }
  }
  
  // 处理图片加载错误
  const handleImageError = (imageId: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev)
      newSet.add(imageId)
      return newSet
    })
  }
  
  // 检查当前图片是否加载失败
  const isCurrentImageError = currentImage ? imageErrors.has(currentImage.id) : false
  
  // 调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('ProductCard 渲染:', {
      productId: product.id,
      productName: product.name,
      imagesCount: imageCount,
      currentImageIndex,
      currentImage,
      currentImageUrl,
      hasCloudflareHash: !!process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH
    })
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 mb-4 relative group">
        {currentImageUrl && !isCurrentImageError ? (
          <>
            <Image
              src={currentImageUrl}
              alt={currentImage?.alt || product.name}
              width={300}
              height={200}
              className="rounded-lg object-cover w-full h-48 transition-all duration-300"
              onError={() => currentImage && handleImageError(currentImage.id)}
            />
            
            {/* 图片计数角标 */}
            {imageCount > 0 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1}/{imageCount}
              </div>
            )}
            
            {/* 主图标识 */}
            {currentImage?.is_primary && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                主图
              </div>
            )}
            
            {/* 切换箭头 - 只在有多张图片时显示 */}
            {hasMultipleImages && (
              <>
                {/* 左箭头 */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="上一张图片"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* 右箭头 */}
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="下一张图片"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* 小圆点指示器 */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {product.images?.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                      aria-label={`查看第${index + 1}张图片`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">暂无图片</span>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
      
      {product.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-red-600">¥{product.price}</span>
        <span className="text-sm text-gray-500">{product.category}</span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">库存: {product.stock_quantity}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          product.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.is_active ? '上架' : '下架'}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  )
}