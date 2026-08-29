-- SupaFarm Postgres + PostGIS Database Schema
-- Digital Crop Marketplace & Smart Greenhouse Management for Ghana

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Define Enum Types
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

DO $$ BEGIN
    CREATE TYPE plant_stage AS ENUM ('Reproductive', 'Maturation', 'Vegetative', 'Seedling');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Create Tables

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

-- Greenhouses Table (IoT Telemetry & Controls)
CREATE TABLE IF NOT EXISTS public.greenhouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  plants_count INT DEFAULT 12,
  wind_speed TEXT DEFAULT '5 m/s',
  humidity TEXT DEFAULT '20 %',
  plant_types_count INT DEFAULT 4,
  lighting_active BOOLEAN DEFAULT TRUE,
  temp_celsius INT DEFAULT 24,
  watering_ml INT DEFAULT 200,
  ventilation_speed INT DEFAULT 10,
  height_cm INT DEFAULT 120,
  moisture_percent INT DEFAULT 45,
  fertilizer_type TEXT DEFAULT 'Organic',
  age_months INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Greenhouse Telemetry Readings (Humidity & Moisture History)
CREATE TABLE IF NOT EXISTS public.greenhouse_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  day_label TEXT NOT NULL,
  humidity_val INT NOT NULL,
  is_peak BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plants Table (Under Greenhouses)
CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage plant_stage DEFAULT 'Reproductive',
  count TEXT DEFAULT '120 plant',
  price TEXT NOT NULL,
  image_url TEXT,
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
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status listing_status DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table (3-Tier Delivery & COD)
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

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenhouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenhouse_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;

-- Create Open Read RLS Policies
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Greenhouses" ON public.greenhouses FOR SELECT USING (true);
CREATE POLICY "Public Read Telemetry" ON public.greenhouse_telemetry FOR SELECT USING (true);
CREATE POLICY "Public Read Plants" ON public.plants FOR SELECT USING (true);
CREATE POLICY "Public Read Crop Listings" ON public.crop_listings FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Read Market Intelligence" ON public.market_intelligence FOR SELECT USING (true);

-- Create Allow Insert/Update RLS Policies
CREATE POLICY "Allow All Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow All Update Greenhouses" ON public.greenhouses FOR UPDATE USING (true);
CREATE POLICY "Allow All Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

