-- Reset completo do sistema de autenticação

-- 1. Limpar dados existentes
TRUNCATE TABLE user_profiles CASCADE;

-- 2. Recriar usuários com credenciais corretas
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
) VALUES 
-- Master Admin com senha admin123
(
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
),
-- Usuário do system setup
(
    gen_random_uuid(),
    'suporte@o2digital.com.br',
    'Suporte O2 Digital',
    'master_admin',
    'LaVi121888!',
    true,
    true,
    'America/Sao_Paulo',
    'pt-BR',
    '{"theme": "light", "notifications": true}',
    NOW(),
    NOW()
),
-- Hotel owner de teste
(
    gen_random_uuid(),
    'hotel@exemplo.com',
    'João Silva - Hotel Exemplo',
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

-- 3. Verificar usuários criados
SELECT 'Usuários criados com sucesso:' as info;
SELECT 
    email,
    full_name,
    user_role,
    simple_password as senha,
    is_active
FROM user_profiles 
ORDER BY user_role DESC, email;

-- 4. Testar todas as credenciais
SELECT 'Teste 1 - admin@baitahotel.com / admin123:' as teste;
SELECT user_id, email, full_name, user_role FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

SELECT 'Teste 2 - suporte@o2digital.com.br / LaVi121888!:' as teste;
SELECT user_id, email, full_name, user_role FROM verify_user_credentials('suporte@o2digital.com.br', 'LaVi121888!');

SELECT 'Teste 3 - hotel@exemplo.com / hotel123:' as teste;
SELECT user_id, email, full_name, user_role FROM verify_user_credentials('hotel@exemplo.com', 'hotel123');
