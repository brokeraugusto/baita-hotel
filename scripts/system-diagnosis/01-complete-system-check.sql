-- Complete system diagnosis and health check
-- This script will verify all database components are working

-- Check if basic tables exist
SELECT 'profiles' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'hotels' as table_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') 
            THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 'rooms' as table_name,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') 
            THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Check if test users exist
SELECT 'Test Users Check' as check_type,
       COUNT(*) as count,
       CASE WHEN COUNT(*) >= 2 THEN 'OK' ELSE 'MISSING' END as status
FROM profiles 
WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'hotels', 'rooms');

-- Check for any constraint issues
SELECT conname, contype, confrelid::regclass as foreign_table
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
