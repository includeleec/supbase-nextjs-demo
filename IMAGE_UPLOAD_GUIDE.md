# 图片上传功能指南

## 概述

项目已升级支持多图片上传功能，使用 Cloudflare Images 服务进行图片存储和 CDN 分发。

## 主要功能特性

### ✅ 多图片上传
- 支持单次上传多张图片
- 拖拽上传和点击选择两种方式
- 实时上传进度显示
- 最多支持 10 张图片（可配置）

### ✅ 主图设置
- 可以设置任意一张图片为主图
- 主图会在商品卡片中优先显示
- 主图有明显的视觉标识

### ✅ 图片管理
- 支持删除单张图片
- 图片预览和管理界面
- 自动生成不同尺寸的图片变体

### ✅ Cloudflare Images 集成
- 自动压缩和优化
- 全球 CDN 分发
- 多种尺寸变体（缩略图、小图、中图、大图）
- 安全的图片存储

## 数据库变更

### 新的表结构

```sql
-- 商品表更新
ALTER TABLE products 
ADD COLUMN images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN primary_image_id VARCHAR(255);

-- 旧字段 image_url 已被 images 字段替代
```

### 图片数据格式

```json
{
  "id": "unique-id",
  "url": "https://imagedelivery.net/hash/image-id/public",
  "cloudflare_id": "cloudflare-image-id",
  "is_primary": true,
  "alt": "图片描述",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 环境配置

### 必需的环境变量

```env
# Cloudflare Images 配置
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH=your_images_delivery_hash
```

### 获取 Cloudflare 配置

1. **Account ID**: 在 Cloudflare Dashboard 右侧边栏找到
2. **API Token**: 
   - 前往 Cloudflare Dashboard > My Profile > API Tokens
   - 创建自定义 Token，权限为 `Cloudflare Images:Edit`
3. **Images Hash**: 
   - 前往 Cloudflare Dashboard > Images
   - 在 "Delivery URL format" 中找到 hash 值

## 使用方法

### 1. 数据库迁移

运行 `migration.sql` 脚本来迁移现有数据：

```bash
# 在 Supabase Dashboard 的 SQL Editor 中执行
-- 执行 migration.sql 中的所有语句
```

### 2. 上传图片

在商品编辑界面：
1. 拖拽图片到上传区域，或点击选择文件
2. 系统会自动上传到 Cloudflare Images
3. 可以设置任意一张图片为主图
4. 支持删除不需要的图片

### 3. 图片显示

- 商品卡片会显示主图
- 如果有多张图片，会显示数量标识
- 图片会自动使用合适的尺寸变体

## API 端点

### POST /api/upload-image
上传单张图片到 Cloudflare Images

**请求格式**: `multipart/form-data`
- `file`: 图片文件
- `metadata`: 可选的元数据 (JSON字符串)

**响应格式**:
```json
{
  "success": true,
  "data": {
    "id": "cloudflare-image-id",
    "filename": "original-filename.jpg",
    "uploaded": "2024-01-01T00:00:00Z",
    "variants": ["public", "thumbnail", ...]
  }
}
```

### DELETE /api/upload-image?id=image-id
删除 Cloudflare Images 中的图片

## 组件使用

### ImageUpload 组件

```tsx
import ImageUpload from '@/components/ImageUpload'

<ImageUpload
  images={productImages}
  primaryImageId={primaryImageId}
  onImagesChange={setImages}
  onPrimaryImageChange={setPrimaryImageId}
  maxImages={8}
/>
```

### 属性说明

- `images`: 当前图片列表
- `primaryImageId`: 主图ID
- `onImagesChange`: 图片列表变化回调
- `onPrimaryImageChange`: 主图变化回调
- `maxImages`: 最大图片数量（默认10）

## 工具函数

### 图片工具函数

```typescript
import { 
  getPrimaryImage, 
  getPrimaryImageUrl,
  getAllImageUrls 
} from '@/lib/image-utils'

// 获取主图
const primaryImage = getPrimaryImage(images, primaryImageId)

// 获取主图URL
const primaryUrl = getPrimaryImageUrl(images, primaryImageId, 'medium')

// 获取所有图片URL
const allUrls = getAllImageUrls(images, 'small')
```

### Cloudflare Images 函数

```typescript
import { 
  getImageVariants,
  uploadImageToCloudflare 
} from '@/lib/cloudflare-images'

// 获取图片的不同尺寸
const variants = getImageVariants('cloudflare-image-id')
// {
//   thumbnail: 'url',  // 150x150
//   small: 'url',      // 400px width  
//   medium: 'url',     // 800px width
//   large: 'url',      // 1200px width
//   original: 'url'    // 原图
// }
```

## 文件限制

- **支持格式**: JPEG, PNG, WebP, GIF
- **最大文件大小**: 10MB
- **最大图片数量**: 10张（可配置）

## 测试

运行图片相关测试：

```bash
# 运行图片工具测试
npm test -- --testPathPattern="image-utils"

# 运行图片上传组件测试  
npm test -- --testPathPattern="ImageUpload"

# 运行所有图片相关测试
npm test -- --testPathPattern="image"
```

## 故障排除

### 常见问题

1. **上传失败**
   - 检查 Cloudflare API 配置
   - 确认文件格式和大小符合要求
   - 查看浏览器控制台错误

2. **图片不显示**
   - 检查 `NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH` 配置
   - 确认图片数据格式正确
   - 检查 Cloudflare Images 域名访问

3. **上传权限错误**
   - 确认 API Token 权限正确
   - 检查 Account ID 是否正确

### 调试工具

开发环境中可以使用以下方法调试：

```typescript
// 在浏览器控制台中检查图片数据
console.log('Product images:', product.images)
console.log('Primary image:', getPrimaryImage(product.images, product.primary_image_id))
```

## 性能优化建议

1. **图片压缩**: Cloudflare Images 会自动压缩，但上传前也可以预压缩
2. **懒加载**: 对于图片较多的页面，考虑实现懒加载
3. **缓存**: 利用 Cloudflare CDN 的缓存机制
4. **尺寸选择**: 根据显示场景选择合适的图片尺寸变体

## 安全考虑

1. **文件验证**: 服务器端会验证文件类型和大小
2. **API 限制**: 上传接口有适当的限制
3. **权限控制**: 只有登录用户可以上传图片
4. **内容过滤**: Cloudflare Images 提供内容安全功能