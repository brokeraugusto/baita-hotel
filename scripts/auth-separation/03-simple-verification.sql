-- Verificação simples do sistema

-- Verificar tabelas
SELECT 
    'master_admins' as tabela,
    COUNT(*) as registros
FROM master_admins
UNION ALL
SELECT 
    'hotels' as tabela,
    COUNT(*) as registros
FROM hotels;

-- Verificar Master Admins
SELECT 
    id,
    email,
    full_name,
    is_active,
    created_at
FROM master_admins
ORDER BY created_at DESC;

-- Testar função
SELECT has_master_admin() as tem_master_admin;

-- Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('master_admins', 'hotels')
ORDER BY table_name, ordinal_position;
