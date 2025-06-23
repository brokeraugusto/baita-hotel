-- Diagnóstico completo do sistema de autenticação
SELECT 'Verificando tabelas de usuários' as step;

-- Verificar estrutura da tabela user_profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Verificar usuários existentes
SELECT 
    id,
    email,
    full_name,
    user_role,
    is_active,
    simple_password,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Verificar se existe master admin
SELECT 
    COUNT(*) as master_admin_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_master_admins
FROM user_profiles 
WHERE user_role = 'master_admin';

-- Verificar funções do sistema
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_system_status', 'create_master_admin', 'get_current_user_profile')
ORDER BY routine_name;
