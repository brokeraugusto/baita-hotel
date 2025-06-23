-- Script final para verificar e garantir que o sistema de manutenção está funcionando corretamente

-- 1. Verificar se todas as tabelas necessárias existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'maintenance_orders', 
            'maintenance_categories', 
            'maintenance_technicians',
            'maintenance_templates'
        ) THEN 'REQUIRED'
        ELSE 'OPTIONAL'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'maintenance%'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela maintenance_orders
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'maintenance_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há dados de exemplo nas tabelas principais
SELECT 
    'maintenance_orders' as table_name,
    COUNT(*) as record_count
FROM maintenance_orders
UNION ALL
SELECT 
    'maintenance_categories' as table_name,
    COUNT(*) as record_count
FROM maintenance_categories
UNION ALL
SELECT 
    'maintenance_technicians' as table_name,
    COUNT(*) as record_count
FROM maintenance_technicians;

-- 4. Testar inserção de uma ordem de manutenção de teste
INSERT INTO maintenance_orders (
    hotel_id,
    title,
    description,
    priority,
    status,
    maintenance_type,
    is_emergency,
    created_at,
    updated_at
) VALUES (
    'hotel-test',
    'Teste do Sistema de Manutenção',
    'Ordem de teste para verificar funcionamento do sistema',
    'low',
    'pending',
    'corrective',
    false,
    NOW(),
    NOW()
) RETURNING id, title, status;

-- 5. Verificar se a inserção foi bem-sucedida
SELECT 
    id,
    title,
    status,
    priority,
    maintenance_type,
    is_emergency,
    created_at
FROM maintenance_orders 
WHERE title = 'Teste do Sistema de Manutenção'
ORDER BY created_at DESC
LIMIT 1;

-- 6. Limpar dados de teste
DELETE FROM maintenance_orders 
WHERE title = 'Teste do Sistema de Manutenção';

-- 7. Verificar constraints e índices
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'maintenance_orders'
AND tc.table_schema = 'public';

-- 8. Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'maintenance_orders'
AND schemaname = 'public';

-- 9. Status final do sistema
SELECT 
    'SISTEMA DE MANUTENÇÃO' as component,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_orders')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_categories')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_technicians')
        THEN 'OPERACIONAL ✅'
        ELSE 'ERRO ❌'
    END as status;
