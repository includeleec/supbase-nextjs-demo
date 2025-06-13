import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToCloudflareServer } from '@/lib/cloudflare-images'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = formData.get('metadata')
    
    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      )
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制 (10MB)' },
        { status: 400 }
      )
    }

    // 解析元数据
    let parsedMetadata
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata as string)
      } catch {
        parsedMetadata = undefined
      }
    }

    // 上传到 Cloudflare Images
    const result = await uploadImageToCloudflareServer(file, parsedMetadata)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('图片上传失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '图片上传失败' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')
    
    if (!imageId) {
      return NextResponse.json(
        { error: '缺少图片 ID' },
        { status: 400 }
      )
    }

    const { deleteImageFromCloudflare } = await import('@/lib/cloudflare-images')
    const success = await deleteImageFromCloudflare(imageId)

    return NextResponse.json({
      success,
      message: success ? '图片删除成功' : '图片删除失败'
    })

  } catch (error) {
    console.error('图片删除失败:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '图片删除失败' 
      },
      { status: 500 }
    )
  }
}