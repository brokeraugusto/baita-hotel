-- Create a special function for system setup that bypasses RLS
-- This function runs with SECURITY DEFINER to bypass RLS

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
    
    -- Generate new UUID
    new_user_id := gen_random_uuid();
    
    -- Insert master admin (this bypasses RLS due to SECURITY DEFINER)
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        user_role,
        simple_password,
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
        admin_password,
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

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.create_master_admin(text, text, text) TO service_role;

-- Create function to check system status
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    plans_count int;
    master_admin_exists boolean;
    hotel_count int;
    client_count int;
BEGIN
    -- Count subscription plans
    SELECT COUNT(*) INTO plans_count
    FROM public.subscription_plans;
    
    -- Check if master admin exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles
        WHERE user_role = 'master_admin' AND is_active = true
    ) INTO master_admin_exists;
    
    -- Count hotels
    SELECT COUNT(*) INTO hotel_count
    FROM public.hotels;
    
    -- Count clients
    SELECT COUNT(*) INTO client_count
    FROM public.user_profiles
    WHERE user_role = 'hotel_owner';
    
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

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.get_system_status() TO service_role;

SELECT 'System setup functions created successfully' as status;
