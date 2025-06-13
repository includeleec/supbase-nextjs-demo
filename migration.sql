-- 数据库迁移脚本：将 image_url 迁移到新的 images 结构

-- 1. 添加新字段
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS primary_image_id VARCHAR(255);

-- 2. 迁移现有的 image_url 数据到 images 字段
UPDATE products 
SET images = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' THEN 
    jsonb_build_array(
      jsonb_build_object(
        'id', substr(md5(random()::text), 1, 8),
        'url', image_url,
        'cloudflare_id', null,
        'is_primary', true,
        'alt', name || ' 图片',
        'created_at', created_at
      )
    )
  ELSE '[]'::jsonb
END
WHERE images = '[]'::jsonb OR images IS NULL;

-- 3. 设置主图ID
UPDATE products 
SET primary_image_id = (images->0->>'id')
WHERE jsonb_array_length(images) > 0 AND primary_image_id IS NULL;

-- 4. 删除旧的 image_url 字段（可选，建议先备份）
-- ALTER TABLE products DROP COLUMN IF EXISTS image_url;

-- 5. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_products_primary_image ON products (primary_image_id);