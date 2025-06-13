'use client'

import { useState } from 'react'
import { validateCloudflareConfig } from '@/lib/debug-images'
import { getImageVariants } from '@/lib/cloudflare-images'

export default function CloudflareDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [testResult, setTestResult] = useState<string>('')

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const handleConfigCheck = () => {
    const config = validateCloudflareConfig()
    setTestResult(`配置检查完成，详情请查看控制台`)
  }

  const handleTestUrl = async () => {
    const testImageId = 'test-image-id'
    const variants = getImageVariants(testImageId)
    
    console.log('测试生成的URLs:', variants)
    
    // 测试一个实际的图片ID（如果有的话）
    const testUrl = variants.original
    setTestResult(`测试URL: ${testUrl}`)
    
    if (testUrl) {
      try {
        const response = await fetch(testUrl, { method: 'HEAD' })
        setTestResult(prev => prev + `\n状态: ${response.status} ${response.statusText}`)
      } catch (error) {
        setTestResult(prev => prev + `\n错误: ${error}`)
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-500 text-white p-2 rounded-full shadow-lg hover:bg-yellow-600"
        title="Cloudflare 调试面板"
      >
        🔧
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-auto">
          <h3 className="font-bold text-sm mb-3">Cloudflare Images 调试</h3>
          
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleConfigCheck}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                检查配置
              </button>
              <button
                onClick={handleTestUrl}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              >
                测试URL
              </button>
            </div>
            
            <div className="border rounded p-2 bg-gray-50">
              <div className="text-xs text-gray-700">
                <div>Hash: {process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH ? '✅' : '❌'}</div>
                <div>Account ID: {process.env.CLOUDFLARE_ACCOUNT_ID ? '✅ (服务器)' : '❌'}</div>
                <div>API Token: {process.env.CLOUDFLARE_API_TOKEN ? '✅ (服务器)' : '❌'}</div>
              </div>
            </div>
            
            {testResult && (
              <div className="border rounded p-2 bg-yellow-50 max-h-32 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
            
            <div className="text-xs text-gray-500 border-t pt-2">
              <p>💡 打开浏览器控制台查看详细调试信息</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}