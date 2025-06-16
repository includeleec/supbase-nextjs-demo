'use client'

import { useState, useEffect } from 'react'
import { Product, ProductInsert, ProductUpdate, ProductImage, ProductTranslation, SupportedLanguage, SUPPORTED_LANGUAGES } from '@/types/database'
import ImageUpload from './ImageUpload'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: ProductInsert | ProductUpdate) => void
  product?: Product | null
}

export default function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductInsert>({
    name: '',
    description: '',
    price: 0,
    images: [],
    translations: [],
    primary_image_id: null,
    category: '',
    stock_quantity: 0,
    is_active: true,
  })
  
  const [images, setImages] = useState<ProductImage[]>([])
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null)
  const [selectedLanguages, setSelectedLanguages] = useState<Set<SupportedLanguage>>(new Set(['en'] as SupportedLanguage[]))
  const [translations, setTranslations] = useState<ProductTranslation[]>([{ language: 'en', name: '', description: '' }])

  useEffect(() => {
    if (product) {
      const productTranslations = product.translations || []
      const existingLanguages = new Set(productTranslations.map(t => t.language))
      
      // 确保英文始终被选中
      if (!existingLanguages.has('en')) {
        existingLanguages.add('en')
        productTranslations.push({ language: 'en', name: product.name, description: product.description || '' })
      }
      
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        images: product.images || [],
        translations: productTranslations,
        primary_image_id: product.primary_image_id,
        category: product.category || '',
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
      })
      setImages(product.images || [])
      setPrimaryImageId(product.primary_image_id)
      setSelectedLanguages(existingLanguages)
      setTranslations(productTranslations)
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        images: [],
        translations: [],
        primary_image_id: null,
        category: '',
        stock_quantity: 0,
        is_active: true,
      })
      setImages([])
      setPrimaryImageId(null)
      setSelectedLanguages(new Set(['en'] as SupportedLanguage[]))
      setTranslations([{ language: 'en', name: '', description: '' }])
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 获取英文翻译作为主要的 name 和 description
    const enTranslation = translations.find(t => t.language === 'en')
    
    const productData = {
      ...formData,
      name: enTranslation?.name || '',
      description: enTranslation?.description || '',
      translations,
      images,
      primary_image_id: primaryImageId,
    }
    
    if (product) {
      onSave({ ...productData, id: product.id } as ProductUpdate)
    } else {
      onSave(productData)
    }
    onClose()
  }

  const handleImagesChange = (newImages: ProductImage[]) => {
    setImages(newImages)
  }

  const handlePrimaryImageChange = (imageId: string | null) => {
    setPrimaryImageId(imageId)
  }

  const handleLanguageToggle = (language: SupportedLanguage) => {
    const newSelectedLanguages = new Set(selectedLanguages)
    
    if (language === 'en') {
      // 英文不能取消选择
      return
    }
    
    if (newSelectedLanguages.has(language)) {
      newSelectedLanguages.delete(language)
      setTranslations(prev => prev.filter(t => t.language !== language))
    } else {
      newSelectedLanguages.add(language)
      setTranslations(prev => [...prev, { language, name: '', description: '' }])
    }
    
    setSelectedLanguages(newSelectedLanguages)
  }

  const handleTranslationChange = (language: SupportedLanguage, field: 'name' | 'description', value: string) => {
    setTranslations(prev => 
      prev.map(t => 
        t.language === language 
          ? { ...t, [field]: value }
          : t
      )
    )
  }

  // 生成 slug 的辅助函数
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, '') // 保留字母、数字、中文、空格和连字符
      .replace(/\s+/g, '-') // 将空格替换为连字符
      .replace(/-+/g, '-') // 合并多个连字符
      .replace(/^-+|-+$/g, '') // 去除首尾连字符
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {product ? '编辑商品' : '添加商品'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 语言选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              支持语言 * (英文必选)
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <label key={lang.code} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.has(lang.code)}
                    onChange={() => handleLanguageToggle(lang.code)}
                    disabled={lang.code === 'en'}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className={`text-sm ${lang.code === 'en' ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
                    {lang.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 多语言输入框 */}
          {Array.from(selectedLanguages).sort((a, b) => a === 'en' ? -1 : b === 'en' ? 1 : 0).map(language => {
            const langName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || language
            const translation = translations.find(t => t.language === language) || { language, name: '', description: '' }
            
            return (
              <div key={language} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                  {langName}
                  {language === 'en' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">必填</span>}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor={`name-${language}`} className="block text-sm font-medium text-gray-700 mb-1">
                      商品名称 {language === 'en' && '*'}
                    </label>
                    <input
                      id={`name-${language}`}
                      type="text"
                      required={language === 'en'}
                      value={translation.name}
                      onChange={(e) => {
                        const value = e.target.value
                        handleTranslationChange(language, 'name', value)
                        if (language === 'en') {
                          setFormData(prev => ({
                            ...prev,
                            name: value,
                            slug: prev.slug || generateSlug(value)
                          }))
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`description-${language}`} className="block text-sm font-medium text-gray-700 mb-1">
                      商品描述
                    </label>
                    <textarea
                      id={`description-${language}`}
                      value={translation.description}
                      onChange={(e) => handleTranslationChange(language, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <div>
            <label htmlFor="product-slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              id="product-slug"
              type="text"
              required
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="产品的 URL 友好标识符"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              用于生成 SEO 友好的 URL，只能包含字母、数字、连字符
            </p>
          </div>

          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
              价格 *
            </label>
            <input
              id="product-price"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品图片
            </label>
            <ImageUpload
              images={images}
              primaryImageId={primaryImageId}
              onImagesChange={handleImagesChange}
              onPrimaryImageChange={handlePrimaryImageChange}
              maxImages={8}
            />
          </div>

          <div>
            <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
              分类
            </label>
            <input
              id="product-category"
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-1">
              库存数量
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              上架销售
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {product ? '更新' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}