-- Verificar se o usuário existe e está ativo
SELECT 
    'User Check' as test_name,
    id,
    email,
    full_name,
    user_role,
    is_active
FROM user_profiles 
WHERE email = 'admin@baitahotel.com';

-- Testar função de login
SELECT 
    'Login Test' as test_name,
    *
FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

-- Verificar estrutura da tabela
SELECT 
    'Table Structure' as test_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
