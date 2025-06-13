'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { login as loginAuth } from '@/lib/auth'
import { showToast } from '@/lib/toast'
import { debugLogin, checkAdminTable, testPasswordHash } from '@/lib/debug-auth'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const admin = await loginAuth(username, password)
      if (admin) {
        login(admin)
        showToast('登录成功！', 'success')
      }
    } catch (error) {
      console.error('Login error details:', error)
      showToast(error instanceof Error ? error.message : '登录失败', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDebugLogin = async () => {
    console.log('Starting debug login...')
    await debugLogin(username || 'admin', password || 'admin123')
  }

  const handleCheckTable = async () => {
    await checkAdminTable()
  }

  const handleTestHash = async () => {
    await testPasswordHash()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            管理员登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入您的管理员账户信息
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              默认账户: admin / admin123
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 text-center">调试工具:</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleDebugLogin}
                  className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  调试登录
                </button>
                <button
                  type="button"
                  onClick={handleCheckTable}
                  className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  检查表
                </button>
                <button
                  type="button"
                  onClick={handleTestHash}
                  className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  测试哈希
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}