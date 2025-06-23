-- Verificação final completa do sistema de manutenção
SELECT 'VERIFICAÇÃO FINAL COMPLETA DO SISTEMA DE MANUTENÇÃO' as title;

-- 1. Verificar todas as tabelas de manutenção
SELECT 'TABELAS DE MANUTENÇÃO:' as section;
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name)
        THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM (VALUES 
    ('maintenance_categories'),
    ('maintenance_technicians'),
    ('maintenance_materials'),
    ('maintenance_orders'),
    ('maintenance_order_materials'),
    ('maintenance_templates')
) AS t(table_name);

-- 2. Verificar colunas críticas da tabela maintenance_orders
SELECT 'COLUNAS CRÍTICAS DA MAINTENANCE_ORDERS:' as section;
SELECT 
    column_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'maintenance_orders' AND column_name = c.column_name)
        THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM (VALUES 
    ('id'),
    ('hotel_id'),
    ('order_number'),
    ('title'),
    ('description'),
    ('priority'),
    ('status'),
    ('assigned_technician_id'),
    ('assigned_to'),
    ('reported_by'),
    ('location'),
    ('created_at'),
    ('updated_at')
) AS c(column_name);

-- 3. Verificar dados de exemplo
SELECT 'CONTAGEM DE DADOS:' as section;
SELECT 'Categorias' as tipo, COUNT(*) as total FROM maintenance_categories
UNION ALL
SELECT 'Técnicos' as tipo, COUNT(*) as total FROM maintenance_technicians
UNION ALL
SELECT 'Materiais' as tipo, COUNT(*) as total FROM maintenance_materials
UNION ALL
SELECT 'Ordens' as tipo, COUNT(*) as total FROM maintenance_orders
UNION ALL
SELECT 'Templates' as tipo, COUNT(*) as total FROM maintenance_templates;

-- 4. Verificar ordens por status
SELECT 'ORDENS POR STATUS:' as section;
SELECT 
    status,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM maintenance_orders 
GROUP BY status
ORDER BY total DESC;

-- 5. Verificar ordens por prioridade
SELECT 'ORDENS POR PRIORIDADE:' as section;
SELECT 
    priority,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM maintenance_orders 
GROUP BY priority
ORDER BY 
    CASE priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END;

-- 6. Verificar ordens por tipo
SELECT 'ORDENS POR TIPO:' as section;
SELECT 
    maintenance_type,
    COUNT(*) as total
FROM maintenance_orders 
GROUP BY maintenance_type
ORDER BY total DESC;

-- 7. Verificar índices importantes
SELECT 'ÍNDICES IMPORTANTES:' as section;
SELECT 
    indexname,
    CASE 
        WHEN indexname IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM (VALUES 
    ('idx_maintenance_orders_hotel_id'),
    ('idx_maintenance_orders_status'),
    ('idx_maintenance_orders_priority'),
    ('idx_maintenance_orders_assigned_to')
) AS i(expected_index)
LEFT JOIN pg_indexes ON indexname = expected_index AND tablename = 'maintenance_orders';

-- 8. Verificar views
SELECT 'VIEWS CRIADAS:' as section;
SELECT 
    viewname,
    '✅ EXISTE' as status
FROM pg_views 
WHERE viewname LIKE 'v_maintenance%'
ORDER BY viewname;

-- 9. Teste de consulta completa
SELECT 'TESTE DE CONSULTA COMPLETA:' as section;
SELECT 
    'Consulta executada com sucesso!' as resultado,
    COUNT(*) as total_ordens
FROM v_maintenance_orders_complete;

-- 10. Verificar foreign keys (se existirem)
SELECT 'FOREIGN KEYS:' as section;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name LIKE 'maintenance%'
ORDER BY tc.table_name, tc.constraint_name;

SELECT '🎉 VERIFICAÇÃO COMPLETA FINALIZADA!' as final_status;
