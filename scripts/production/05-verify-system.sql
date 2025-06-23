-- System Verification Script
-- Verify that all components are properly installed

-- Check tables exist
SELECT 
    'Tables Check' as check_type,
    CASE 
        WHEN COUNT(*) = 11 THEN 'PASS'
        ELSE 'FAIL - Expected 11 tables, found ' || COUNT(*)
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles', 'subscription_plans', 'hotels', 'subscriptions',
    'rooms', 'guests', 'reservations', 'maintenance_orders',
    'cleaning_tasks', 'financial_transactions', 'subscription_payments'
);

-- Check enums exist
SELECT 
    'Enums Check' as check_type,
    CASE 
        WHEN COUNT(*) >= 10 THEN 'PASS'
        ELSE 'FAIL - Missing enums'
    END as status
FROM pg_type 
WHERE typname LIKE '%_enum';

-- Check functions exist
SELECT 
    'Functions Check' as check_type,
    CASE 
        WHEN COUNT(*) >= 3 THEN 'PASS'
        ELSE 'FAIL - Missing functions'
    END as status
FROM pg_proc 
WHERE proname IN ('get_system_status', 'initialize_master_user', 'create_client_user');

-- Check subscription plans
SELECT 
    'Plans Check' as check_type,
    CASE 
        WHEN COUNT(*) = 3 THEN 'PASS'
        ELSE 'FAIL - Expected 3 plans, found ' || COUNT(*)
    END as status
FROM public.subscription_plans;

-- Check RLS is enabled
SELECT 
    'RLS Check' as check_type,
    CASE 
        WHEN COUNT(*) = 11 THEN 'PASS'
        ELSE 'FAIL - RLS not enabled on all tables'
    END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relkind = 'r'
AND c.relrowsecurity = true;

-- Test system status function
SELECT 
    'System Status Function' as check_type,
    CASE 
        WHEN (public.get_system_status()->>'requires_setup')::boolean = true THEN 'PASS - System ready for setup'
        ELSE 'FAIL - System status function not working'
    END as status;

SELECT 'System verification completed' as final_status;
