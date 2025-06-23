-- Complete database fix - Step by step approach
-- This script will fix all database issues systematically

-- Step 1: Create enum types first
DO $$
BEGIN
    -- Drop existing enum types if they exist (to recreate them properly)
    DROP TYPE IF EXISTS user_role_enum CASCADE;
    DROP TYPE IF EXISTS maintenance_status_enum CASCADE;
    DROP TYPE IF EXISTS maintenance_priority_enum CASCADE;
    DROP TYPE IF EXISTS room_status_enum CASCADE;
    DROP TYPE IF EXISTS subscription_status_enum CASCADE;
    
    -- Create enum types
    CREATE TYPE user_role_enum AS ENUM ('master_admin', 'client', 'hotel_staff');
    CREATE TYPE maintenance_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    CREATE TYPE maintenance_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
    CREATE TYPE room_status_enum AS ENUM ('available', 'occupied', 'maintenance', 'cleaning', 'out_of_order');
    CREATE TYPE subscription_status_enum AS ENUM ('trial', 'active', 'suspended', 'cancelled');
    
    RAISE NOTICE 'Enum types created successfully';
END $$;

-- Step 2: Drop all problematic tables to start fresh
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS maintenance_technicians CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;
DROP TABLE IF EXISTS cleaning_tasks CASCADE;
DROP TABLE IF EXISTS cleaning_personnel CASCADE;
DROP TABLE IF EXISTS room_status_logs CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Step 3: Fix profiles table structure
DO $$
BEGIN
    -- Add missing columns to profiles table
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role user_role_enum DEFAULT 'client';
        RAISE NOTICE 'Added role column to profiles';
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to profiles';
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(50);
        RAISE NOTICE 'Added phone column to profiles';
    END IF;
    
    -- Remove user_role column if it exists (wrong column name)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_role'
    ) THEN
        ALTER TABLE profiles DROP COLUMN user_role;
        RAISE NOTICE 'Removed incorrect user_role column from profiles';
    END IF;
    
    -- Ensure updated_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to profiles';
    END IF;
END $$;

-- Step 4: Fix hotels table structure
DO $$
BEGIN
    -- Add missing columns to hotels table
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hotels' AND column_name = 'status'
    ) THEN
        ALTER TABLE hotels ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        RAISE NOTICE 'Added status column to hotels';
    END IF;
    
    -- Add address columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hotels' AND column_name = 'address'
    ) THEN
        ALTER TABLE hotels ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column to hotels';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hotels' AND column_name = 'city'
    ) THEN
        ALTER TABLE hotels ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Added city column to hotels';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hotels' AND column_name = 'state'
    ) THEN
        ALTER TABLE hotels ADD COLUMN state VARCHAR(100);
        RAISE NOTICE 'Added state column to hotels';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hotels' AND column_name = 'country'
    ) THEN
        ALTER TABLE hotels ADD COLUMN country VARCHAR(100) DEFAULT 'Brasil';
        RAISE NOTICE 'Added country column to hotels';
    END IF;
    
    -- Ensure updated_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hotels' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE hotels ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to hotels';
    END IF;
END $$;

-- Step 5: Create subscription_plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    max_rooms INTEGER,
    max_users INTEGER,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status subscription_status_enum DEFAULT 'trial',
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) DEFAULT 'standard',
    floor_number INTEGER,
    capacity INTEGER DEFAULT 2,
    status room_status_enum DEFAULT 'available',
    description TEXT,
    amenities TEXT[],
    price_per_night DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, room_number)
);

-- Step 8: Create maintenance_categories table
CREATE TABLE maintenance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Create maintenance_technicians table
CREATE TABLE maintenance_technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    specialties TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 10: Create maintenance_orders table
CREATE TABLE maintenance_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    category_id UUID REFERENCES maintenance_categories(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES maintenance_technicians(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status maintenance_status_enum DEFAULT 'pending',
    priority maintenance_priority_enum DEFAULT 'medium',
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    emergency_level INTEGER DEFAULT 1 CHECK (emergency_level BETWEEN 1 AND 5),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Create cleaning_personnel table
CREATE TABLE cleaning_personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    shift VARCHAR(20) DEFAULT 'morning',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 12: Create cleaning_tasks table
CREATE TABLE cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    personnel_id UUID REFERENCES cleaning_personnel(id) ON DELETE SET NULL,
    task_type VARCHAR(50) DEFAULT 'standard_cleaning',
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    estimated_duration INTEGER DEFAULT 30,
    actual_duration INTEGER,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    checklist JSONB,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 13: Create room_status_logs table
CREATE TABLE room_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    previous_status room_status_enum,
    new_status room_status_enum NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 14: Insert default data
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, max_rooms, max_users) VALUES
('Starter', 'Perfect for small hotels', 49.90, 499.00, 50, 5),
('Professional', 'For growing hotels', 99.90, 999.00, 200, 15),
('Enterprise', 'For large hotel chains', 199.90, 1999.00, 1000, 50)
ON CONFLICT (name) DO NOTHING;

INSERT INTO maintenance_categories (name, description, color) VALUES
('Plumbing', 'Water, pipes, and plumbing fixtures', '#3B82F6'),
('Electrical', 'Electrical systems and fixtures', '#F59E0B'),
('HVAC', 'Heating, ventilation, and air conditioning', '#10B981'),
('Furniture', 'Furniture repair and replacement', '#8B5CF6'),
('Cleaning', 'Deep cleaning and maintenance', '#06B6D4'),
('General', 'General maintenance tasks', '#6B7280')
ON CONFLICT DO NOTHING;

-- Step 15: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_hotels_owner_id ON hotels(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotel_id ON subscriptions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_hotel_id ON cleaning_tasks(hotel_id);

-- Step 16: Create RPC functions
CREATE OR REPLACE FUNCTION get_system_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    master_exists BOOLEAN;
    hotel_count INTEGER;
    client_count INTEGER;
BEGIN
    -- Check if master admin exists
    SELECT EXISTS(
        SELECT 1 FROM profiles 
        WHERE role = 'master_admin' AND is_active = true
    ) INTO master_exists;
    
    -- Get counts
    SELECT COUNT(*) INTO hotel_count FROM hotels WHERE status = 'active';
    SELECT COUNT(*) INTO client_count FROM profiles WHERE role = 'client' AND is_active = true;
    
    RETURN jsonb_build_object(
        'system_initialized', master_exists,
        'version', '1.0.0',
        'requires_setup', NOT master_exists,
        'statistics', jsonb_build_object(
            'total_hotels', hotel_count,
            'total_clients', client_count,
            'master_admin_exists', master_exists
        )
    );
END;
$$;

CREATE OR REPLACE FUNCTION create_client_user(
    client_email TEXT,
    client_password TEXT,
    client_name TEXT,
    hotel_name TEXT,
    plan_name TEXT DEFAULT 'Starter'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    new_hotel_id UUID;
    plan_id UUID;
    current_user_role user_role_enum;
BEGIN
    -- Check if current user is master admin
    SELECT role INTO current_user_role
    FROM profiles 
    WHERE id = auth.uid();
    
    IF current_user_role IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
    END IF;
    
    IF current_user_role != 'master_admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only master admin can create client users');
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE email = client_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email already exists');
    END IF;

    -- Get plan ID
    SELECT id INTO plan_id FROM subscription_plans WHERE name = plan_name LIMIT 1;
    IF plan_id IS NULL THEN
        SELECT id INTO plan_id FROM subscription_plans WHERE name = 'Starter' LIMIT 1;
    END IF;

    -- Generate UUIDs
    new_user_id := gen_random_uuid();
    new_hotel_id := gen_random_uuid();
    
    -- Create hotel first
    INSERT INTO hotels (
        id,
        name,
        owner_id,
        status,
        created_at,
        updated_at
    ) VALUES (
        new_hotel_id,
        hotel_name,
        new_user_id,
        'active',
        NOW(),
        NOW()
    );
    
    -- Create user profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        client_email,
        client_name,
        'client',
        true,
        NOW(),
        NOW()
    );
    
    -- Create subscription
    INSERT INTO subscriptions (
        hotel_id,
        plan_id,
        status,
        starts_at,
        trial_ends_at,
        created_at,
        updated_at
    ) VALUES (
        new_hotel_id,
        plan_id,
        'trial',
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true, 
        'user_id', new_user_id,
        'hotel_id', new_hotel_id
    );
END;
$$;

-- Step 17: Enable RLS (but keep it simple for now)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all for authenticated users" ON profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all for authenticated users" ON hotels
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE SETUP COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'All tables created with proper structure';
    RAISE NOTICE 'Enum types created correctly';
    RAISE NOTICE 'RPC functions created';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Ready to create master admin user!';
END $$;
