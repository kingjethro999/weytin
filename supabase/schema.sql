-- Weytin Platform Database Schema
-- Last Updated: 2026-04-28

-- 1. Locations Table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users Profile Table (Extensions of Auth.Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'vendor', 'admin')) DEFAULT 'user',
  location_id UUID REFERENCES locations(id),
  business_name TEXT,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Supply Entries Table
CREATE TABLE supply_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  quantity TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Price Flags Table
CREATE TABLE price_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_entry_id UUID REFERENCES supply_entries(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Demand Events Table
CREATE TABLE demand_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT CHECK (event_type IN ('search', 'view', 'alert_signup')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Price Rules Table
CREATE TABLE price_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  min_price DECIMAL(12, 2) NOT NULL,
  max_price DECIMAL(12, 2) NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Basic setup)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public Read Locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Supply Entries" ON supply_entries FOR SELECT USING (true);
CREATE POLICY "Public Read Price Rules" ON price_rules FOR SELECT USING (true);

-- Profile Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed Data (Example)
INSERT INTO categories (name, slug) VALUES ('Grains', 'grains'), ('Construction', 'construction'), ('Energy', 'energy');
