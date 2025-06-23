-- Verificação simples do sistema

SELECT 'Verificando usuários criados:' as step;
SELECT 
    email,
    full_name,
    user_role,
    simple_password,
    is_active,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

SELECT 'Verificando funções criadas:' as step;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN (
    'verify_user_credentials', 
    'update_last_login', 
    'get_user_profile',
    'update_user_profile',
    'change_user_password'
)
AND routine_schema = 'public'
ORDER BY routine_name;

SELECT 'Teste rápido de login:' as step;
SELECT 
    user_id,
    email,
    full_name,
    user_role
FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

SELECT 'Sistema pronto para uso!' as status;
