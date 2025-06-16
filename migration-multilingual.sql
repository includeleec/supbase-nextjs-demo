-- 添加多语言支持的数据库迁移
-- 为产品表添加 translations 字段来存储多语言的名称和描述

-- 添加 translations 字段
ALTER TABLE products 
ADD COLUMN translations JSONB DEFAULT '[]'::jsonb;

-- 创建索引以提高查询性能
CREATE INDEX idx_products_translations ON products USING GIN (translations);

-- 将现有的 name 和 description 数据迁移到 translations 字段中
-- 默认设置为英文 (en)
UPDATE products 
SET translations = COALESCE(
  CASE 
    WHEN name IS NOT NULL OR description IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object(
          'language', 'en',
          'name', COALESCE(name, ''),
          'description', COALESCE(description, '')
        )
      )
    ELSE '[]'::jsonb
  END,
  '[]'::jsonb
)
WHERE translations = '[]'::jsonb OR translations IS NULL;

-- 添加约束确保 translations 字段的数据结构正确
-- 使用简单的 JSONB 类型检查，避免子查询
ALTER TABLE products 
ADD CONSTRAINT check_translations_format 
CHECK (jsonb_typeof(translations) = 'array');

-- 注释：现有的 name 和 description 字段保留作为后备和兼容性考虑
-- 在应用程序中，我们将主要使用 translations 字段，但保留原字段以防需要回滚