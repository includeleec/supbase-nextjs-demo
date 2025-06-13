'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, ProductInsert, ProductUpdate } from '@/types/database'
import ProductCard from '@/components/ProductCard'
import ProductModal from '@/components/ProductModal'
import { toast } from '@/lib/toast'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[]

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('获取商品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProduct = async (productData: ProductInsert | ProductUpdate) => {
    try {
      if ('id' in productData && productData.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productData.id)

        if (error) throw error
        toast.success('商品更新成功！')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData as ProductInsert])

        if (error) throw error
        toast.success('商品添加成功！')
      }

      await fetchProducts()
      setEditingProduct(null)
    } catch (error) {
      console.error('保存商品失败:', error)
      toast.error('保存商品失败，请重试')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('商品删除成功！')
      await fetchProducts()
    } catch (error) {
      console.error('删除商品失败:', error)
      toast.error('删除商品失败，请重试')
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品列表</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理您的商品库存和信息
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加商品
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索商品名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">所有分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {products.length === 0 ? '暂无商品' : '没有找到匹配的商品'}
          </div>
          {products.length === 0 && (
            <button
              onClick={handleAddProduct}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加第一个商品
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  )
}