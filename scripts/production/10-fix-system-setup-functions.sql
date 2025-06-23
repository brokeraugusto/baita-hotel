-- Fix System Setup Functions
-- Ensure they work correctly with the actual database schema

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS public.create_master_admin(text, text, text);
DROP FUNCTION IF EXISTS public.initialize_master_user(text, text, text);
DROP FUNCTION IF EXISTS public.get_system_status();

-- Create improved system status function
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    plans_count int := 0;
    master_admin_exists boolean := false;
    hotel_count int := 0;
    client_count int := 0;
BEGIN
    -- Count subscription plans
    SELECT COUNT(*) INTO plans_count
    FROM public.subscription_plans
    WHERE is_active = true;
    
    -- Check if master admin exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles
        WHERE user_role = 'master_admin' AND is_active = true
    ) INTO master_admin_exists;
    
    -- Count hotels
    SELECT COUNT(*) INTO hotel_count
    FROM public.hotels;
    
    -- Count clients (hotel owners)
    SELECT COUNT(*) INTO client_count
    FROM public.user_profiles
    WHERE user_role = 'hotel_owner' AND is_active = true;
    
    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'system_initialized', master_admin_exists AND plans_count > 0,
            'database_ready', true,
            'has_master_admin', master_admin_exists,
            'subscription_plans_count', plans_count,
            'version', '2.0.0',
            'requires_setup', NOT master_admin_exists,
            'statistics', jsonb_build_object(
                'total_hotels', hotel_count,
                'total_clients', client_count,
                'master_admin_exists', master_admin_exists
            )
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro ao verificar status do sistema: ' || SQLERRM
    );
END;
$$;

-- Create improved master admin creation function
CREATE OR REPLACE FUNCTION public.create_master_admin(
    admin_email text,
    admin_password text,
    admin_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id uuid;
    existing_admin_count int;
    password_hash_value text;
BEGIN
    -- Check if master admin already exists
    SELECT COUNT(*) INTO existing_admin_count
    FROM public.user_profiles
    WHERE user_role = 'master_admin' AND is_active = true;
    
    IF existing_admin_count > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Master admin já existe no sistema'
        );
    END IF;
    
    -- Check if email already exists
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE LOWER(email) = LOWER(TRIM(admin_email))
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email já está em uso'
        );
    END IF;
    
    -- Generate new UUID
    new_user_id := gen_random_uuid();
    
    -- Create password hash
    password_hash_value := crypt(admin_password, gen_salt('bf'));
    
    -- Insert master admin
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        user_role,
        password_hash,
        simple_password, -- Also store simple password for compatibility
        is_active,
        is_email_verified,
        timezone,
        language,
        preferences,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        LOWER(TRIM(admin_email)),
        TRIM(admin_name),
        'master_admin',
        password_hash_value,
        admin_password, -- Store simple password too
        true,
        true,
        'America/Sao_Paulo',
        'pt-BR',
        '{}',
        NOW(),
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'message', 'Master admin criado com sucesso'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro ao criar master admin: ' || SQLERRM
    );
END;
$$;

-- Create improved authentication function
CREATE OR REPLACE FUNCTION public.authenticate_user(
    user_email text,
    user_password text
)
RETURNS jsonb AS $$
DECLARE
    user_profile public.user_profiles;
    hotel_info record;
    password_valid boolean := false;
BEGIN
    -- Get user profile
    SELECT * INTO user_profile
    FROM public.user_profiles
    WHERE LOWER(email) = LOWER(TRIM(user_email)) AND is_active = true;
    
    IF user_profile.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email não encontrado'
        );
    END IF;
    
    -- Check password (try both methods for compatibility)
    IF user_profile.password_hash IS NOT NULL THEN
        -- Check bcrypt hash
        password_valid := (user_profile.password_hash = crypt(user_password, user_profile.password_hash));
    END IF;
    
    -- Also check simple password if hash validation failed
    IF NOT password_valid AND user_profile.simple_password IS NOT NULL THEN
        password_valid := (user_profile.simple_password = user_password);
    END IF;
    
    -- If no password validation method worked, reject
    IF NOT password_valid THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Senha incorreta'
        );
    END IF;
    
    -- Get hotel info if user is hotel owner
    hotel_info := NULL;
    IF user_profile.user_role = 'hotel_owner' THEN
        SELECT id, name INTO hotel_info
        FROM public.hotels
        WHERE owner_id = user_profile.id
        LIMIT 1;
    END IF;
    
    -- Return user data
    RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
            'id', user_profile.id,
            'email', user_profile.email,
            'full_name', user_profile.full_name,
            'user_role', user_profile.user_role,
            'hotel_id', COALESCE(hotel_info.id, null),
            'hotel_name', COALESCE(hotel_info.name, null),
            'is_active', user_profile.is_active
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro de autenticação: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_master_admin(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_system_status() TO service_role;
GRANT EXECUTE ON FUNCTION public.authenticate_user(text, text) TO service_role;

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

SELECT 'System setup functions fixed and recreated' as status;
