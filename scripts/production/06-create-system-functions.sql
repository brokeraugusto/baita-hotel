-- System Management Functions
-- Functions for system initialization and management

-- Function to get system status
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS jsonb AS $$
DECLARE
    master_count integer;
    plans_count integer;
    system_status jsonb;
BEGIN
    -- Count master admin users
    SELECT COUNT(*) INTO master_count
    FROM public.user_profiles
    WHERE user_role = 'master_admin' AND is_active = true;
    
    -- Count subscription plans
    SELECT COUNT(*) INTO plans_count
    FROM public.subscription_plans
    WHERE is_active = true;
    
    -- Build status object
    system_status := jsonb_build_object(
        'system_initialized', master_count > 0,
        'requires_setup', master_count = 0,
        'has_master_admin', master_count > 0,
        'master_admin_count', master_count,
        'subscription_plans_count', plans_count,
        'database_ready', true,
        'version', '2.0.0',
        'setup_required', master_count = 0
    );
    
    RETURN system_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize master user
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
    
    -- Insert user profile directly (bypassing auth.users for now)
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        user_role,
        is_active,
        is_email_verified,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        master_email,
        master_name,
        'master_admin',
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

-- Function to create client user
CREATE OR REPLACE FUNCTION public.create_client_user(
    client_email text,
    client_password text,
    client_name text,
    hotel_name text,
    plan_slug text DEFAULT 'starter'
)
RETURNS jsonb AS $$
DECLARE
    new_user_id uuid;
    new_hotel_id uuid;
    plan_id uuid;
    result jsonb;
BEGIN
    -- Check if user is master admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND user_role = 'master_admin' AND is_active = true
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Acesso negado: apenas administradores master podem criar clientes'
        );
    END IF;
    
    -- Check if email already exists
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE email = client_email
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email já está em uso'
        );
    END IF;
    
    -- Get plan ID
    SELECT id INTO plan_id
    FROM public.subscription_plans
    WHERE slug = plan_slug AND is_active = true;
    
    IF plan_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Plano de assinatura não encontrado'
        );
    END IF;
    
    -- Generate UUIDs
    new_user_id := gen_random_uuid();
    new_hotel_id := gen_random_uuid();
    
    -- Insert user profile
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        user_role,
        is_active,
        is_email_verified,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        client_email,
        client_name,
        'hotel_owner',
        true,
        true,
        NOW(),
        NOW()
    );
    
    -- Insert hotel
    INSERT INTO public.hotels (
        id,
        owner_id,
        name,
        slug,
        status,
        created_at,
        updated_at
    ) VALUES (
        new_hotel_id,
        new_user_id,
        hotel_name,
        public.generate_hotel_slug(hotel_name),
        'active',
        NOW(),
        NOW()
    );
    
    -- Create subscription
    INSERT INTO public.subscriptions (
        hotel_id,
        plan_id,
        status,
        current_price,
        trial_ends_at,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
    ) VALUES (
        new_hotel_id,
        plan_id,
        'trial',
        (SELECT price_monthly FROM public.subscription_plans WHERE id = plan_id),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW()
    );
    
    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'hotel_id', new_hotel_id,
        'message', 'Cliente criado com sucesso'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user (simple version)
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

SELECT 'System functions created successfully' as status;
