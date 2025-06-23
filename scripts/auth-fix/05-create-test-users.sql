-- Criar usuários de teste

-- Limpar usuários existentes se necessário
DELETE FROM user_profiles WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

-- Criar master admin de teste
INSERT INTO user_profiles (
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
    gen_random_uuid(),
    'admin@baitahotel.com',
    'Master Admin',
    'master_admin',
    'admin123',
    true,
    true,
    'America/Sao_Paulo',
    'pt-BR',
    '{"theme": "light", "notifications": true}',
    NOW(),
    NOW()
);

-- Criar usuário hotel de teste
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    phone,
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
    gen_random_uuid(),
    'hotel@exemplo.com',
    'João Silva - Hotel Exemplo',
    '(11) 99999-9999',
    'hotel_owner',
    'hotel123',
    true,
    true,
    'America/Sao_Paulo',
    'pt-BR',
    '{"theme": "light", "notifications": true}',
    NOW(),
    NOW()
);

SELECT 'Usuários de teste criados:' as info;
SELECT 
    email,
    full_name,
    user_role,
    simple_password as senha_teste,
    is_active
FROM user_profiles 
WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
ORDER BY user_role DESC;
