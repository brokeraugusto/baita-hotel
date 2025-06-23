-- Fix hotels table schema to match expected structure
DO $$
BEGIN
    RAISE NOTICE '🔧 FIXING HOTELS TABLE SCHEMA';
    RAISE NOTICE '================================';
    
    -- Check if hotels table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        RAISE NOTICE '✅ Hotels table exists, checking columns...';
        
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'city') THEN
            ALTER TABLE hotels ADD COLUMN city VARCHAR(100);
            RAISE NOTICE '✅ Added city column';
        ELSE
            RAISE NOTICE '✅ City column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'state') THEN
            ALTER TABLE hotels ADD COLUMN state VARCHAR(100);
            RAISE NOTICE '✅ Added state column';
        ELSE
            RAISE NOTICE '✅ State column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'country') THEN
            ALTER TABLE hotels ADD COLUMN country VARCHAR(100) DEFAULT 'Brasil';
            RAISE NOTICE '✅ Added country column';
        ELSE
            RAISE NOTICE '✅ Country column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'postal_code') THEN
            ALTER TABLE hotels ADD COLUMN postal_code VARCHAR(20);
            RAISE NOTICE '✅ Added postal_code column';
        ELSE
            RAISE NOTICE '✅ Postal_code column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'website') THEN
            ALTER TABLE hotels ADD COLUMN website VARCHAR(255);
            RAISE NOTICE '✅ Added website column';
        ELSE
            RAISE NOTICE '✅ Website column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'description') THEN
            ALTER TABLE hotels ADD COLUMN description TEXT;
            RAISE NOTICE '✅ Added description column';
        ELSE
            RAISE NOTICE '✅ Description column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'logo_url') THEN
            ALTER TABLE hotels ADD COLUMN logo_url VARCHAR(500);
            RAISE NOTICE '✅ Added logo_url column';
        ELSE
            RAISE NOTICE '✅ Logo_url column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'settings') THEN
            ALTER TABLE hotels ADD COLUMN settings JSONB DEFAULT '{}';
            RAISE NOTICE '✅ Added settings column';
        ELSE
            RAISE NOTICE '✅ Settings column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'subscription_plan') THEN
            ALTER TABLE hotels ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'basic';
            RAISE NOTICE '✅ Added subscription_plan column';
        ELSE
            RAISE NOTICE '✅ Subscription_plan column already exists';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'subscription_status') THEN
            ALTER TABLE hotels ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
            RAISE NOTICE '✅ Added subscription_status column';
        ELSE
            RAISE NOTICE '✅ Subscription_status column already exists';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Hotels table does not exist, creating it...';
        
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
        
        RAISE NOTICE '✅ Hotels table created';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Hotels table schema fixed!';
    
END $$;
