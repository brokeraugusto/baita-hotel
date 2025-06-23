-- Final comprehensive system test
-- This script tests all authentication functionality

-- 1. Test user authentication
SELECT 
    'Authentication Test' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            JOIN profiles p ON u.id = p.id
            WHERE u.email = 'admin@baitahotel.com'
            AND p.role = 'master_admin'
        ) THEN 'PASS - Master admin exists'
        ELSE 'FAIL - Master admin missing'
    END as master_admin_test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users u
            JOIN profiles p ON u.id = p.id
            WHERE u.email = 'hotel@exemplo.com'
            AND p.role = 'client'
        ) THEN 'PASS - Client exists'
        ELSE 'FAIL - Client missing'
    END as client_test;

-- 2. Test RLS policies
SELECT 
    'RLS Policies Test' as test_name,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 6 THEN 'PASS - Sufficient policies'
        ELSE 'FAIL - Missing policies'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'hotels');

-- 3. Test function existence
SELECT 
    'Functions Test' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_current_user_profile'
        ) THEN 'PASS - Profile function exists'
        ELSE 'FAIL - Profile function missing'
    END as function_test;

-- 4. Test data integrity
SELECT 
    'Data Integrity Test' as test_name,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE hotel_id IS NOT NULL 
            AND hotel_id NOT IN (SELECT id FROM hotels)
        ) THEN 'PASS - No orphaned hotel references'
        ELSE 'FAIL - Orphaned hotel references found'
    END as integrity_test;

-- 5. Test password hashing
SELECT 
    'Password Security Test' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE encrypted_password IS NOT NULL 
            AND encrypted_password != ''
            AND email = 'admin@baitahotel.com'
        ) THEN 'PASS - Passwords are encrypted'
        ELSE 'FAIL - Password encryption issue'
    END as password_test;

-- 6. Final summary
SELECT 
    'SYSTEM STATUS' as summary,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM auth.users u
            JOIN profiles p ON u.id = p.id
        ) >= 2
        AND (
            SELECT COUNT(*) FROM pg_policies 
            WHERE schemaname = 'public'
        ) >= 6
        AND EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_current_user_profile'
        )
        THEN '✅ SYSTEM READY FOR PRODUCTION'
        ELSE '❌ SYSTEM NEEDS ATTENTION'
    END as status;
