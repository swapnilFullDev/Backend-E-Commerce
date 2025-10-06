/*
  # E-commerce Admin Platform Database Schema

  ## Overview
  Complete database schema for e-commerce admin platform with multi-store support,
  product management, order processing, and analytics.

  ## Instructions
  Run this SQL script in your Supabase SQL Editor to create all tables and policies.

  ## New Tables Created

  ### 1. admins
  - id (uuid, primary key)
  - email (text, unique)
  - password_hash (text)
  - personal_phone (text)
  - full_name (text)
  - profile_image (text)
  - status (text) - active/blocked
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. stores
  - id (uuid, primary key)
  - owner_id (uuid, references admins)
  - store_name (text)
  - store_address (text)
  - business_number (text)
  - gst_business_id (text)
  - logo_upload (text)
  - contact_number (text)
  - email (text)
  - payment_setting (jsonb) - commission rates, payment methods
  - store_banner (text)
  - status (text) - pending/approved/rejected
  - documents (jsonb)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 3. categories
  - id (uuid, primary key)
  - name (text)
  - image (text)
  - icon (text)
  - parent_id (uuid, nullable, self-reference)
  - status (text) - active/inactive
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 4. products
  - id (uuid, primary key)
  - store_id (uuid, references stores)
  - category_id (uuid, references categories)
  - subcategory_id (uuid, references categories, nullable)
  - name (text)
  - description (text)
  - price (decimal)
  - stock_quantity (integer)
  - images (jsonb) - array of image URLs
  - status (text) - pending/approved/rejected/blocked
  - sku (text, unique)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 5. orders
  - id (uuid, primary key)
  - order_number (text, unique)
  - customer_id (uuid, references customers)
  - store_id (uuid, references stores)
  - total_amount (decimal)
  - payment_status (text) - pending/paid/unpaid/refunded
  - payment_method (text)
  - order_status (text) - pending/processing/shipped/delivered/cancelled
  - commission_earned (decimal)
  - shipping_address (jsonb)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 6. order_items
  - id (uuid, primary key)
  - order_id (uuid, references orders)
  - product_id (uuid, references products)
  - quantity (integer)
  - price (decimal)
  - subtotal (decimal)
  - created_at (timestamptz)

  ### 7. customers
  - id (uuid, primary key)
  - name (text)
  - email (text, unique)
  - phone (text)
  - order_history (integer, default 0)
  - total_spent (decimal, default 0)
  - status (text) - active/blocked
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 8. banners
  - id (uuid, primary key)
  - title (text)
  - image (text)
  - link (text)
  - status (text) - active/inactive
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 9. rentals
  - id (uuid, primary key)
  - store_id (uuid, references stores)
  - customer_id (uuid, references customers)
  - product_id (uuid, references products)
  - rental_start_date (date)
  - rental_end_date (date)
  - return_status (text) - pending/returned/late/damaged
  - penalty (decimal, default 0)
  - security_deposit (decimal)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 10. analytics
  - id (uuid, primary key)
  - store_id (uuid, references stores, nullable)
  - metric_type (text) - sales/revenue/customer_growth
  - metric_value (decimal)
  - period (text) - daily/weekly/monthly
  - date (date)
  - created_at (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated admin users
  - Add policies for store owners to access their own data
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  personal_phone text,
  full_name text NOT NULL,
  profile_image text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES admins(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  store_address text NOT NULL,
  business_number text,
  gst_business_id text,
  logo_upload text,
  contact_number text NOT NULL,
  email text,
  payment_setting jsonb DEFAULT '{}',
  store_banner text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text,
  icon text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  images jsonb DEFAULT '[]',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
  sku text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  order_history integer DEFAULT 0,
  total_spent decimal(10, 2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  total_amount decimal(10, 2) NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'unpaid', 'refunded')),
  payment_method text,
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  commission_earned decimal(10, 2) DEFAULT 0,
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price decimal(10, 2) NOT NULL,
  subtotal decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image text NOT NULL,
  link text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  rental_start_date date NOT NULL,
  rental_end_date date NOT NULL,
  return_status text DEFAULT 'pending' CHECK (return_status IN ('pending', 'returned', 'late', 'damaged')),
  penalty decimal(10, 2) DEFAULT 0,
  security_deposit decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  metric_value decimal(15, 2) NOT NULL,
  period text CHECK (period IN ('daily', 'weekly', 'monthly')),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_rentals_store_id ON rentals(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_store_id ON analytics(store_id);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins table
CREATE POLICY "Admins can view own profile"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own profile"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for stores table
CREATE POLICY "Store owners can view own stores"
  ON stores FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Store owners can insert own stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Store owners can update own stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for categories table (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for products table
CREATE POLICY "Store owners can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- RLS Policies for orders table
CREATE POLICY "Store owners can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- RLS Policies for order_items table
CREATE POLICY "Store owners can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN stores s ON s.id = o.store_id
      WHERE o.id = order_items.order_id
      AND s.owner_id = auth.uid()
    )
  );

-- RLS Policies for customers table
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for banners table
CREATE POLICY "Authenticated users can view banners"
  ON banners FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for rentals table
CREATE POLICY "Store owners can view own rentals"
  ON rentals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = rentals.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- RLS Policies for analytics table
CREATE POLICY "Store owners can view own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = analytics.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
