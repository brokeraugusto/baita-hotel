-- Complete database cleanup and setup
-- This script fixes all the reported SQL errors

-- 1. Drop problematic tables and recreate them properly
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS maintenance_technicians CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;
DROP TABLE IF EXISTS cleaning_tasks CASCADE;
DROP TABLE IF EXISTS cleaning_personnel CASCADE;
DROP TABLE IF EXISTS room_status_logs CASCADE;

-- 2. Fix profiles table structure
DO $$
BEGIN
    -- Check if user_role column exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_role'
    ) THEN
        ALTER TABLE profiles DROP COLUMN user_role;
    END IF;
    
    -- Ensure role column exists with proper enum
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role user_role_enum DEFAULT 'client';
    END IF;
    
    -- Ensure is_active column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Create proper enum types
DO $$
BEGIN
    -- Create user_role_enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('master_admin', 'client', 'hotel_staff');
    END IF;
    
    -- Create maintenance_status_enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_status_enum') THEN
        CREATE TYPE maintenance_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    END IF;
    
    -- Create maintenance_priority_enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_priority_enum') THEN
        CREATE TYPE maintenance_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
    
    -- Create room_status_enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_status_enum') THEN
        CREATE TYPE room_status_enum AS ENUM ('available', 'occupied', 'maintenance', 'cleaning', 'out_of_order');
    END IF;
END $$;

-- 4. Create rooms table with proper structure
CREATE TABLE IF NOT EXISTS rooms (
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

-- 5. Create maintenance_categories table
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create maintenance_technicians table
CREATE TABLE IF NOT EXISTS maintenance_technicians (
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

-- 7. Create maintenance_orders table with proper structure
CREATE TABLE IF NOT EXISTS maintenance_orders (
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

-- 8. Create cleaning_personnel table
CREATE TABLE IF NOT EXISTS cleaning_personnel (
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

-- 9. Create cleaning_tasks table
CREATE TABLE IF NOT EXISTS cleaning_tasks (
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

-- 10. Create room_status_logs table
CREATE TABLE IF NOT EXISTS room_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    previous_status room_status_enum,
    new_status room_status_enum NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Insert default maintenance categories
INSERT INTO maintenance_categories (name, description, color) VALUES
('Plumbing', 'Water, pipes, and plumbing fixtures', '#3B82F6'),
('Electrical', 'Electrical systems and fixtures', '#F59E0B'),
('HVAC', 'Heating, ventilation, and air conditioning', '#10B981'),
('Furniture', 'Furniture repair and replacement', '#8B5CF6'),
('Cleaning', 'Deep cleaning and maintenance', '#06B6D4'),
('General', 'General maintenance tasks', '#6B7280')
ON CONFLICT DO NOTHING;

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_room_id ON maintenance_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_created_at ON maintenance_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_hotel_id ON cleaning_tasks(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_room_id ON cleaning_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_status ON cleaning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_scheduled_date ON cleaning_tasks(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- 13. Create RPC function to create master admin
CREATE OR REPLACE FUNCTION create_master_admin_user(
    master_email TEXT,
    master_password TEXT,
    master_name TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if master admin already exists
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE email = master_email AND role = 'master_admin'
    ) THEN
        RAISE EXCEPTION 'Master admin already exists with this email';
    END IF;

    -- Generate a UUID for the new user
    new_user_id := gen_random_uuid();
    
    -- Insert into profiles table
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
        master_email,
        master_name,
        'master_admin',
        true,
        NOW(),
        NOW()
    );
    
    RETURN new_user_id;
END;
$$;

-- 14. Create RPC function to create client user
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
    current_user_role user_role_enum;
BEGIN
    -- Check if current user is master admin
    SELECT role INTO current_user_role
    FROM profiles 
    WHERE id = auth.uid();
    
    IF current_user_role != 'master_admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only master admin can create client users');
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE email = client_email) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email already exists');
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
    
    RETURN jsonb_build_object(
        'success', true, 
        'user_id', new_user_id,
        'hotel_id', new_hotel_id
    );
END;
$$;

-- 15. Create system status function
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

-- 16. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- 17. Create basic RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Master admin can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'master_admin'
        )
    );

CREATE POLICY "Users can view own hotel" ON hotels
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Master admin can view all hotels" ON hotels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'master_admin'
        )
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'All tables created and configured.';
    RAISE NOTICE 'RLS policies enabled.';
    RAISE NOTICE 'Ready to create master admin user.';
END $$;
