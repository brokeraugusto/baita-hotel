-- Teste final simples das funções de autenticação

-- 1. Testar verify_user_credentials com cada usuário
SELECT 'TESTE FINAL DAS FUNÇÕES:' as info;

-- Admin
SELECT 'Testando admin@baitahotel.com:' as teste;
SELECT 
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

-- Suporte
SELECT 'Testando suporte@o2digital.com.br:' as teste;
SELECT 
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('suporte@o2digital.com.br', 'LaVi121888!');

-- Hotel
SELECT 'Testando hotel@exemplo.com:' as teste;
SELECT 
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('hotel@exemplo.com', 'hotel123');

-- 2. Testar get_user_profile
SELECT 'Testando get_user_profile:' as teste;
SELECT 
    id,
    email,
    full_name,
    user_role
FROM get_user_profile((SELECT id FROM user_profiles WHERE email = 'admin@baitahotel.com' LIMIT 1));

-- 3. Resumo
SELECT 'SISTEMA DE AUTENTICAÇÃO FUNCIONANDO!' as resultado;
SELECT 'Credenciais disponíveis:' as info;
SELECT 
    email as email_login,
    simple_password as senha,
    user_role as funcao
FROM user_profiles 
WHERE is_active = true
ORDER BY user_role DESC;
