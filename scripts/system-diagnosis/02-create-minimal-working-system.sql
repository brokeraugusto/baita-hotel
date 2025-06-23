-- Create a minimal working system from scratch
-- This ensures we have a clean, working foundation

-- Drop existing problematic constraints and recreate cleanly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Disable RLS temporarily for setup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;

-- Ensure user_role enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('master_admin', 'client');
    END IF;
END $$;

-- Recreate profiles table with correct structure
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    hotel_id UUID REFERENCES hotels(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure hotels table exists
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_hotel_id ON profiles(hotel_id);

-- Insert test hotel
INSERT INTO hotels (id, name, email, phone, address) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Hotel Exemplo',
    'contato@hotelexemplo.com',
    '(11) 99999-9999',
    'Rua Exemplo, 123 - São Paulo, SP'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address;

-- Insert test users
INSERT INTO profiles (id, email, full_name, role, hotel_id) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'admin@baitahotel.com',
    'Administrador Master',
    'master_admin',
    NULL
),
(
    '22222222-2222-2222-2222-222222222222',
    'hotel@exemplo.com',
    'Gerente do Hotel',
    'client',
    '550e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    hotel_id = EXCLUDED.hotel_id;

-- Create auth users (this might fail if users already exist, that's OK)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'admin@baitahotel.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador Master"}'
),
(
    '22222222-2222-2222-2222-222222222222',
    'hotel@exemplo.com',
    crypt('hotel123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Gerente do Hotel"}'
)
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 'Setup Verification' as check_type,
       p.email,
       p.full_name,
       p.role,
       h.name as hotel_name
FROM profiles p
LEFT JOIN hotels h ON p.hotel_id = h.id
WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com');
