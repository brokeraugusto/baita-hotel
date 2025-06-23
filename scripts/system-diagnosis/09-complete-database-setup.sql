-- Complete Database Setup Script
-- This script creates all necessary tables, enums, and data

DO $$
BEGIN
    RAISE NOTICE '🚀 === COMPLETE DATABASE SETUP ===';
    
    -- 1. Create user_role enum
    RAISE NOTICE '';
    RAISE NOTICE '🏷️ 1. Creating user_role enum...';
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('master_admin', 'client');
        RAISE NOTICE '✅ user_role enum created';
    ELSE
        RAISE NOTICE '✅ user_role enum already exists';
    END IF;
    
    -- 2. Create hotels table
    RAISE NOTICE '';
    RAISE NOTICE '🏨 2. Creating hotels table...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        CREATE TABLE hotels (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100) DEFAULT 'Brasil',
            postal_code VARCHAR(20),
            website VARCHAR(255),
            description TEXT,
            logo_url VARCHAR(500),
            settings JSONB DEFAULT '{}',
            subscription_plan VARCHAR(50) DEFAULT 'basic',
            subscription_status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ hotels table created';
    ELSE
        RAISE NOTICE '✅ hotels table already exists';
    END IF;
    
    -- 3. Create profiles table
    RAISE NOTICE '';
    RAISE NOTICE '👤 3. Creating profiles table...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role user_role NOT NULL DEFAULT 'client',
            hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
            avatar_url VARCHAR(500),
            phone VARCHAR(50),
            settings JSONB DEFAULT '{}',
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ profiles table created';
    ELSE
        RAISE NOTICE '✅ profiles table already exists';
    END IF;
    
    -- 4. Insert sample hotel
    RAISE NOTICE '';
    RAISE NOTICE '🏨 4. Inserting sample hotel...';
    
    INSERT INTO hotels (
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        description
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'Hotel Exemplo',
        'hotel@exemplo.com',
        '(11) 99999-9999',
        'Rua das Flores, 123',
        'São Paulo',
        'SP',
        'Hotel exemplo para testes do sistema'
    ) ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE '✅ Sample hotel inserted';
    
    -- 5. Insert test profiles
    RAISE NOTICE '';
    RAISE NOTICE '👤 5. Inserting test profiles...';
    
    -- Master admin profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role
    ) VALUES (
        '11111111-1111-1111-1111-111111111111',
        'admin@baitahotel.com',
        'Administrador Master',
        'master_admin'
    ) ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    
    -- Client profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role,
        hotel_id
    ) VALUES (
        '22222222-2222-2222-2222-222222222222',
        'hotel@exemplo.com',
        'Gerente do Hotel',
        'client',
        '550e8400-e29b-41d4-a716-446655440000'
    ) ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        hotel_id = EXCLUDED.hotel_id;
    
    RAISE NOTICE '✅ Test profiles inserted';
    
    -- 6. Disable RLS temporarily for development
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ 6. Configuring RLS policies...';
    
    -- Disable RLS on profiles for development
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ RLS disabled for development';
    
    -- 7. Create indexes for performance
    RAISE NOTICE '';
    RAISE NOTICE '📊 7. Creating indexes...';
    
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    CREATE INDEX IF NOT EXISTS idx_profiles_hotel_id ON profiles(hotel_id);
    CREATE INDEX IF NOT EXISTS idx_hotels_email ON hotels(email);
    
    RAISE NOTICE '✅ Indexes created';
    
    -- 8. Verify setup
    RAISE NOTICE '';
    RAISE NOTICE '✅ 8. Verifying setup...';
    
    DECLARE
        hotel_count INTEGER;
        profile_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO hotel_count FROM hotels;
        SELECT COUNT(*) INTO profile_count FROM profiles;
        
        RAISE NOTICE '  Hotels: %', hotel_count;
        RAISE NOTICE '  Profiles: %', profile_count;
        
        IF hotel_count > 0 AND profile_count > 0 THEN
            RAISE NOTICE '✅ Database setup completed successfully!';
        ELSE
            RAISE NOTICE '❌ Database setup incomplete';
        END IF;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 === SETUP COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. Run the auth users creation script';
    RAISE NOTICE '2. Test the login system';
    RAISE NOTICE '3. Check system health at /system-health';
    
END $$;
