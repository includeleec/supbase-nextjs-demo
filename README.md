# Supabase 商品管理系统

基于 Supabase + Next.js + Tailwind CSS 构建的现代化商品管理系统，提供完整的商品 CRUD 功能、多图片上传管理和管理员认证系统。

## 🌟 主要亮点

- ✅ **完整的商品管理系统** - 增删改查、搜索筛选、状态管理
- ✅ **多语言支持** - 中文、英文、日语、韩语国际化
- ✅ **SEO友好URLs** - 商品slug系统，优化搜索引擎排名
- ✅ **先进的图片系统** - 多图上传、轮播展示、CDN优化
- ✅ **安全的认证机制** - 密码加密、会话管理、路由保护
- ✅ **优秀的用户体验** - 响应式设计、拖拽上传、平滑动画
- ✅ **强大的调试工具** - 开发环境实时调试、详细日志
- ✅ **完善的测试覆盖** - 150+ 测试用例、类型安全保障

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **后端**: Supabase (PostgreSQL)
- **语言**: TypeScript
- **认证**: 自定义管理员登录系统
- **密码加密**: bcryptjs
- **图片存储**: Cloudflare Images (CDN + 优化)
- **测试**: Jest + React Testing Library (148+ 测试用例)
- **部署**: Vercel (推荐)

## 功能特性

### 🔐 认证系统
- ✅ 管理员登录/登出
- ✅ 会话管理（localStorage）
- ✅ 路由保护
- ✅ 密码加密存储
- ✅ 登录状态持久化

### 📦 商品管理
- ✅ 商品列表展示（响应式网格布局）
- ✅ 商品搜索和分类筛选
- ✅ 商品添加、编辑、删除
- ✅ 库存管理
- ✅ 商品状态管理（上架/下架）
- ✅ **多语言商品信息**：支持中文、英文、日语、韩语
- ✅ **SEO优化**：自动生成和自定义商品URL slug

### 🖼️ 图片管理系统
- ✅ **多图片上传**：支持拖拽上传，最多8张图片
- ✅ **Cloudflare Images 集成**：自动优化、CDN加速
- ✅ **主图设置**：指定商品主图显示
- ✅ **图片轮播**：商品卡片支持多图展示
  - 左右箭头切换（hover显示）
  - 小圆点指示器（点击跳转）
  - 图片计数角标（如：2/5）
  - 主图标识
- ✅ **多种图片格式**：JPEG、PNG、WebP、GIF
- ✅ **文件大小限制**：单文件最大10MB
- ✅ **实时预览**：上传前预览功能
- ✅ **错误处理**：图片加载失败的优雅降级

### 🎨 用户体验
- ✅ 响应式设计（桌面/平板/手机）
- ✅ 平滑动画过渡
- ✅ 拖拽上传体验
- ✅ 加载状态提示
- ✅ 错误消息展示

### 🧪 测试覆盖
- ✅ 认证逻辑测试（8个测试用例）
- ✅ 组件单元测试（25个ProductCard测试 + 20个ProductModal测试）
- ✅ 多语言功能测试（语言切换、内容本地化、回退机制）
- ✅ Slug功能测试（自动生成、验证、显示）
- ✅ 图片功能测试（上传、显示、轮播、删除）
- ✅ 集成测试和端到端测试
- ✅ 覆盖率报告（150+ 通过的测试用例）

### 🛠️ 开发工具
- ✅ **Cloudflare调试面板**：开发环境实时配置检查
- ✅ **图片调试工具**：URL生成、可访问性测试
- ✅ **认证调试**：登录过程详细日志
- ✅ **TypeScript严格模式**：类型安全保障

## 项目结构

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   │   └── upload-image/ # 图片上传 API
│   │   ├── __tests__/      # 页面测试
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 主页面（受保护）
│   ├── components/         # React 组件
│   │   ├── __tests__/      # 组件测试
│   │   ├── LoginForm.tsx   # 登录表单
│   │   ├── Navigation.tsx  # 导航栏
│   │   ├── ProductCard.tsx # 商品卡片（支持图片轮播）
│   │   ├── ProductModal.tsx# 商品编辑弹窗
│   │   ├── ImageUpload.tsx # 图片上传组件
│   │   └── CloudflareDebugPanel.tsx # 开发调试面板
│   ├── contexts/           # React Context
│   │   ├── __tests__/      # Context 测试
│   │   └── AuthContext.tsx # 认证上下文
│   ├── lib/                # 工具库
│   │   ├── __tests__/      # 工具测试
│   │   ├── auth.ts         # 认证逻辑
│   │   ├── cloudflare-images.ts # Cloudflare Images API
│   │   ├── debug-images.ts # 图片调试工具
│   │   ├── image-utils.ts  # 图片处理工具
│   │   ├── supabase.ts     # Supabase 客户端
│   │   └── toast.ts        # 消息提示
│   └── types/
│       ├── __tests__/      # 类型测试
│       └── database.ts     # 数据库类型定义（支持多图片）
├── schema.sql              # 数据库表结构（包含admin表）
├── jest.config.js          # Jest 配置
├── jest.setup.js           # Jest 设置
├── LOGIN_DEBUG.md          # 登录调试指南
├── .env.local             # 环境变量配置
└── README.md              # 项目说明
```

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd supabase-demo
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，并配置以下变量：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudflare Images 配置（可选，用于图片上传）
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH=your_cloudflare_images_hash
```

#### Supabase 设置
1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制项目 URL 和 anon key

#### Cloudflare Images 设置（可选）
如果需要图片上传功能：
1. 在 [Cloudflare](https://cloudflare.com) 注册账户
2. 启用 Cloudflare Images 服务
3. 获取 Account ID 和 API Token
4. 配置 Images Hash

### 4. 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中执行 `schema.sql` 中的 SQL 语句。这将创建：
- `products` 表：商品数据（支持多图片存储）
- `admin` 表：管理员账户
- 默认管理员账户（用户名：admin，密码：admin123）

⚠️ **注意**: 新的数据库结构支持多图片和多语言功能。如果你是从旧版本升级，请按顺序运行以下迁移文件：
1. `migration.sql` - 多图片功能迁移
2. `migration-multilingual.sql` - 多语言功能迁移  
3. `migration-add-slug.sql` - SEO slug功能迁移

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 6. 登录系统

使用默认管理员账户登录：
- **用户名**: `admin`
- **密码**: `admin123`

⚠️ **重要**: 生产环境中请立即更改默认密码！

### 7. 图片功能设置（可选）

如果配置了 Cloudflare Images：
- 商品编辑页面将显示图片上传功能
- 支持拖拽上传多张图片
- 自动生成不同尺寸的图片变体
- 商品卡片支持图片轮播展示

如果未配置 Cloudflare Images：
- 仍可使用直接URL方式添加图片
- 基础的图片显示功能正常工作

## 数据库设计

### products 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，自动生成 |
| name | varchar(255) | 商品名称（主要语言） |
| description | text | 商品描述（主要语言） |
| slug | varchar(255) | SEO友好的URL标识符（唯一）|
| translations | jsonb | 多语言翻译数组 |
| price | decimal(10,2) | 商品价格 |
| images | jsonb | 商品图片数组|
| primary_image_id | varchar(255) | 主图ID|
| category | varchar(100) | 商品分类 |
| stock_quantity | integer | 库存数量 |
| is_active | boolean | 是否上架 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

#### 多语言数据结构 (translations字段)

```json
[
  {
    "language": "en",
    "name": "Product Name",
    "description": "Product description in English"
  },
  {
    "language": "zh",
    "name": "商品名称",
    "description": "中文商品描述"
  },
  {
    "language": "ja",
    "name": "商品名",
    "description": "日本語での商品説明"
  }
]
```

#### 图片数据结构 (images字段)

```json
[
  {
    "id": "img-1",
    "url": "https://example.com/image.jpg",
    "cloudflare_id": "cf-image-id",
    "is_primary": false,
    "alt": "图片描述",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### admin 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，自动生成 |
| username | varchar(50) | 用户名（唯一） |
| password | varchar(255) | 密码哈希（bcrypt） |
| email | varchar(255) | 邮箱地址 |
| is_active | boolean | 是否启用 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## API 使用

项目使用 Supabase 客户端直接与数据库交互：

### 商品管理 API

```typescript
// 获取所有商品
const { data, error } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false })

// 添加商品
const { error } = await supabase
  .from('products')
  .insert([productData])

// 更新商品
const { error } = await supabase
  .from('products')
  .update(productData)
  .eq('id', productId)

// 删除商品
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)
```

### 认证 API

```typescript
import { login, logout } from '@/lib/auth'

// 管理员登录
try {
  const admin = await login(username, password)
  // 登录成功
} catch (error) {
  // 登录失败
}

// 退出登录
logout()
```

### 图片管理 API

```typescript
import { uploadImageToCloudflare, deleteImageFromCloudflare, getImageVariants } from '@/lib/cloudflare-images'

// 上传图片到 Cloudflare
const result = await uploadImageToCloudflare(file, { alt: '商品图片' })

// 获取图片的不同尺寸变体
const variants = getImageVariants(cloudflareId)
// 返回: { thumbnail, small, medium, large, original }

// 删除图片
await deleteImageFromCloudflare(cloudflareId)
```

### 商品图片结构

```typescript
interface ProductImage {
  id: string
  url: string
  cloudflare_id: string | null
  is_primary: boolean
  alt: string
  created_at: string
}

interface ProductTranslation {
  language: 'zh' | 'en' | 'ja' | 'ko'
  name: string
  description: string
}

interface Product {
  // ... 其他字段
  slug: string | null
  translations: ProductTranslation[]
  images: ProductImage[]
  primary_image_id: string | null
}
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 环境变量

确保在部署平台设置以下环境变量：

```
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 可选的环境变量（图片上传功能）
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
NEXT_PUBLIC_CLOUDFLARE_IMAGES_HASH=your_cloudflare_images_hash
```

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch

# 运行特定测试文件
npm test -- --testPathPattern="auth"
```

### 测试文件

- **认证测试**: `src/lib/__tests__/auth.test.ts`
- **图片功能测试**: `src/lib/__tests__/image-utils.test.ts`, `src/lib/__tests__/debug-images.test.ts`
- **组件测试**: `src/components/__tests__/*.test.tsx`
  - `ProductCard.test.tsx` - 包含图片轮播功能测试
  - `ProductModal.test.tsx` - 包含图片上传功能测试
- **Context测试**: `src/contexts/__tests__/*.test.tsx`
- **页面测试**: `src/app/__tests__/*.test.tsx`

## 故障排除

### 登录问题

如果遇到登录问题，请：

1. 检查 `LOGIN_DEBUG.md` 文档
2. 使用开发环境中的调试工具
3. 确认数据库中存在正确的admin记录
4. 验证密码哈希

### 调试工具

开发环境中提供了多种调试工具：

#### 认证调试
登录页面的调试按钮：
- **调试登录**: 显示详细的登录过程日志
- **检查表**: 查看admin表中的数据
- **测试哈希**: 验证密码哈希功能

#### 图片调试
右下角的Cloudflare调试面板（开发环境）：
- **配置检查**: 验证环境变量配置
- **URL测试**: 测试图片URL生成和可访问性
- **实时状态**: 显示当前配置状态

#### 图片问题排查
1. 检查 Cloudflare Images 配置
2. 验证图片URL格式
3. 查看浏览器控制台的详细日志
4. 使用调试面板测试连接

## 开发指南

### 添加新功能

1. 在 `src/types/database.ts` 中更新类型定义
2. 在相应目录中创建新组件/功能
3. 编写对应的测试用例
4. 更新文档

### 自定义样式

项目使用 Tailwind CSS，可以在 `tailwind.config.js` 中自定义主题。

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 编写单元测试和集成测试
- 使用 Jest 进行测试

## 安全注意事项

### 密码安全
- 默认密码仅用于开发环境
- 生产环境必须更改默认密码
- 考虑实现密码复杂度要求
- 定期更新管理员密码

### 数据库安全
- 配置适当的 Supabase 行级安全策略（RLS）
- 限制管理员表的直接访问
- 使用环境变量存储敏感配置

### 部署安全
- 使用 HTTPS 连接
- 配置正确的 CORS 设置
- 定期更新依赖包

## 扩展功能建议

### 已完成 ✅
- [x] 图片上传功能（多图片支持）
- [x] 图片轮播展示
- [x] Cloudflare Images 集成
- [x] 调试工具完善
- [x] **多语言支持**（中文、英文、日语、韩语）
- [x] **SEO友好URLs**（商品slug系统）
- [x] **语言切换功能**（实时内容本地化）
- [x] **完善的测试覆盖**（多语言和slug功能）

### 计划中 🚧
- [ ] 更多语言支持（法语、德语、西班牙语等）
- [ ] 分类多语言支持
- [ ] 多管理员支持
- [ ] 角色权限管理
- [ ] 登录失败次数限制
- [ ] 密码重置功能
- [ ] 操作日志记录
- [ ] 数据导入/导出
- [ ] 批量操作
- [ ] 图片水印和压缩
- [ ] 商品分类管理
- [ ] 销售统计报表
- [ ] 自动SEO优化建议

## 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License

## 致谢

- [Supabase](https://supabase.com) - 后端即服务
- [Next.js](https://nextjs.org) - React 框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - 密码加密