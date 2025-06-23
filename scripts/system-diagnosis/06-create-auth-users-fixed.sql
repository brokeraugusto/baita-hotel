-- Create auth users for testing (Fixed version)
-- This handles the correct Supabase auth schema

-- First, let's check the current auth schema
SELECT 'Checking auth.identities schema' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'identities'
ORDER BY ordinal_position;

-- Clean up existing test users
DELETE FROM auth.identities WHERE provider_id IN ('admin@baitahotel.com', 'hotel@exemplo.com');
DELETE FROM auth.users WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');
DELETE FROM profiles WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

-- Create auth users with proper schema
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
    role,
    aud
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@baitahotel.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador Master"}',
    false,
    'authenticated',
    'authenticated'
),
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'hotel@exemplo.com',
    crypt('hotel123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Gerente do Hotel"}',
    false,
    'authenticated',
    'authenticated'
);

-- Create corresponding identities with proper provider_id
INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at
) VALUES 
(
    'admin@baitahotel.com',
    '11111111-1111-1111-1111-111111111111',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "admin@baitahotel.com", "email_verified": true}',
    'email',
    NOW(),
    NOW()
),
(
    'hotel@exemplo.com',
    '22222222-2222-2222-2222-222222222222',
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "hotel@exemplo.com", "email_verified": true}',
    'email',
    NOW(),
    NOW()
);

-- Create the profiles
INSERT INTO profiles (id, email, full_name, role, hotel_id) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'admin@baitahotel.com',
    'Administrador Master',
    'master_admin',
    NULL
),
(
    '22222222-2222-2222-2222-222222222222',
    'hotel@exemplo.com',
    'Gerente do Hotel',
    'client',
    '550e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    hotel_id = EXCLUDED.hotel_id;

-- Verify the complete setup
SELECT 'Auth users verification' as check_type;
SELECT u.id, u.email, u.created_at, u.email_confirmed_at IS NOT NULL as email_confirmed, u.role
FROM auth.users u
WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
ORDER BY u.email;

SELECT 'Identities verification' as check_type;
SELECT i.provider_id, i.user_id, i.provider, i.identity_data->>'email' as email
FROM auth.identities i
WHERE i.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')
ORDER BY i.provider_id;

SELECT 'Profiles verification' as check_type;
SELECT p.id, p.email, p.full_name, p.role, h.name as hotel_name
FROM profiles p
LEFT JOIN hotels h ON p.hotel_id = h.id
WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
ORDER BY p.email;

-- Test password verification
SELECT 'Password verification test' as check_type;
SELECT 
    email,
    CASE 
        WHEN encrypted_password = crypt('admin123', encrypted_password) THEN 'Password OK'
        ELSE 'Password FAIL'
    END as password_check
FROM auth.users 
WHERE email = 'admin@baitahotel.com';

SELECT 
    email,
    CASE 
        WHEN encrypted_password = crypt('hotel123', encrypted_password) THEN 'Password OK'
        ELSE 'Password FAIL'
    END as password_check
FROM auth.users 
WHERE email = 'hotel@exemplo.com';
