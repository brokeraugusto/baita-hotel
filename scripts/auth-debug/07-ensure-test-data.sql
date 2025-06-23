-- Garantir que os dados de teste estão corretos

-- 1. Limpar dados existentes
DELETE FROM user_profiles;

-- 2. Inserir dados de teste com estrutura correta
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url,
    user_role,
    simple_password,
    is_active,
    timezone,
    language,
    preferences,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'admin@baitahotel.com',
    'Master Admin',
    '+55 11 99999-9999',
    '',
    'master_admin',
    'admin123',
    true,
    'America/Sao_Paulo',
    'pt-BR',
    '{}',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'suporte@o2digital.com.br',
    'Suporte O2 Digital',
    '+55 11 88888-8888',
    '',
    'master_admin',
    'LaVi121888!',
    true,
    'America/Sao_Paulo',
    'pt-BR',
    '{}',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'hotel@exemplo.com',
    'João Silva - Hotel Exemplo',
    '+55 11 77777-7777',
    '',
    'hotel_owner',
    'hotel123',
    true,
    'America/Sao_Paulo',
    'pt-BR',
    '{}',
    NOW(),
    NOW()
);

-- 3. Verificar dados inseridos
SELECT 'DADOS INSERIDOS:' as info;
SELECT 
    email,
    full_name,
    user_role,
    simple_password,
    is_active
FROM user_profiles 
ORDER BY user_role DESC, email;

-- 4. Testar cada credencial individualmente
SELECT 'TESTE 1: admin@baitahotel.com / admin123' as teste;
SELECT 
    email,
    full_name,
    user_role
FROM user_profiles 
WHERE email = 'admin@baitahotel.com' 
  AND simple_password = 'admin123'
  AND is_active = true;

SELECT 'TESTE 2: suporte@o2digital.com.br / LaVi121888!' as teste;
SELECT 
    email,
    full_name,
    user_role
FROM user_profiles 
WHERE email = 'suporte@o2digital.com.br' 
  AND simple_password = 'LaVi121888!'
  AND is_active = true;

SELECT 'TESTE 3: hotel@exemplo.com / hotel123' as teste;
SELECT 
    email,
    full_name,
    user_role
FROM user_profiles 
WHERE email = 'hotel@exemplo.com' 
  AND simple_password = 'hotel123'
  AND is_active = true;

SELECT 'DADOS DE TESTE GARANTIDOS!' as resultado;
