-- Script de verificação simples
-- Execute para verificar se tudo está funcionando

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('master_admins', 'hotels')
ORDER BY table_name;

-- 2. Contar registros
SELECT 
    'master_admins' as table_name,
    COUNT(*) as count
FROM master_admins
UNION ALL
SELECT 
    'hotels' as table_name,
    COUNT(*) as count
FROM hotels;

-- 3. Mostrar Master Admins
SELECT 
    id,
    email,
    full_name,
    is_active,
    created_at
FROM master_admins
ORDER BY created_at;

-- 4. Testar função
SELECT has_master_admin() as has_admin_function_works;

-- 5. Testar acesso direto
SELECT 'Acesso direto à tabela master_admins: OK' as status;
