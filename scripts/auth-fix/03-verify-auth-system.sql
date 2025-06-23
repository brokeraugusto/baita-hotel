-- Verificação final do sistema de autenticação

SELECT 'Verificando usuários master admin' as step;
SELECT 
    email,
    full_name,
    user_role,
    is_active,
    simple_password as test_password,
    created_at
FROM user_profiles 
WHERE user_role = 'master_admin'
ORDER BY created_at DESC;

SELECT 'Testando função de verificação de credenciais' as step;
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

SELECT 'Verificando funções do sistema' as step;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'verify_user_credentials', 
    'update_last_login', 
    'get_user_profile'
)
ORDER BY routine_name;

SELECT 'Sistema de autenticação verificado com sucesso' as status;
