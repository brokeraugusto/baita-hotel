-- Insert test users for development and testing
-- This will create proper test accounts

-- 1. Insert master admin user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@baitahotel.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert client user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'hotel@exemplo.com',
    crypt('hotel123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- 3. Create hotel for client
INSERT INTO hotels (
    id,
    name,
    email,
    phone,
    address,
    city,
    state,
    rooms_count,
    plan,
    status,
    owner_id
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Hotel Exemplo',
    'hotel@exemplo.com',
    '(11) 99999-9999',
    'Rua das Flores, 123',
    'São Paulo',
    'SP',
    50,
    'professional',
    'active',
    '00000000-0000-0000-0000-000000000002'
) ON CONFLICT (id) DO NOTHING;

-- 4. Create profiles for both users
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    hotel_id,
    hotel_name,
    phone,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@baitahotel.com',
    'Master Administrator',
    'master_admin',
    NULL,
    NULL,
    NULL,
    true
), (
    '00000000-0000-0000-0000-000000000002',
    'hotel@exemplo.com',
    'João Silva',
    'client',
    '11111111-1111-1111-1111-111111111111',
    'Hotel Exemplo',
    '(11) 99999-9999',
    true
) ON CONFLICT (id) DO NOTHING;
