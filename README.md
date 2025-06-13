# Supabase 商品管理系统

基于 Supabase + Next.js + Tailwind CSS 构建的商品管理系统，提供完整的商品 CRUD 功能和管理员认证系统。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **后端**: Supabase (PostgreSQL)
- **语言**: TypeScript
- **认证**: 自定义管理员登录系统
- **密码加密**: bcryptjs
- **测试**: Jest + React Testing Library
- **部署**: Vercel (推荐)

## 功能特性

### 🔐 认证系统
- ✅ 管理员登录/登出
- ✅ 会话管理（localStorage）
- ✅ 路由保护
- ✅ 密码加密存储
- ✅ 登录状态持久化

### 📦 商品管理
- ✅ 商品列表展示
- ✅ 商品搜索和分类筛选
- ✅ 商品添加、编辑、删除
- ✅ 商品图片显示
- ✅ 库存管理
- ✅ 商品状态管理（上架/下架）
- ✅ 响应式设计

### 🧪 测试覆盖
- ✅ 认证逻辑测试
- ✅ 组件单元测试
- ✅ 集成测试
- ✅ 覆盖率报告

## 项目结构

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── __tests__/      # 页面测试
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 主页面（受保护）
│   ├── components/         # React 组件
│   │   ├── __tests__/      # 组件测试
│   │   ├── LoginForm.tsx   # 登录表单
│   │   ├── Navigation.tsx  # 导航栏
│   │   ├── ProductCard.tsx # 商品卡片组件
│   │   └── ProductModal.tsx# 商品编辑弹窗
│   ├── contexts/           # React Context
│   │   ├── __tests__/      # Context 测试
│   │   └── AuthContext.tsx # 认证上下文
│   ├── lib/                # 工具库
│   │   ├── __tests__/      # 工具测试
│   │   ├── auth.ts         # 认证逻辑
│   │   ├── debug-auth.ts   # 认证调试工具
│   │   ├── supabase.ts     # Supabase 客户端
│   │   └── toast.ts        # 消息提示
│   └── types/
│       ├── __tests__/      # 类型测试
│       └── database.ts     # 数据库类型定义
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

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制项目 URL 和 anon key
3. 修改 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中执行 `schema.sql` 中的 SQL 语句。这将创建：
- `products` 表：商品数据
- `admin` 表：管理员账户
- 默认管理员账户（用户名：admin，密码：admin123）

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
- **组件测试**: `src/components/__tests__/*.test.tsx`
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

在开发环境中，登录页面提供了调试按钮：
- **调试登录**: 显示详细的登录过程日志
- **检查表**: 查看admin表中的数据
- **测试哈希**: 验证密码哈希功能

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

- [ ] 多管理员支持
- [ ] 角色权限管理
- [ ] 登录失败次数限制
- [ ] 密码重置功能
- [ ] 操作日志记录
- [ ] 数据导入/导出
- [ ] 图片上传功能
- [ ] 批量操作

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