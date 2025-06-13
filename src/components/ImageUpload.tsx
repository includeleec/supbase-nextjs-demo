'use client'

import { useState, useRef, useCallback } from 'react'
import { ProductImage } from '@/types/database'
import { 
  validateImageFile, 
  uploadMultipleImages, 
  getImageVariants,
  deleteImageFromCloudflare 
} from '@/lib/cloudflare-images'
import { showToast } from '@/lib/toast'
import { debugImageUpload, debugImageDeletion } from '@/lib/debug-images'

interface ImageUploadProps {
  images: ProductImage[]
  primaryImageId: string | null
  onImagesChange: (images: ProductImage[]) => void
  onPrimaryImageChange: (imageId: string | null) => void
  maxImages?: number
}

export default function ImageUpload({
  images,
  primaryImageId,
  onImagesChange,
  onPrimaryImageChange,
  maxImages = 10
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    // 验证文件
    const validFiles: File[] = []
    for (const file of fileArray) {
      const validation = validateImageFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        showToast(`${file.name}: ${validation.error}`, 'error')
      }
    }

    if (validFiles.length === 0) return

    // 检查是否超过最大数量
    if (images.length + validFiles.length > maxImages) {
      showToast(`最多只能上传 ${maxImages} 张图片`, 'error')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const newImages = await uploadMultipleImages(validFiles, (completed, total) => {
        setUploadProgress((completed / total) * 100)
      })

      // 调试上传结果
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 上传完成，新图片:', newImages)
        newImages.forEach((img, index) => {
          console.log(`图片 ${index + 1}:`, {
            id: img.id,
            cloudflare_id: img.cloudflare_id,
            url: img.url,
            alt: img.alt
          })
        })
      }

      const updatedImages = [...images, ...newImages]
      onImagesChange(updatedImages)

      // 如果是第一张图片，设置为主图
      if (images.length === 0 && newImages.length > 0) {
        onPrimaryImageChange(newImages[0].id)
      }

      showToast(`成功上传 ${newImages.length} 张图片`, 'success')
    } catch (error) {
      console.error('图片上传失败:', error)
      showToast(error instanceof Error ? error.message : '图片上传失败，请重试', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [images, maxImages, onImagesChange, onPrimaryImageChange])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleRemoveImage = async (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId)
    if (!imageToRemove) return

    // 调试删除操作
    if (process.env.NODE_ENV === 'development') {
      debugImageDeletion(imageId, imageToRemove.cloudflare_id)
    }

    try {
      let cloudflareDeleteSuccess = true
      
      // 如果有 Cloudflare ID，从 Cloudflare 删除
      if (imageToRemove.cloudflare_id) {
        try {
          const response = await fetch(`/api/upload-image?id=${imageToRemove.cloudflare_id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `删除失败: ${response.statusText}`)
          }
          
          const result = await response.json()
          cloudflareDeleteSuccess = result.success
          
          if (!cloudflareDeleteSuccess) {
            console.warn('Cloudflare 删除失败，但继续删除本地记录')
          }
        } catch (error) {
          console.error('Cloudflare 删除失败:', error)
          cloudflareDeleteSuccess = false
          // 不阻止本地删除，允许用户清理本地记录
        }
      }

      // 无论 Cloudflare 删除是否成功，都从本地列表中移除
      const updatedImages = images.filter(img => img.id !== imageId)
      onImagesChange(updatedImages)

      // 如果删除的是主图，设置第一张图片为主图
      if (primaryImageId === imageId) {
        const newPrimaryId = updatedImages.length > 0 ? updatedImages[0].id : null
        onPrimaryImageChange(newPrimaryId)
      }

      if (cloudflareDeleteSuccess) {
        showToast('图片删除成功', 'success')
      } else {
        showToast('图片已从列表中移除，但云端删除可能失败', 'warning')
      }
    } catch (error) {
      console.error('删除图片失败:', error)
      showToast(error instanceof Error ? error.message : '删除图片失败，请重试', 'error')
    }
  }

  const handleSetPrimary = (imageId: string) => {
    onPrimaryImageChange(imageId)
    showToast('主图设置成功', 'success')
  }

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          uploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">上传中... {Math.round(uploadProgress)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              拖拽图片到此处，或 
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-500 ml-1"
              >
                点击选择
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              支持 JPEG、PNG、WebP、GIF 格式，最大 10MB，最多 {maxImages} 张
            </div>
          </>
        )}
      </div>

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            已上传图片 ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  primaryImageId === image.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={image.cloudflare_id ? getImageVariants(image.cloudflare_id).small : image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 主图标签 */}
                {primaryImageId === image.id && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    主图
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {primaryImageId !== image.id && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(image.id)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        title="设为主图"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title="删除图片"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}