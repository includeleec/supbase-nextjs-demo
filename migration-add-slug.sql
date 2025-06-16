-- 为产品表添加 slug 字段
-- slug 用于 SEO 友好的 URL，应该是唯一的

-- 添加 slug 字段
ALTER TABLE products 
ADD COLUMN slug VARCHAR(255);

-- 添加唯一约束
ALTER TABLE products 
ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- 创建索引提高查询性能
CREATE INDEX idx_products_slug ON products (slug);

-- 为现有产品生成初始 slug（基于产品名称和ID）
-- 注意：这只是一个示例，实际使用时可能需要根据具体需求调整
UPDATE products 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      TRIM(name), 
      '[^a-zA-Z0-9\u4e00-\u9fff]+', '-', 'g'
    ), 
    '^-+|-+$', '', 'g'
  ) || '-' || SUBSTRING(id::text, 1, 8)
)
WHERE slug IS NULL AND name IS NOT NULL;

-- 添加注释
COMMENT ON COLUMN products.slug IS 'SEO friendly URL slug for the product';