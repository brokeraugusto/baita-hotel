-- Check if all maintenance tables exist
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('maintenance_categories', 'maintenance_technicians', 'maintenance_orders', 'maintenance_attachments')
ORDER BY table_name;

-- Check row counts in each table
SELECT 
    'maintenance_categories' as table_name,
    count(*) as row_count
FROM maintenance_categories
UNION ALL
SELECT 
    'maintenance_technicians' as table_name,
    count(*) as row_count
FROM maintenance_technicians
UNION ALL
SELECT 
    'maintenance_orders' as table_name,
    count(*) as row_count
FROM maintenance_orders
UNION ALL
SELECT 
    'maintenance_attachments' as table_name,
    count(*) as row_count
FROM maintenance_attachments;

-- Check triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table IN ('maintenance_categories', 'maintenance_technicians', 'maintenance_orders', 'maintenance_attachments')
ORDER BY event_object_table, trigger_name;

-- Check foreign key constraints
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
    AND tc.table_name IN ('maintenance_orders', 'maintenance_attachments')
ORDER BY tc.table_name, tc.constraint_name;

-- Check indexes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename IN ('maintenance_categories', 'maintenance_technicians', 'maintenance_orders', 'maintenance_attachments')
ORDER BY tablename, indexname;

-- Sample data verification
SELECT 
    'Categories' as data_type,
    name,
    color,
    is_active
FROM maintenance_categories
ORDER BY name
LIMIT 5;

-- Sample technicians
SELECT 
    'Technicians' as data_type,
    name,
    email,
    specialties,
    hourly_rate,
    is_active
FROM maintenance_technicians
ORDER BY name
LIMIT 5;

-- Sample orders with relationships
SELECT 
    mo.title,
    mo.priority,
    mo.status,
    mc.name as category,
    mt.name as technician,
    mo.estimated_cost,
    mo.created_at
FROM maintenance_orders mo
LEFT JOIN maintenance_categories mc ON mo.category_id = mc.id
LEFT JOIN maintenance_technicians mt ON mo.assigned_technician_id = mt.id
ORDER BY mo.created_at DESC
LIMIT 10;

-- Statistics summary
SELECT 
    'Summary' as type,
    (SELECT count(*) FROM maintenance_categories WHERE is_active = true) as active_categories,
    (SELECT count(*) FROM maintenance_technicians WHERE is_active = true) as active_technicians,
    (SELECT count(*) FROM maintenance_orders WHERE status = 'pending') as pending_orders,
    (SELECT count(*) FROM maintenance_orders WHERE status = 'in-progress') as in_progress_orders,
    (SELECT count(*) FROM maintenance_orders WHERE status = 'completed') as completed_orders,
    (SELECT count(*) FROM maintenance_orders WHERE priority = 'urgent') as urgent_orders;
