# Supabase 商品管理系统

基于 Supabase + Next.js + Tailwind CSS 构建的商品管理系统，提供完整的商品 CRUD 功能。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **后端**: Supabase (PostgreSQL)
- **语言**: TypeScript
- **部署**: Vercel (推荐)

## 功能特性

- ✅ 商品列表展示
- ✅ 商品搜索和分类筛选
- ✅ 商品添加、编辑、删除
- ✅ 商品图片显示
- ✅ 库存管理
- ✅ 商品状态管理（上架/下架）
- ✅ 响应式设计

## 项目结构

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 主页面
│   ├── components/         # React 组件
│   │   ├── ProductCard.tsx # 商品卡片组件
│   │   └── ProductModal.tsx# 商品编辑弹窗
│   ├── lib/
│   │   └── supabase.ts     # Supabase 客户端配置
│   └── types/
│       └── database.ts     # 数据库类型定义
├── schema.sql              # 数据库表结构
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

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制项目 URL 和 anon key
3. 修改 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中执行 `schema.sql` 中的 SQL 语句。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 数据库设计

### products 表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，自动生成 |
| name | varchar(255) | 商品名称 |
| description | text | 商品描述 |
| price | decimal(10,2) | 商品价格 |
| image_url | varchar(500) | 商品图片链接 |
| category | varchar(100) | 商品分类 |
| stock_quantity | integer | 库存数量 |
| is_active | boolean | 是否上架 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

## API 使用

项目使用 Supabase 客户端直接与数据库交互：

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

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 环境变量

确保在部署平台设置以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 开发指南

### 添加新功能

1. 在 `src/types/database.ts` 中更新类型定义
2. 在 `src/components/` 中创建新组件
3. 在页面中使用新组件

### 自定义样式

项目使用 Tailwind CSS，可以在 `tailwind.config.ts` 中自定义主题。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License