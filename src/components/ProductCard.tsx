'use client'

import Image from 'next/image'
import { Product } from '@/types/database'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const fallbackImage = 'https://via.placeholder.com/300x200?text=暂无图片'
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={300}
            height={200}
            className="rounded-lg object-cover w-full h-48"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder w-full h-48 rounded-lg flex items-center justify-center">
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