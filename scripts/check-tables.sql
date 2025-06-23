-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'rooms', 'guests', 'maintenance_orders')
ORDER BY table_name;
