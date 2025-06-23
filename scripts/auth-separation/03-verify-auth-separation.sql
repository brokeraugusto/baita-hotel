-- Verificar separação do sistema de autenticação

-- 1. Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('master_admins', 'hotels')
ORDER BY table_name, ordinal_position;

-- 2. Verificar Master Admins
SELECT 
    'Master Admins' as type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_active = true) as active
FROM master_admins
UNION ALL
SELECT 
    'Hotels' as type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_active = true) as active
FROM hotels;

-- 3. Verificar funções
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('has_master_admin', 'create_first_master_admin');

-- 4. Testar função has_master_admin
SELECT has_master_admin() as has_admin;

-- 5. Verificar Master Admin ativo
SELECT 
    id,
    email,
    full_name,
    is_active,
    created_at,
    last_login_at
FROM master_admins 
WHERE is_active = true;

-- 6. Status do sistema
SELECT 
    CASE 
        WHEN has_master_admin() THEN '✅ Sistema configurado - Master Admin existe'
        ELSE '⚠️ Sistema não configurado - Nenhum Master Admin encontrado'
    END as system_status;
