-- Check if tables exist and have data
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
       (SELECT count(*) FROM pg_indexes WHERE tablename = t.table_name) as index_count,
       (
         CASE 
           WHEN t.table_name = 'maintenance_categories' THEN (SELECT count(*) FROM maintenance_categories)
           WHEN t.table_name = 'maintenance_technicians' THEN (SELECT count(*) FROM maintenance_technicians)
           WHEN t.table_name = 'maintenance_orders' THEN (SELECT count(*) FROM maintenance_orders)
           WHEN t.table_name = 'maintenance_attachments' THEN (SELECT count(*) FROM maintenance_attachments)
           ELSE 0
         END
       ) as row_count
FROM (
  VALUES 
    ('maintenance_categories'),
    ('maintenance_technicians'),
    ('maintenance_orders'),
    ('maintenance_attachments')
) as t(table_name);

-- Check if triggers exist
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('maintenance_categories', 'maintenance_technicians', 'maintenance_orders', 'maintenance_attachments')
ORDER BY trigger_name;

-- Check if RLS policies exist
SELECT tablename, policyname, permissive, cmd, qual
FROM pg_policies
WHERE tablename IN ('maintenance_categories', 'maintenance_technicians', 'maintenance_orders', 'maintenance_attachments')
ORDER BY tablename, policyname;

-- Check sample data
SELECT 
    mo.id,
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
LIMIT 5;
