-- Diagnóstico completo do sistema de autenticação

-- 1. Verificar todas as tabelas de usuários existentes
SELECT 'Tabelas relacionadas a usuários:' as info;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'profiles', 'users', 'auth_users')
ORDER BY table_name, ordinal_position;

-- 2. Verificar dados em user_profiles
SELECT 'Dados em user_profiles:' as info;
SELECT 
    id,
    email,
    full_name,
    user_role,
    simple_password,
    is_active,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 3. Verificar se existe tabela profiles (do Supabase)
SELECT 'Dados em profiles (se existir):' as info;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles existe';
        PERFORM * FROM profiles LIMIT 1;
    ELSE
        RAISE NOTICE 'Tabela profiles não existe';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao verificar profiles: %', SQLERRM;
END $$;

-- 4. Testar função de verificação de credenciais
SELECT 'Testando credenciais admin@baitahotel.com com admin123:' as info;
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

SELECT 'Testando credenciais admin@baitahotel.com com masteradmin123:' as info;
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'masteradmin123');

SELECT 'Testando credenciais suporte@o2digital.com.br com LaVi121888!:' as info;
SELECT * FROM verify_user_credentials('suporte@o2digital.com.br', 'LaVi121888!');

-- 5. Verificar funções existentes
SELECT 'Funções de autenticação existentes:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' OR routine_name LIKE '%auth%' OR routine_name LIKE '%verify%'
ORDER BY routine_name;
