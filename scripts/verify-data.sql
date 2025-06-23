-- Check profiles
SELECT 'PROFILES' as table_name, count(*) as total FROM profiles;

-- Check rooms
SELECT 'ROOMS' as table_name, count(*) as total FROM rooms;

-- Check guests  
SELECT 'GUESTS' as table_name, count(*) as total FROM guests;

-- Check maintenance orders
SELECT 'MAINTENANCE_ORDERS' as table_name, count(*) as total FROM maintenance_orders;

-- Show sample data
SELECT 'SAMPLE MAINTENANCE ORDERS' as info;
SELECT 
  mo.title,
  mo.priority,
  mo.status,
  r.room_number,
  mo.assigned_to,
  mo.estimated_cost
FROM maintenance_orders mo
LEFT JOIN rooms r ON mo.room_id = r.id
LIMIT 5;
