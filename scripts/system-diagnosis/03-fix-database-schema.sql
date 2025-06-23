-- First, let's check what tables and columns actually exist
SELECT 'Current hotels table structure' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'hotels' 
ORDER BY ordinal_position;

SELECT 'Current profiles table structure' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if hotels table exists and what columns it has
DO $$
BEGIN
    -- Drop and recreate hotels table with correct structure
    DROP TABLE IF EXISTS hotels CASCADE;
    
    CREATE TABLE hotels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE 'Hotels table recreated successfully';
END $$;

-- Ensure user_role enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('master_admin', 'client');
        RAISE NOTICE 'user_role enum created';
    ELSE
        RAISE NOTICE 'user_role enum already exists';
    END IF;
END $$;

-- Recreate profiles table with correct structure
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    hotel_id UUID REFERENCES hotels(id),
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
);

-- Insert test users into profiles
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
);

-- Verify the setup
SELECT 'Setup Verification' as check_type,
       p.email,
       p.full_name,
       p.role,
       h.name as hotel_name
FROM profiles p
LEFT JOIN hotels h ON p.hotel_id = h.id
WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

-- Show final table structures
SELECT 'Final hotels table structure' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'hotels' 
ORDER BY ordinal_position;

SELECT 'Final profiles table structure' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
