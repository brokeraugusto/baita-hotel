-- Verify all tables exist and show their structure
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count records in each table
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'guests', COUNT(*) FROM guests
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'maintenance_orders', COUNT(*) FROM maintenance_orders
UNION ALL
SELECT 'cleaning_tasks', COUNT(*) FROM cleaning_tasks
UNION ALL
SELECT 'room_categories', COUNT(*) FROM room_categories
UNION ALL
SELECT 'pricing_rules', COUNT(*) FROM pricing_rules
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'financial_transactions', COUNT(*) FROM financial_transactions
UNION ALL
SELECT 'support_tickets', COUNT(*) FROM support_tickets
ORDER BY table_name;

-- Show sample data from key tables
SELECT 'Sample Rooms:' as info;
SELECT room_number, room_type, status, price_per_night FROM rooms LIMIT 5;

SELECT 'Sample Maintenance Orders:' as info;
SELECT title, priority, status, assigned_to FROM maintenance_orders LIMIT 5;

SELECT 'Sample Guests:' as info;
SELECT full_name, email, vip_status FROM guests LIMIT 5;

SELECT 'Sample Reservations:' as info;
SELECT r.check_in_date, r.check_out_date, r.status, rm.room_number, g.full_name
FROM reservations r
JOIN rooms rm ON r.room_id = rm.id
JOIN guests g ON r.guest_id = g.id
LIMIT 5;
