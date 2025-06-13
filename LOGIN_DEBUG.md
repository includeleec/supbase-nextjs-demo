# 登录问题调试指南

## 问题诊断

如果遇到"用户名或密码错误"的问题，请按以下步骤排查：

### 1. 检查数据库连接
确保 Supabase 配置正确，环境变量设置正确。

### 2. 检查admin表是否存在
运行 `schema.sql` 中的命令创建admin表和默认用户。

### 3. 验证密码哈希
默认管理员账户信息：
- 用户名: `admin`
- 密码: `admin123`
- 密码哈希: `$2b$10$FIUiLf8l0ClDpWQnEG5iSuqQ.ydHIaw3dC/ZOX1WyRtqXjBZOshUS`

### 4. 使用调试工具
在开发环境中，登录页面会显示调试按钮：
- **调试登录**: 详细日志显示登录过程
- **检查表**: 查看admin表中的所有数据
- **测试哈希**: 验证密码哈希功能

### 5. 常见问题

#### 数据库中没有admin表
```sql
-- 运行 schema.sql 中的admin表创建语句
CREATE TABLE admin (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 密码哈希不匹配
如果密码哈希有问题，可以重新生成：
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log('New hash:', hash);
```

#### 用户不活跃
确保admin表中的 `is_active` 字段为 `true`。

## 测试用例

项目包含了完整的登录功能测试：

- `src/lib/__tests__/auth.test.ts` - 认证逻辑测试
- `src/contexts/__tests__/AuthContext.test.tsx` - 认证上下文测试  
- `src/components/__tests__/LoginForm.test.tsx` - 登录表单测试

运行测试：
```bash
npm test -- --testPathPattern="auth|AuthContext|LoginForm"
```

## 故障排除

1. 检查浏览器开发者工具的控制台日志
2. 使用调试工具按钮获取详细信息
3. 确认数据库中有正确的admin记录
4. 验证密码哈希算法一致性

## 安全说明

- 生产环境中应更改默认密码
- 考虑添加更强的密码策略
- 实现登录失败次数限制
- 使用HTTPS连接