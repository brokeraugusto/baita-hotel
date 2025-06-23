-- Master User Initialization System for Production v1.0 - FIXED
-- Creates the UNIQUE master admin user on first system access

-- Step 1: Drop existing functions if they exist
DROP FUNCTION IF EXISTS initialize_master_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_system_status();
DROP FUNCTION IF EXISTS create_client_user(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Step 2: Create system status check function FIRST
CREATE OR REPLACE FUNCTION get_system_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    master_exists BOOLEAN := false;
    total_hotels INTEGER := 0;
    total_clients INTEGER := 0;
    system_version TEXT := '1.0.0';
BEGIN
    -- Check if master admin exists (with error handling)
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM profiles WHERE role = 'master_admin'
        ) INTO master_exists;
    EXCEPTION
        WHEN OTHERS THEN
            master_exists := false;
    END;
    
    -- Get statistics (with error handling)
    BEGIN
        SELECT COUNT(*) INTO total_hotels FROM hotels;
    EXCEPTION
        WHEN OTHERS THEN
            total_hotels := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO total_clients FROM profiles WHERE role = 'client';
    EXCEPTION
        WHEN OTHERS THEN
            total_clients := 0;
    END;
    
    RETURN jsonb_build_object(
        'system_initialized', master_exists,
        'version', system_version,
        'statistics', jsonb_build_object(
            'total_hotels', total_hotels,
            'total_clients', total_clients,
            'master_admin_exists', master_exists
        ),
        'requires_setup', NOT master_exists,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return safe defaults if anything fails
        RETURN jsonb_build_object(
            'system_initialized', false,
            'version', '1.0.0',
            'statistics', jsonb_build_object(
                'total_hotels', 0,
                'total_clients', 0,
                'master_admin_exists', false
            ),
            'requires_setup', true,
            'timestamp', NOW(),
            'error', SQLERRM
        );
END;
$$;

-- Step 3: Test the function immediately
SELECT get_system_status();

-- Step 4: Create master user initialization function
CREATE OR REPLACE FUNCTION initialize_master_user(
    master_email TEXT,
    master_password TEXT,
    master_name TEXT DEFAULT 'System Administrator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    master_user_id UUID;
    result JSONB;
BEGIN
    -- Check if any master admin already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE role = 'master_admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Master admin already exists. Only one master admin is allowed.',
            'code', 'MASTER_EXISTS'
        );
    END IF;
    
    -- Validate email format
    IF NOT (master_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid email format',
            'code', 'INVALID_EMAIL'
        );
    END IF;
    
    -- Validate password strength
    IF LENGTH(master_password) < 8 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Password must be at least 8 characters long',
            'code', 'WEAK_PASSWORD'
        );
    END IF;
    
    -- Generate UUID for master user
    master_user_id := gen_random_uuid();
    
    -- Create auth user (with proper error handling)
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            aud,
            role
        ) VALUES (
            master_user_id,
            '00000000-0000-0000-0000-000000000000',
            master_email,
            crypt(master_password, gen_salt('bf', 12)),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create auth user: ' || SQLERRM,
                'code', 'AUTH_USER_FAILED'
            );
    END;
    
    -- Create auth identity (with proper error handling)
    BEGIN
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            master_user_id,
            jsonb_build_object(
                'sub', master_user_id::text,
                'email', master_email,
                'email_verified', true
            ),
            'email',
            NOW(),
            NOW(),
            NOW()
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Try to clean up the auth user if identity creation fails
            DELETE FROM auth.users WHERE id = master_user_id;
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create auth identity: ' || SQLERRM,
                'code', 'AUTH_IDENTITY_FAILED'
            );
    END;
    
    -- Create profile (with proper error handling)
    BEGIN
        INSERT INTO profiles (
            id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            master_user_id,
            master_email,
            master_name,
            'master_admin',
            true,
            NOW(),
            NOW()
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Clean up auth records if profile creation fails
            DELETE FROM auth.identities WHERE user_id = master_user_id;
            DELETE FROM auth.users WHERE id = master_user_id;
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create profile: ' || SQLERRM,
                'code', 'PROFILE_CREATION_FAILED'
            );
    END;
    
    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Master admin user created successfully',
        'user_id', master_user_id,
        'email', master_email,
        'created_at', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unexpected error: ' || SQLERRM,
            'code', 'CREATION_FAILED'
        );
END;
$$;

-- Step 5: Create default subscription plans (with conflict handling)
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, max_hotels, max_rooms, features) VALUES
('Starter', 'Plano básico para pequenas pousadas', 49.90, 499.00, 1, 20, 
 '["Gestão de reservas", "Check-in/Check-out", "Relatórios básicos"]'::jsonb),
('Professional', 'Plano completo para hotéis médios', 99.90, 999.00, 1, 100, 
 '["Gestão completa", "Manutenção", "Limpeza", "Financeiro", "Relatórios avançados"]'::jsonb),
('Enterprise', 'Plano para redes hoteleiras', 199.90, 1999.00, 10, 1000, 
 '["Multi-hotéis", "API completa", "Integrações", "Suporte prioritário", "Customizações"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    max_hotels = EXCLUDED.max_hotels,
    max_rooms = EXCLUDED.max_rooms,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Step 6: Create client management function
CREATE OR REPLACE FUNCTION create_client_user(
    client_email TEXT,
    client_password TEXT,
    client_name TEXT,
    hotel_name TEXT,
    plan_name TEXT DEFAULT 'Starter'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    client_user_id UUID;
    hotel_id UUID;
    plan_id UUID;
    result JSONB;
BEGIN
    -- Only master admin can create clients
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'master_admin'
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only master admin can create client users',
            'code', 'UNAUTHORIZED'
        );
    END IF;
    
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE email = client_email) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email already exists',
            'code', 'EMAIL_EXISTS'
        );
    END IF;
    
    -- Get plan ID
    SELECT id INTO plan_id FROM subscription_plans WHERE name = plan_name AND is_active = true;
    IF plan_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid subscription plan: ' || plan_name,
            'code', 'INVALID_PLAN'
        );
    END IF;
    
    -- Generate UUIDs
    client_user_id := gen_random_uuid();
    hotel_id := gen_random_uuid();
    
    -- Create auth user
    BEGIN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, aud, role
        ) VALUES (
            client_user_id, '00000000-0000-0000-0000-000000000000',
            client_email, crypt(client_password, gen_salt('bf', 12)), NOW(),
            NOW(), NOW(), 'authenticated', 'authenticated'
        );
    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create auth user: ' || SQLERRM,
                'code', 'AUTH_CREATION_FAILED'
            );
    END;
    
    -- Create auth identity
    BEGIN
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), client_user_id,
            jsonb_build_object('sub', client_user_id::text, 'email', client_email),
            'email', NOW(), NOW()
        );
    EXCEPTION
        WHEN OTHERS THEN
            DELETE FROM auth.users WHERE id = client_user_id;
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create auth identity: ' || SQLERRM,
                'code', 'IDENTITY_CREATION_FAILED'
            );
    END;
    
    -- Create profile
    BEGIN
        INSERT INTO profiles (id, email, full_name, role) VALUES
        (client_user_id, client_email, client_name, 'client');
    EXCEPTION
        WHEN OTHERS THEN
            DELETE FROM auth.identities WHERE user_id = client_user_id;
            DELETE FROM auth.users WHERE id = client_user_id;
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create profile: ' || SQLERRM,
                'code', 'PROFILE_CREATION_FAILED'
            );
    END;
    
    -- Create hotel
    BEGIN
        INSERT INTO hotels (id, owner_id, name, status) VALUES
        (hotel_id, client_user_id, hotel_name, 'active');
    EXCEPTION
        WHEN OTHERS THEN
            DELETE FROM profiles WHERE id = client_user_id;
            DELETE FROM auth.identities WHERE user_id = client_user_id;
            DELETE FROM auth.users WHERE id = client_user_id;
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create hotel: ' || SQLERRM,
                'code', 'HOTEL_CREATION_FAILED'
            );
    END;
    
    -- Create subscription
    BEGIN
        INSERT INTO subscriptions (hotel_id, plan_id, status) VALUES
        (hotel_id, plan_id, 'trial');
    EXCEPTION
        WHEN OTHERS THEN
            DELETE FROM hotels WHERE id = hotel_id;
            DELETE FROM profiles WHERE id = client_user_id;
            DELETE FROM auth.identities WHERE user_id = client_user_id;
            DELETE FROM auth.users WHERE id = client_user_id;
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to create subscription: ' || SQLERRM,
                'code', 'SUBSCRIPTION_CREATION_FAILED'
            );
    END;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Client created successfully',
        'client_id', client_user_id,
        'hotel_id', hotel_id,
        'email', client_email
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unexpected error: ' || SQLERRM,
            'code', 'CREATION_FAILED'
        );
END;
$$;

-- Step 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_system_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION initialize_master_user(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_client_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Step 8: Final verification
SELECT 'System functions created successfully' as status;
SELECT get_system_status() as system_status;
