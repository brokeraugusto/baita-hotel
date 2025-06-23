-- Master User Initialization System for Production v1.0
-- Creates the UNIQUE master admin user on first system access

-- Step 1: Create master user initialization function
CREATE OR REPLACE FUNCTION initialize_master_user(
    master_email TEXT,
    master_password TEXT,
    master_name TEXT DEFAULT 'System Administrator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
    
    -- Create auth user
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
    
    -- Create auth identity
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
    
    -- Create profile
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
            'error', SQLERRM,
            'code', 'CREATION_FAILED'
        );
END;
$$;

-- Step 2: Create system status check function
CREATE OR REPLACE FUNCTION get_system_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    master_exists BOOLEAN;
    total_hotels INTEGER;
    total_clients INTEGER;
    system_version TEXT := '1.0.0';
BEGIN
    -- Check if master admin exists
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE role = 'master_admin'
    ) INTO master_exists;
    
    -- Get statistics
    SELECT COUNT(*) INTO total_hotels FROM hotels;
    SELECT COUNT(*) INTO total_clients FROM profiles WHERE role = 'client';
    
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
END;
$$;

-- Step 3: Create default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, max_hotels, max_rooms, features) VALUES
('Starter', 'Plano básico para pequenas pousadas', 49.90, 499.00, 1, 20, 
 '["Gestão de reservas", "Check-in/Check-out", "Relatórios básicos"]'::jsonb),
('Professional', 'Plano completo para hotéis médios', 99.90, 999.00, 1, 100, 
 '["Gestão completa", "Manutenção", "Limpeza", "Financeiro", "Relatórios avançados"]'::jsonb),
('Enterprise', 'Plano para redes hoteleiras', 199.90, 1999.00, 10, 1000, 
 '["Multi-hotéis", "API completa", "Integrações", "Suporte prioritário", "Customizações"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Step 4: Create client management function
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
            'error', 'Invalid subscription plan',
            'code', 'INVALID_PLAN'
        );
    END IF;
    
    -- Generate UUIDs
    client_user_id := gen_random_uuid();
    hotel_id := gen_random_uuid();
    
    -- Create auth user
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, aud, role
    ) VALUES (
        client_user_id, '00000000-0000-0000-0000-000000000000',
        client_email, crypt(client_password, gen_salt('bf', 12)), NOW(),
        NOW(), NOW(), 'authenticated', 'authenticated'
    );
    
    -- Create auth identity
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), client_user_id,
        jsonb_build_object('sub', client_user_id::text, 'email', client_email),
        'email', NOW(), NOW()
    );
    
    -- Create profile
    INSERT INTO profiles (id, email, full_name, role) VALUES
    (client_user_id, client_email, client_name, 'client');
    
    -- Create hotel
    INSERT INTO hotels (id, owner_id, name, status) VALUES
    (hotel_id, client_user_id, hotel_name, 'active');
    
    -- Create subscription
    INSERT INTO subscriptions (hotel_id, plan_id, status) VALUES
    (hotel_id, plan_id, 'trial');
    
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
            'error', SQLERRM,
            'code', 'CREATION_FAILED'
        );
END;
$$;
