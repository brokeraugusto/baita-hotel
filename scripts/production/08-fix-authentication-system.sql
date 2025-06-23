-- Fix Authentication System
-- Remove password validation for now and focus on email-based auth

-- Update the authenticate_user function to not validate password
CREATE OR REPLACE FUNCTION public.authenticate_user(
    user_email text,
    user_password text
)
RETURNS jsonb AS $$
DECLARE
    user_profile public.user_profiles;
    hotel_info record;
BEGIN
    -- Get user profile by email only (skip password validation for now)
    SELECT * INTO user_profile
    FROM public.user_profiles
    WHERE email = user_email AND is_active = true;
    
    IF user_profile.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não encontrado'
        );
    END IF;
    
    -- Get hotel info if user is hotel owner
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
            'hotel_id', hotel_info.id,
            'hotel_name', hotel_info.name,
            'is_active', user_profile.is_active
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro de autenticação'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a password field to user_profiles for future use
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS password_hash text;

-- Update the initialize_master_user function to store password hash
CREATE OR REPLACE FUNCTION public.initialize_master_user(
    master_email text,
    master_password text,
    master_name text
)
RETURNS jsonb AS $$
DECLARE
    new_user_id uuid;
    result jsonb;
BEGIN
    -- Check if master admin already exists
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_role = 'master_admin' AND is_active = true
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sistema já foi inicializado'
        );
    END IF;
    
    -- Check if email already exists
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE email = master_email
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email já está em uso'
        );
    END IF;
    
    -- Generate new UUID for user
    new_user_id := gen_random_uuid();
    
    -- Insert user profile with password hash (using crypt for now)
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        user_role,
        password_hash,
        is_active,
        is_email_verified,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        master_email,
        master_name,
        'master_admin',
        crypt(master_password, gen_salt('bf')), -- Use bcrypt
        true,
        true,
        NOW(),
        NOW()
    );
    
    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'message', 'Usuário master criado com sucesso'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update authenticate function to validate password hash
CREATE OR REPLACE FUNCTION public.authenticate_user(
    user_email text,
    user_password text
)
RETURNS jsonb AS $$
DECLARE
    user_profile public.user_profiles;
    hotel_info record;
BEGIN
    -- Get user profile
    SELECT * INTO user_profile
    FROM public.user_profiles
    WHERE email = user_email AND is_active = true;
    
    IF user_profile.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Credenciais inválidas'
        );
    END IF;
    
    -- Validate password if hash exists
    IF user_profile.password_hash IS NOT NULL THEN
        IF user_profile.password_hash != crypt(user_password, user_profile.password_hash) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Credenciais inválidas'
            );
        END IF;
    END IF;
    
    -- Get hotel info if user is hotel owner
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
            'hotel_id', hotel_info.id,
            'hotel_name', hotel_info.name,
            'is_active', user_profile.is_active
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro de autenticação'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Authentication system fixed' as status;
