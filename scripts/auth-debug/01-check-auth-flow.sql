-- Verificar se o usuário master admin existe e está ativo
SELECT 
    id,
    email,
    full_name,
    user_role,
    is_active,
    created_at
FROM user_profiles 
WHERE email = 'admin@baitahotel.com';

-- Testar a função de verificação de credenciais
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'admin123');
