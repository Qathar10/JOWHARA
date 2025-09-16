/*
  # Enhanced Admin Panel Database Schema Migration

  1. New Tables
    - `admin_users` - Secure admin authentication
    - `categories` - Product categories with enhanced fields
    - `brands` - Brand management with status tracking
    - `products` - Enhanced product catalog
    - `banners` - Homepage banner management
    - `orders` - Customer order tracking
    - `customers` - Customer information management
    - `inventory_logs` - Stock movement tracking
    - `admin_activity_logs` - Admin action logging

  2. Security
    - Enable RLS on all tables
    - Secure admin-only policies
    - Public read policies for frontend
    - Audit trail for admin actions

  3. Features
    - Real-time subscriptions
    - Auto-update timestamps
    - Comprehensive indexing
    - Data validation constraints
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS navigation_items CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Admin Users table for secure authentication
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image text,
  icon text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Brands table
CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image text,
  logo text,
  website text,
  country text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table with enhanced fields
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sku text UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_price numeric(10,2) CHECK (compare_price >= price),
  cost_price numeric(10,2) CHECK (cost_price >= 0),
  description text,
  short_description text,
  ingredients text,
  usage_instructions text,
  benefits text,
  images jsonb DEFAULT '[]'::jsonb,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  min_stock integer DEFAULT 5,
  max_stock integer DEFAULT 1000,
  weight numeric(8,2),
  dimensions jsonb,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  tags text[],
  meta_title text,
  meta_description text,
  seo_keywords text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  email text UNIQUE,
  phone text NOT NULL,
  whatsapp_number text,
  address jsonb,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  preferences jsonb DEFAULT '{}'::jsonb,
  total_orders integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  last_order_date timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table with enhanced tracking
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  shipping_address jsonb,
  billing_address jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  shipping_cost numeric(12,2) DEFAULT 0,
  discount_amount numeric(12,2) DEFAULT 0,
  total numeric(12,2) NOT NULL CHECK (total >= 0),
  currency text DEFAULT 'KSH',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  notes text,
  admin_notes text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Banners table for homepage management
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subtitle text,
  description text,
  image text NOT NULL,
  mobile_image text,
  link_url text,
  link_text text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  position text DEFAULT 'hero' CHECK (position IN ('hero', 'secondary', 'sidebar')),
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory logs for stock tracking
CREATE TABLE inventory_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('adjustment', 'sale', 'return', 'damage', 'restock')),
  quantity_change integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  reason text,
  reference_id uuid, -- Can reference order_id or other entities
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Admin activity logs for audit trail
CREATE TABLE admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_admin_activity_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for frontend
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Public can read active brands"
  ON brands FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Public can read active banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

-- Admin authentication policies
CREATE POLICY "Admins can read their own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Admin management policies (full access for authenticated admin users)
CREATE POLICY "Authenticated admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

CREATE POLICY "Authenticated admins can manage brands"
  ON brands FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

CREATE POLICY "Authenticated admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

CREATE POLICY "Authenticated admins can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

CREATE POLICY "Authenticated admins can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

CREATE POLICY "Authenticated admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

CREATE POLICY "Authenticated admins can read inventory logs"
  ON inventory_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

CREATE POLICY "Authenticated admins can read activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id::text = auth.uid()::text AND active = true));

-- Public can create orders (for order placement)
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'JW' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock != NEW.stock THEN
    INSERT INTO inventory_logs (
      product_id,
      type,
      quantity_change,
      previous_stock,
      new_stock,
      reason,
      admin_id
    ) VALUES (
      NEW.id,
      'adjustment',
      NEW.stock - OLD.stock,
      OLD.stock,
      NEW.stock,
      'Stock updated',
      COALESCE(auth.uid()::uuid, NULL)
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ language 'plpgsql';

-- Function to auto-generate slugs
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for auto-generation
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();
CREATE TRIGGER auto_generate_category_slug BEFORE INSERT OR UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();
CREATE TRIGGER auto_generate_brand_slug BEFORE INSERT OR UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();
CREATE TRIGGER auto_generate_product_slug BEFORE INSERT OR UPDATE ON products FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

-- Create trigger for inventory logging
CREATE TRIGGER log_product_inventory_changes AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION log_inventory_change();

-- Insert initial categories
INSERT INTO categories (name, slug, description, image, sort_order) VALUES
  ('Hair Care', 'hair-care', 'Premium hair care products for all hair types', 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Beard Care', 'beard-care', 'Professional beard grooming essentials', 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Skincare', 'skincare', 'Luxurious skincare for radiant complexion', 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Perfumes', 'perfumes', 'Exquisite fragrances for every occasion', 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  ('Body Sprays', 'body-sprays', 'Refreshing body sprays for daily use', 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
  ('Air Fresheners', 'air-fresheners', 'Transform your space with luxury scents', 'https://images.pexels.com/photos/4210374/pexels-photo-4210374.jpeg?auto=compress&cs=tinysrgb&w=800', 6);

-- Insert initial brands
INSERT INTO brands (name, slug, description, image, country, sort_order, featured) VALUES
  ('Chanel', 'chanel', 'Luxury French fashion and beauty brand', 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400', 'France', 1, true),
  ('Dior', 'dior', 'Premium French luxury goods company', 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=400', 'France', 2, true),
  ('Tom Ford', 'tom-ford', 'American luxury fashion house', 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=400', 'USA', 3, true),
  ('Versace', 'versace', 'Italian luxury fashion company', 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=400', 'Italy', 4, true);

-- Insert sample products with proper category and brand references
INSERT INTO products (name, slug, sku, category_id, brand_id, price, description, ingredients, usage_instructions, images, stock, featured) VALUES
  ('Luxury Hair Serum', 'luxury-hair-serum', 'JW-HAIR-001', 
   (SELECT id FROM categories WHERE slug = 'hair-care'), 
   (SELECT id FROM brands WHERE slug = 'chanel'), 
   2500, 'Premium hair serum for silky smooth hair', 'Argan oil, Vitamin E, Keratin proteins', 'Apply 2-3 drops to damp hair, style as usual', 
   '["https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800"]', 25, true),
  
  ('Beard Growth Oil', 'beard-growth-oil', 'JW-BEARD-001', 
   (SELECT id FROM categories WHERE slug = 'beard-care'), 
   (SELECT id FROM brands WHERE slug = 'tom-ford'), 
   1800, 'Natural beard oil for healthy growth', 'Jojoba oil, Castor oil, Essential oils', 'Massage into beard and skin daily', 
   '["https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800"]', 30, true),
  
  ('Radiance Face Cream', 'radiance-face-cream', 'JW-SKIN-001', 
   (SELECT id FROM categories WHERE slug = 'skincare'), 
   (SELECT id FROM brands WHERE slug = 'dior'), 
   3200, 'Anti-aging cream for glowing skin', 'Hyaluronic acid, Retinol, Vitamin C', 'Apply morning and evening to clean skin', 
   '["https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800"]', 20, true),
  
  ('Midnight Oud', 'midnight-oud', 'JW-PERF-001', 
   (SELECT id FROM categories WHERE slug = 'perfumes'), 
   (SELECT id FROM brands WHERE slug = 'versace'), 
   4500, 'Luxurious oud fragrance for evening wear', 'Oud, Rose, Amber, Musk', 'Spray on pulse points', 
   '["https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=800"]', 15, true);

-- Insert sample banners
INSERT INTO banners (title, subtitle, image, category_id, position, sort_order) VALUES
  ('Luxury Fragrances', 'Discover our premium perfume collection', 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=1200', 
   (SELECT id FROM categories WHERE slug = 'perfumes'), 'hero', 1),
  ('Hair Care Excellence', 'Professional hair treatments for every need', 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1200', 
   (SELECT id FROM categories WHERE slug = 'hair-care'), 'hero', 2),
  ('Skincare Luxury', 'Radiant skin with our premium skincare line', 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=1200', 
   (SELECT id FROM categories WHERE slug = 'skincare'), 'hero', 3);

-- Create default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
  ('admin@jowhara.co.ke', crypt('admin123', gen_salt('bf')), 'System Administrator', 'super_admin');