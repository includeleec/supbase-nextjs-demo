'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
  const { admin, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              商品管理系统
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              欢迎，{admin?.username}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}