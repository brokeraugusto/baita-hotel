-- Verificação final completa do sistema
SELECT 'VERIFICAÇÃO FINAL COMPLETA DO SISTEMA' as title;

-- 1. Verificar todas as tabelas criadas
SELECT 'TABELAS CRIADAS:' as section;
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN tablename LIKE 'maintenance_%' THEN 'Manutenção'
        WHEN tablename IN ('rooms', 'guests', 'reservations') THEN 'Hotel'
        WHEN tablename = 'profiles' THEN 'Usuários'
        ELSE 'Outros'
    END as categoria
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY categoria, tablename;

-- 2. Verificar contagem de registros
SELECT 'CONTAGEM DE REGISTROS:' as section;
SELECT 'profiles' as tabela, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 'rooms' as tabela, COUNT(*) as registros FROM rooms
UNION ALL
SELECT 'maintenance_categories' as tabela, COUNT(*) as registros FROM maintenance_categories
UNION ALL
SELECT 'maintenance_technicians' as tabela, COUNT(*) as registros FROM maintenance_technicians
UNION ALL
SELECT 'maintenance_materials' as tabela, COUNT(*) as registros FROM maintenance_materials
UNION ALL
SELECT 'maintenance_templates' as tabela, COUNT(*) as registros FROM maintenance_templates
UNION ALL
SELECT 'maintenance_orders' as tabela, COUNT(*) as registros FROM maintenance_orders
ORDER BY tabela;

-- 3. Verificar foreign keys funcionando
SELECT 'FOREIGN KEYS ATIVAS:' as section;
SELECT 
    tc.table_name,
    tc.constraint_name,
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
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 4. Verificar ordens de manutenção com relacionamentos
SELECT 'ORDENS DE MANUTENÇÃO CRIADAS:' as section;
SELECT 
    mo.order_number,
    mo.title,
    mo.priority,
    mo.status,
    mo.maintenance_type,
    mo.is_emergency,
    r.room_number,
    c.name as categoria,
    t.name as tecnico,
    mo.estimated_cost,
    mo.scheduled_date
FROM maintenance_orders mo
LEFT JOIN rooms r ON mo.room_id = r.id
LEFT JOIN maintenance_categories c ON mo.category_id = c.id
LEFT JOIN maintenance_technicians t ON mo.assigned_technician_id = t.id
ORDER BY mo.created_at;

-- 5. Verificar categorias e técnicos
SELECT 'CATEGORIAS DE MANUTENÇÃO:' as section;
SELECT name, color, icon, is_active FROM maintenance_categories ORDER BY sort_order;

SELECT 'TÉCNICOS DISPONÍVEIS:' as section;
SELECT name, specialties, hourly_rate, is_active FROM maintenance_technicians ORDER BY name;

-- 6. Verificar índices criados
SELECT 'ÍNDICES CRIADOS:' as section;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename LIKE 'maintenance_%'
ORDER BY tablename, indexname;

-- 7. Status final
SELECT 'STATUS FINAL:' as section;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM maintenance_orders) > 0 AND
             (SELECT COUNT(*) FROM maintenance_categories) > 0 AND
             (SELECT COUNT(*) FROM maintenance_technicians) > 0 AND
             (SELECT COUNT(*) FROM rooms) > 0
        THEN '✅ SISTEMA DE MANUTENÇÃO FUNCIONANDO PERFEITAMENTE!'
        ELSE '❌ Há problemas no sistema'
    END as status_sistema;

-- 8. Estatísticas do sistema
SELECT 'ESTATÍSTICAS DO SISTEMA:' as section;
SELECT 
    (SELECT COUNT(*) FROM maintenance_orders WHERE status = 'pending') as ordens_pendentes,
    (SELECT COUNT(*) FROM maintenance_orders WHERE status = 'in_progress') as ordens_em_andamento,
    (SELECT COUNT(*) FROM maintenance_orders WHERE status = 'completed') as ordens_concluidas,
    (SELECT COUNT(*) FROM maintenance_orders WHERE is_emergency = true) as emergencias,
    (SELECT COUNT(*) FROM maintenance_orders WHERE maintenance_type = 'preventive') as preventivas,
    (SELECT COUNT(*) FROM rooms WHERE status = 'available') as quartos_disponiveis,
    (SELECT COUNT(*) FROM maintenance_technicians WHERE is_active = true) as tecnicos_ativos;
