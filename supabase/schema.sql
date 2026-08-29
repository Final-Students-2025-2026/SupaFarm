-- SupaFarm Postgres Database Schema & Storage Setup
-- Digital Crop Marketplace Platform for Ghana

-- 1. Drop Legacy Unused Tables
DROP TABLE IF EXISTS public.plants CASCADE;
DROP TABLE IF EXISTS public.greenhouse_telemetry CASCADE;
DROP TABLE IF EXISTS public.greenhouses CASCADE;
DROP TYPE IF EXISTS plant_stage CASCADE;

-- 2. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 3. Define Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('individual', 'business');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('available', 'sold_out', 'inactive');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE delivery_mode AS ENUM ('self_pickup', 'seller_delivery', 'platform_delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_delivery', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Core Database Tables

-- Profiles Table (Users: Farmers & Buyers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL DEFAULT 'buyer',
  account_type account_type DEFAULT 'individual',
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  address_text TEXT,
  latitude DOUBLE PRECISION DEFAULT 5.6037,
  longitude DOUBLE PRECISION DEFAULT -0.1870,
  location_point GEOGRAPHY(Point, 4326),
  profile_image_url TEXT,
  farm_background_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop Listings Table
CREATE TABLE IF NOT EXISTS public.crop_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'crate',
  price_ghc NUMERIC(10, 2) NOT NULL,
  badge TEXT,
  images TEXT[] DEFAULT '{}',
  latitude DOUBLE PRECISION DEFAULT 5.6037,
  longitude DOUBLE PRECISION DEFAULT -0.1870,
  status listing_status DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table (Delivery & COD)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.crop_listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  delivery_mode delivery_mode DEFAULT 'platform_delivery',
  payment_method TEXT DEFAULT 'cash_on_delivery',
  status order_status DEFAULT 'pending',
  amount_ghc NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Intelligence Wholesale Prices Table
CREATE TABLE IF NOT EXISTS public.market_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_name TEXT NOT NULL,
  market_location TEXT NOT NULL,
  region TEXT NOT NULL,
  price_ghc NUMERIC(10, 2) NOT NULL,
  price_change TEXT DEFAULT '+0.0%',
  is_up BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Voice Call Signaling Table
CREATE TABLE IF NOT EXISTS public.call_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_id UUID REFERENCES public.profiles(id),
  receiver_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'dialing',
  channel_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Crop Listings" ON public.crop_listings FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Read Market Intelligence" ON public.market_intelligence FOR SELECT USING (true);

CREATE POLICY "Allow All Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow All Insert Crop Listings" ON public.crop_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Crop Listings" ON public.crop_listings FOR UPDATE USING (true);
CREATE POLICY "Allow All Delete Crop Listings" ON public.crop_listings FOR DELETE USING (true);
CREATE POLICY "Allow All Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

-- 6. Supabase Storage Bucket Setup for Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('supafarm-images', 'supafarm-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read SupaFarm Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'supafarm-images');

CREATE POLICY "Allow Public Upload SupaFarm Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'supafarm-images');
