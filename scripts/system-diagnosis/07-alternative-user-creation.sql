-- Alternative approach using Supabase functions
-- This approach is safer and more compatible

-- First, let's create a function to safely create test users
CREATE OR REPLACE FUNCTION create_test_user(
    user_email TEXT,
    user_password TEXT,
    user_full_name TEXT,
    user_role user_role,
    user_hotel_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    new_user_id UUID;
    result_message TEXT;
BEGIN
    -- Generate a consistent UUID based on email
    IF user_email = 'admin@baitahotel.com' THEN
        new_user_id := '11111111-1111-1111-1111-111111111111';
    ELSIF user_email = 'hotel@exemplo.com' THEN
        new_user_id := '22222222-2222-2222-2222-222222222222';
    ELSE
        new_user_id := gen_random_uuid();
    END IF;

    -- Delete existing user if exists
    DELETE FROM profiles WHERE email = user_email;
    DELETE FROM auth.identities WHERE provider_id = user_email;
    DELETE FROM auth.users WHERE email = user_email;

    -- Insert into auth.users
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
        role,
        aud
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        user_email,
        crypt(user_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', user_full_name),
        'authenticated',
        'authenticated'
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (
        provider_id,
        user_id,
        identity_data,
        provider,
        created_at,
        updated_at
    ) VALUES (
        user_email,
        new_user_id,
        jsonb_build_object(
            'sub', new_user_id::text,
            'email', user_email,
            'email_verified', true
        ),
        'email',
        NOW(),
        NOW()
    );

    -- Insert into profiles
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role,
        hotel_id
    ) VALUES (
        new_user_id,
        user_email,
        user_full_name,
        user_role,
        user_hotel_id
    );

    result_message := 'User ' || user_email || ' created successfully with ID ' || new_user_id;
    RETURN result_message;

EXCEPTION WHEN OTHERS THEN
    result_message := 'Error creating user ' || user_email || ': ' || SQLERRM;
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Create the test users using the function
SELECT create_test_user(
    'admin@baitahotel.com',
    'admin123',
    'Administrador Master',
    'master_admin'::user_role,
    NULL
) as admin_result;

SELECT create_test_user(
    'hotel@exemplo.com',
    'hotel123',
    'Gerente do Hotel',
    'client'::user_role,
    '550e8400-e29b-41d4-a716-446655440000'
) as client_result;

-- Verify the creation
SELECT 'Final verification' as check_type;
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.full_name,
    p.role,
    h.name as hotel_name
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN hotels h ON p.hotel_id = h.id
WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
ORDER BY u.email;

-- Clean up the function
DROP FUNCTION IF EXISTS create_test_user;
