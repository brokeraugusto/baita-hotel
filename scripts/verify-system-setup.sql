-- Verificar se todas as tabelas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar dados nas tabelas principais
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'rooms' as table_name, COUNT(*) as record_count FROM rooms
UNION ALL
SELECT 'maintenance_categories' as table_name, COUNT(*) as record_count FROM maintenance_categories
UNION ALL
SELECT 'maintenance_technicians' as table_name, COUNT(*) as record_count FROM maintenance_technicians
UNION ALL
SELECT 'maintenance_orders' as table_name, COUNT(*) as record_count FROM maintenance_orders;

-- Verificar constraints problemáticas
SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name IN ('profiles', 'maintenance_orders', 'rooms')
AND tc.constraint_type = 'FOREIGN KEY';
