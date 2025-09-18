/*
  # ABS Pattern Migration - Remove admin_users table and update RLS

  1. Changes
    - Drop admin_users table and related dependencies
    - Update RLS policies to use Supabase Auth with app_metadata.role
    - Remove admin_users references from other tables
    - Clean up triggers and functions

  2. Security
    - Admin access: auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    - Public read access for active content
    - Admin full CRUD access for management

  3. Cleanup
    - Remove admin-specific tables and references
    - Update inventory logging to work without admin_users
    - Simplify activity logging
*/

-- Drop dependent objects first
DROP TRIGGER IF EXISTS log_product_inventory_changes ON products;
DROP FUNCTION IF EXISTS log_inventory_change();

-- Drop tables that reference admin_users
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;

-- Drop the admin_users table
DROP TABLE IF EXISTS admin_users CASCADE;

-- Recreate inventory_logs without admin_users reference
CREATE TABLE inventory_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('adjustment', 'sale', 'return', 'damage', 'restock')),
  quantity_change integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  reason text,
  reference_id uuid, -- Can reference order_id or other entities
  user_id uuid, -- Supabase auth user ID
  created_at timestamptz DEFAULT now()
);

-- Recreate admin_activity_logs without admin_users reference
CREATE TABLE admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid, -- Supabase auth user ID
  user_email text,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_admin_activity_logs_user ON admin_activity_logs(user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- Enable RLS on new tables
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to use Supabase Auth with app_metadata.role

-- Categories policies
DROP POLICY IF EXISTS "Authenticated admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Brands policies
DROP POLICY IF EXISTS "Authenticated admins can manage brands" ON brands;
CREATE POLICY "Admins can manage brands"
  ON brands FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Products policies
DROP POLICY IF EXISTS "Authenticated admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Customers policies
DROP POLICY IF EXISTS "Authenticated admins can manage customers" ON customers;
CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Orders policies
DROP POLICY IF EXISTS "Authenticated admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Banners policies
DROP POLICY IF EXISTS "Authenticated admins can manage banners" ON banners;
CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Inventory logs policies
CREATE POLICY "Admins can read inventory logs"
  ON inventory_logs FOR SELECT
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "System can insert inventory logs"
  ON inventory_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Activity logs policies
CREATE POLICY "Admins can read activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "System can insert activity logs"
  ON admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Recreate inventory logging function
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
      user_id
    ) VALUES (
      NEW.id,
      'adjustment',
      NEW.stock - OLD.stock,
      OLD.stock,
      NEW.stock,
      'Stock updated',
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger for inventory logging
CREATE TRIGGER log_product_inventory_changes 
  AFTER UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION log_inventory_change();

-- Function to create admin user (to be called manually)
CREATE OR REPLACE FUNCTION create_admin_user(user_email text)
RETURNS text AS $$
DECLARE
  user_id uuid;
BEGIN
  -- This function should be called after creating a user via Supabase Auth
  -- It updates the user's app_metadata to include admin role
  
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User not found';
  END IF;
  
  -- Update user metadata (this would typically be done via Supabase Admin API)
  UPDATE auth.users 
  SET app_metadata = COALESCE(app_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = user_id;
  
  RETURN 'Admin role assigned successfully';
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Note: To create an admin user, you would:
-- 1. Create user via Supabase Auth (signup)
-- 2. Run: SELECT create_admin_user('admin@jowhara.co.ke');
-- Or better yet, use Supabase Admin API to set app_metadata directly