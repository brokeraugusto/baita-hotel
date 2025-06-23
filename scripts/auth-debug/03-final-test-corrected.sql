-- Teste final completo do sistema de autenticação (CORRIGIDO)

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

-- 2. Testar credenciais individualmente
SELECT 'TESTE 1: admin@baitahotel.com / admin123' as teste;
DO $$
DECLARE
    result_record RECORD;
BEGIN
    SELECT * INTO result_record FROM verify_user_credentials('admin@baitahotel.com', 'admin123');
    
    IF result_record.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ CREDENCIAIS VÁLIDAS - ID: %, Email: %, Nome: %, Role: %', 
            result_record.user_id, result_record.email, result_record.full_name, result_record.user_role;
    ELSE
        RAISE NOTICE '❌ CREDENCIAIS INVÁLIDAS';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO NO TESTE: %', SQLERRM;
END $$;

SELECT 'TESTE 2: admin@baitahotel.com / masteradmin123' as teste;
DO $$
DECLARE
    result_record RECORD;
BEGIN
    SELECT * INTO result_record FROM verify_user_credentials('admin@baitahotel.com', 'masteradmin123');
    
    IF result_record.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ CREDENCIAIS VÁLIDAS - ID: %, Email: %, Nome: %, Role: %', 
            result_record.user_id, result_record.email, result_record.full_name, result_record.user_role;
    ELSE
        RAISE NOTICE '❌ CREDENCIAIS INVÁLIDAS';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO NO TESTE: %', SQLERRM;
END $$;

SELECT 'TESTE 3: suporte@o2digital.com.br / LaVi121888!' as teste;
DO $$
DECLARE
    result_record RECORD;
BEGIN
    SELECT * INTO result_record FROM verify_user_credentials('suporte@o2digital.com.br', 'LaVi121888!');
    
    IF result_record.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ CREDENCIAIS VÁLIDAS - ID: %, Email: %, Nome: %, Role: %', 
            result_record.user_id, result_record.email, result_record.full_name, result_record.user_role;
    ELSE
        RAISE NOTICE '❌ CREDENCIAIS INVÁLIDAS';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO NO TESTE: %', SQLERRM;
END $$;

-- 3. Teste simples das funções
SELECT 'TESTE DIRETO DAS CREDENCIAIS:' as info;

-- Teste 1
SELECT 
    'admin@baitahotel.com / admin123' as credenciais,
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('admin@baitahotel.com', 'admin123')
LIMIT 1;

-- Teste 2  
SELECT 
    'suporte@o2digital.com.br / LaVi121888!' as credenciais,
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('suporte@o2digital.com.br', 'LaVi121888!')
LIMIT 1;

-- Teste 3
SELECT 
    'hotel@exemplo.com / hotel123' as credenciais,
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('hotel@exemplo.com', 'hotel123')
LIMIT 1;

-- 4. Verificar função get_user_profile
SELECT 'TESTE DE get_user_profile:' as info;
SELECT 
    id,
    email,
    full_name,
    user_role
FROM get_user_profile((SELECT id FROM user_profiles WHERE email = 'admin@baitahotel.com' LIMIT 1))
LIMIT 1;

-- 5. Resumo final
SELECT 'RESUMO FINAL:' as info;
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN user_role = 'master_admin' THEN 1 END) as master_admins,
    COUNT(CASE WHEN user_role = 'hotel_owner' THEN 1 END) as hotel_owners,
    COUNT(CASE WHEN is_active = true THEN 1 END) as usuarios_ativos
FROM user_profiles;

-- 6. Verificar se as funções existem
SELECT 'FUNÇÕES DISPONÍVEIS:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('verify_user_credentials', 'get_user_profile', 'update_last_login')
ORDER BY routine_name;
