-- Create secure RLS policies
-- Enable RLS with proper policies

-- 1. Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for profiles
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow master admins to read all profiles
CREATE POLICY "Master admins can read all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'master_admin'
        )
    );

-- Allow master admins to update all profiles
CREATE POLICY "Master admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'master_admin'
        )
    );

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create RLS policies for hotels
-- Allow hotel owners to read their hotel
CREATE POLICY "Hotel owners can read own hotel" ON hotels
    FOR SELECT USING (owner_id = auth.uid());

-- Allow hotel owners to update their hotel
CREATE POLICY "Hotel owners can update own hotel" ON hotels
    FOR UPDATE USING (owner_id = auth.uid());

-- Allow master admins to read all hotels
CREATE POLICY "Master admins can read all hotels" ON hotels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'master_admin'
        )
    );

-- Allow hotel creation
CREATE POLICY "Allow hotel creation" ON hotels
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- 4. Create function to get current user profile (bypasses RLS for internal use)
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role user_role,
    hotel_id UUID,
    hotel_name TEXT,
    phone TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.role,
        p.hotel_id,
        p.hotel_name,
        p.phone,
        p.is_active,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.id = auth.uid();
END;
$$;
