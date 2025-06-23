-- Teste final completo do sistema de autenticação

-- 1. Verificar usuários existentes
SELECT 'USUÁRIOS CADASTRADOS:' as info;
SELECT 
    email,
    full_name,
    user_role,
    simple_password as senha,
    is_active,
    created_at
FROM user_profiles 
ORDER BY user_role DESC, email;

-- 2. Testar todas as credenciais mencionadas
SELECT 'TESTE 1: admin@baitahotel.com / admin123' as teste;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CREDENCIAIS VÁLIDAS'
        ELSE '❌ CREDENCIAIS INVÁLIDAS'
    END as resultado,
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

SELECT 'TESTE 2: admin@baitahotel.com / masteradmin123' as teste;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CREDENCIAIS VÁLIDAS'
        ELSE '❌ CREDENCIAIS INVÁLIDAS'
    END as resultado,
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('admin@baitahotel.com', 'masteradmin123');

SELECT 'TESTE 3: suporte@o2digital.com.br / LaVi121888!' as teste;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CREDENCIAIS VÁLIDAS'
        ELSE '❌ CREDENCIAIS INVÁLIDAS'
    END as resultado,
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('suporte@o2digital.com.br', 'LaVi121888!');

-- 3. Verificar função get_user_profile
SELECT 'TESTE DE get_user_profile:' as info;
SELECT 
    id,
    email,
    full_name,
    user_role
FROM get_user_profile((SELECT id FROM user_profiles WHERE email = 'admin@baitahotel.com' LIMIT 1));

-- 4. Resumo final
SELECT 'RESUMO FINAL:' as info;
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN user_role = 'master_admin' THEN 1 END) as master_admins,
    COUNT(CASE WHEN user_role = 'hotel_owner' THEN 1 END) as hotel_owners,
    COUNT(CASE WHEN is_active = true THEN 1 END) as usuarios_ativos
FROM user_profiles;
