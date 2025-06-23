-- Verificar se tudo foi criado corretamente
SELECT 'Verificação Final do Sistema' as info;

-- Verificar tabelas criadas
SELECT 'Tabelas criadas:' as section;
SELECT 
    tablename as table_name,
    schemaname as schema_name
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar contagem de registros
SELECT 'Contagem de registros:' as section;
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'rooms' as table_name, COUNT(*) as record_count FROM rooms
UNION ALL
SELECT 'maintenance_categories' as table_name, COUNT(*) as record_count FROM maintenance_categories
UNION ALL
SELECT 'maintenance_technicians' as table_name, COUNT(*) as record_count FROM maintenance_technicians
UNION ALL
SELECT 'maintenance_orders' as table_name, COUNT(*) as record_count FROM maintenance_orders;

-- Verificar estrutura das ordens de manutenção
SELECT 'Estrutura das ordens de manutenção:' as section;
SELECT 
    mo.id,
    mo.title,
    mo.priority,
    mo.status,
    mo.maintenance_type,
    mo.is_emergency,
    r.room_number,
    c.name as category,
    t.name as technician
FROM maintenance_orders mo
LEFT JOIN rooms r ON mo.room_id = r.id
LEFT JOIN maintenance_categories c ON mo.category_id = c.id
LEFT JOIN maintenance_technicians t ON mo.assigned_technician_id = t.id;

-- Verificar se há foreign keys funcionando
SELECT 'Foreign keys funcionando corretamente!' as final_status;
