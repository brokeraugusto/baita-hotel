-- Authentication and User Management Functions
-- Secure functions for system initialization and user management

-- Function to check system status
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    master_exists BOOLEAN;
    total_hotels INTEGER;
    total_clients INTEGER;
    total_plans INTEGER;
BEGIN
    -- Check if master admin exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles 
        WHERE user_role = 'master_admin' AND is_active = true
    ) INTO master_exists;
    
    -- Get statistics
    SELECT COUNT(*) INTO total_hotels FROM public.hotels WHERE status != 'cancelled';
    SELECT COUNT(*) INTO total_clients FROM public.user_profiles WHERE user_role = 'hotel_owner';
    SELECT COUNT(*) INTO total_plans FROM public.subscription_plans WHERE is_active = true;
    
    RETURN jsonb_build_object(
        'system_initialized', master_exists,
        'version', '2.0.0',
        'requires_setup', NOT master_exists,
        'statistics', jsonb_build_object(
            'total_hotels', total_hotels,
            'total_clients', total_clients,
            'total_plans', total_plans,
            'master_admin_exists', master_exists
        )
    );
END;
$$;

-- Function to initialize master admin user
CREATE OR REPLACE FUNCTION public.initialize_master_user(
    master_email TEXT,
    master_password TEXT,
    master_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    master_exists BOOLEAN;
BEGIN
    -- Check if master admin already exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles 
        WHERE user_role = 'master_admin'
    ) INTO master_exists;
    
    IF master_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Master admin already exists'
        );
    END IF;
    
    -- Validate input
    IF master_email IS NULL OR master_email = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email is required');
    END IF;
    
    IF master_password IS NULL OR LENGTH(master_password) < 8 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Password must be at least 8 characters');
    END IF;
    
    IF master_name IS NULL OR master_name = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Name is required');
    END IF;
    
    -- Create auth user
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            LOWER(TRIM(master_email)),
            crypt(master_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object('full_name', master_name),
            false,
            'authenticated'
        ) RETURNING id INTO new_user_id;
        
    EXCEPTION WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email already exists'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to create auth user: ' || SQLERRM
        );
    END;
    
    -- Create user profile
    BEGIN
        INSERT INTO public.user_profiles (
            id,
            email,
            full_name,
            user_role,
            is_active,
            is_email_verified
        ) VALUES (
            new_user_id,
            LOWER(TRIM(master_email)),
            TRIM(master_name),
            'master_admin',
            true,
            true
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- Rollback auth user creation
        DELETE FROM auth.users WHERE id = new_user_id;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to create user profile: ' || SQLERRM
        );
    END;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'message', 'Master admin created successfully'
    );
END;
$$;

-- Function to create client user with hotel
CREATE OR REPLACE FUNCTION public.create_client_user(
    client_email TEXT,
    client_password TEXT,
    client_name TEXT,
    hotel_name TEXT,
    plan_slug TEXT DEFAULT 'starter'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    new_hotel_id UUID;
    new_subscription_id UUID;
    selected_plan_id UUID;
    current_user_role user_role_enum;
BEGIN
    -- Check if current user is master admin
    SELECT user_role INTO current_user_role 
    FROM public.user_profiles 
    WHERE id = auth.uid();
    
    IF current_user_role != 'master_admin' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only master admin can create client users'
        );
    END IF;
    
    -- Validate input
    IF client_email IS NULL OR client_email = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email is required');
    END IF;
    
    IF client_password IS NULL OR LENGTH(client_password) < 8 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Password must be at least 8 characters');
    END IF;
    
    IF client_name IS NULL OR client_name = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Name is required');
    END IF;
    
    IF hotel_name IS NULL OR hotel_name = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Hotel name is required');
    END IF;
    
    -- Get plan ID
    SELECT id INTO selected_plan_id 
    FROM public.subscription_plans 
    WHERE slug = plan_slug AND is_active = true;
    
    IF selected_plan_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid plan selected');
    END IF;
    
    -- Create auth user
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            LOWER(TRIM(client_email)),
            crypt(client_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object('full_name', client_name),
            false,
            'authenticated'
        ) RETURNING id INTO new_user_id;
        
    EXCEPTION WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Email already exists'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to create auth user: ' || SQLERRM
        );
    END;
    
    -- Create user profile
    BEGIN
        INSERT INTO public.user_profiles (
            id,
            email,
            full_name,
            user_role,
            is_active,
            is_email_verified
        ) VALUES (
            new_user_id,
            LOWER(TRIM(client_email)),
            TRIM(client_name),
            'hotel_owner',
            true,
            true
        );
        
    EXCEPTION WHEN OTHERS THEN
        DELETE FROM auth.users WHERE id = new_user_id;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to create user profile: ' || SQLERRM
        );
    END;
    
    -- Create hotel
    BEGIN
        INSERT INTO public.hotels (
            owner_id,
            name,
            slug,
            status
        ) VALUES (
            new_user_id,
            TRIM(hotel_name),
            LOWER(REPLACE(TRIM(hotel_name), ' ', '-')),
            'pending_setup'
        ) RETURNING id INTO new_hotel_id;
        
    EXCEPTION WHEN OTHERS THEN
        DELETE FROM public.user_profiles WHERE id = new_user_id;
        DELETE FROM auth.users WHERE id = new_user_id;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to create hotel: ' || SQLERRM
        );
    END;
    
    -- Create subscription
    BEGIN
        INSERT INTO public.subscriptions (
            hotel_id,
            plan_id,
            status,
            billing_cycle,
            current_price,
            trial_ends_at,
            current_period_start,
            current_period_end
        ) VALUES (
            new_hotel_id,
            selected_plan_id,
            'trial',
            'monthly',
            (SELECT price_monthly FROM public.subscription_plans WHERE id = selected_plan_id),
            NOW() + INTERVAL '30 days',
            NOW(),
            NOW() + INTERVAL '30 days'
        ) RETURNING id INTO new_subscription_id;
        
    EXCEPTION WHEN OTHERS THEN
        DELETE FROM public.hotels WHERE id = new_hotel_id;
        DELETE FROM public.user_profiles WHERE id = new_user_id;
        DELETE FROM auth.users WHERE id = new_user_id;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Failed to create subscription: ' || SQLERRM
        );
    END;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'hotel_id', new_hotel_id,
        'subscription_id', new_subscription_id,
        'message', 'Client user created successfully'
    );
END;
$$;

-- Function to handle new user registration (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only create profile if it doesn't exist and user is not created by our functions
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = NEW.id) THEN
        INSERT INTO public.user_profiles (
            id,
            email,
            full_name,
            user_role,
            is_active,
            is_email_verified
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
            'hotel_owner',
            true,
            NEW.email_confirmed_at IS NOT NULL
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Auth functions created successfully' as status;
