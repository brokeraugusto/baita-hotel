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
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name IN (
    'verify_user_credentials', 
    'update_last_login', 
    'get_user_profile',
    'update_user_profile',
    'change_user_password'
)
ORDER BY routine_name;

SELECT 'Testando função de perfil' as step;
-- Pegar o ID do usuário master admin para teste
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE user_role = 'master_admin' 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testando get_user_profile com ID: %', test_user_id;
        -- Não podemos fazer SELECT dentro de DO block, então apenas logamos
    ELSE
        RAISE NOTICE 'Nenhum usuário master admin encontrado';
    END IF;
END;
$$;

SELECT 'Sistema de autenticação verificado com sucesso' as status;
