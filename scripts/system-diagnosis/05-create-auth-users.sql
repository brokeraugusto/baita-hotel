-- Create auth users for testing
-- Note: This approach creates users directly in auth.users table
-- In production, users would be created through Supabase Auth API

-- First, let's check if the users already exist
SELECT 'Checking existing auth users' as info;
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

-- Delete existing test users if they exist (to start fresh)
DELETE FROM auth.users WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');
DELETE FROM profiles WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

-- Create auth users with proper password hashing
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
    'authenticated'
);

-- Create corresponding identities
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "admin@baitahotel.com"}',
    'email',
    NOW(),
    NOW()
),
(
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub": "22222222-2222-2222-2222-222222222222", "email": "hotel@exemplo.com"}',
    'email',
    NOW(),
    NOW()
);

-- Now create the profiles (this will work because the trigger will handle it)
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

-- Verify the setup
SELECT 'Auth users verification' as check_type;
SELECT u.id, u.email, u.created_at, u.email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users u
WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

SELECT 'Profiles verification' as check_type;
SELECT p.id, p.email, p.full_name, p.role, h.name as hotel_name
FROM profiles p
LEFT JOIN hotels h ON p.hotel_id = h.id
WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

SELECT 'Identities verification' as check_type;
SELECT i.user_id, i.provider, i.identity_data->>'email' as email
FROM auth.identities i
WHERE i.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
