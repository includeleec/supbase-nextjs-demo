-- 商品表
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 管理员表
CREATE TABLE admin (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_admin_updated_at 
    BEFORE UPDATE ON admin 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入默认管理员账户 (密码: admin123)
INSERT INTO admin (username, password, email) VALUES
('admin', '$2b$10$FIUiLf8l0ClDpWQnEG5iSuqQ.ydHIaw3dC/ZOX1WyRtqXjBZOshUS', 'admin@example.com');

-- 插入示例数据
INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
('iPhone 15 Pro', '最新款 iPhone，配备 A17 Pro 芯片', 9999.00, 'https://picsum.photos/300/200?random=1', '电子产品', 50),
('MacBook Air M3', '轻薄便携的笔记本电脑', 8999.00, 'https://picsum.photos/300/200?random=2', '电子产品', 30),
('AirPods Pro', '主动降噪无线耳机', 1999.00, 'https://picsum.photos/300/200?random=3', '电子产品', 100),
('Nike Air Max', '经典运动鞋', 899.00, 'https://picsum.photos/300/200?random=4', '运动用品', 200),
('Adidas 运动服', '舒适透气运动服装', 399.00, 'https://picsum.photos/300/200?random=5', '服装', 150);