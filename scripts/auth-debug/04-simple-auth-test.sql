-- Teste simples do sistema de autenticação

-- 1. Verificar usuários na tabela
SELECT 'Usuários na tabela user_profiles:' as info;
SELECT email, user_role, simple_password, is_active FROM user_profiles;

-- 2. Testar função verify_user_credentials diretamente
SELECT 'Testando verify_user_credentials com admin@baitahotel.com / admin123:' as teste;
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

-- 3. Verificar se a função retorna dados
SELECT 'Verificando retorno da função:' as info;
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM verify_user_credentials('admin@baitahotel.com', 'admin123')) 
        THEN 'Função retorna dados' 
        ELSE 'Função não retorna dados' 
    END as resultado;

-- 4. Teste manual da lógica da função
SELECT 'Teste manual da lógica:' as info;
SELECT 
    id as user_id,
    email,
    full_name,
    user_role,
    is_active
FROM user_profiles 
WHERE email = 'admin@baitahotel.com' 
  AND simple_password = 'admin123' 
  AND is_active = true;

-- 5. Verificar estrutura da função
SELECT 'Estrutura da função verify_user_credentials:' as info;
SELECT 
    routine_name,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'verify_user_credentials';
