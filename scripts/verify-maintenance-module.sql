-- Verify all maintenance tables exist and have data
SELECT 'maintenance_categories' as table_name, COUNT(*) as record_count FROM maintenance_categories
UNION ALL
SELECT 'maintenance_technicians' as table_name, COUNT(*) as record_count FROM maintenance_technicians
UNION ALL
SELECT 'maintenance_orders' as table_name, COUNT(*) as record_count FROM maintenance_orders
UNION ALL
SELECT 'maintenance_attachments' as table_name, COUNT(*) as record_count FROM maintenance_attachments;

-- Show maintenance orders with details
SELECT 
    mo.id,
    mo.title,
    mo.priority,
    mo.status,
    mc.name as category,
    mt.name as technician,
    r.room_number,
    mo.estimated_cost,
    mo.created_at
FROM maintenance_orders mo
LEFT JOIN maintenance_categories mc ON mo.category_id = mc.id
LEFT JOIN maintenance_technicians mt ON mo.assigned_technician_id = mt.id
LEFT JOIN rooms r ON mo.room_id = r.id
ORDER BY mo.created_at DESC;

-- Show maintenance statistics
SELECT 
    status,
    COUNT(*) as count,
    AVG(estimated_cost) as avg_estimated_cost,
    SUM(estimated_cost) as total_estimated_cost
FROM maintenance_orders 
GROUP BY status
ORDER BY count DESC;

-- Show technician workload
SELECT 
    mt.name,
    COUNT(mo.id) as active_orders,
    AVG(mo.estimated_cost) as avg_order_cost
FROM maintenance_technicians mt
LEFT JOIN maintenance_orders mo ON mt.id = mo.assigned_technician_id 
    AND mo.status IN ('pending', 'in-progress')
GROUP BY mt.id, mt.name
ORDER BY active_orders DESC;
