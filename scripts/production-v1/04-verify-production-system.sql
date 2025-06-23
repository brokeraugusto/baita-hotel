-- Production v1.0 System Verification
-- Verifies that the system is properly set up and ready for production

-- Test 1: Check if all required tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    -- Check for required tables
    FOR table_name IN 
        SELECT unnest(ARRAY['profiles', 'hotels', 'subscriptions', 'subscription_plans'])
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ All required tables exist';
    END IF;
END $$;

-- Test 2: Check if enums are created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE EXCEPTION 'Missing enum: user_role';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        RAISE EXCEPTION 'Missing enum: subscription_status';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hotel_status') THEN
        RAISE EXCEPTION 'Missing enum: hotel_status';
    END IF;
    
    RAISE NOTICE '✅ All enums exist';
END $$;

-- Test 3: Check if functions exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'initialize_master_user'
    ) THEN
        RAISE EXCEPTION 'Missing function: initialize_master_user';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_system_status'
    ) THEN
        RAISE EXCEPTION 'Missing function: get_system_status';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_client_user'
    ) THEN
        RAISE EXCEPTION 'Missing function: create_client_user';
    END IF;
    
    RAISE NOTICE '✅ All functions exist';
END $$;

-- Test 4: Check if subscription plans exist
DO $$
DECLARE
    plan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM subscription_plans;
    
    IF plan_count < 3 THEN
        RAISE EXCEPTION 'Missing subscription plans. Expected at least 3, found %', plan_count;
    END IF;
    
    RAISE NOTICE '✅ Subscription plans exist (% plans)', plan_count;
END $$;

-- Test 5: Check RLS is enabled
DO $$
DECLARE
    table_name TEXT;
    rls_enabled BOOLEAN;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY['profiles', 'hotels', 'subscriptions', 'subscription_plans'])
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class 
        WHERE relname = table_name;
        
        IF NOT rls_enabled THEN
            RAISE EXCEPTION 'RLS not enabled for table: %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ RLS enabled on all tables';
END $$;

-- Test 6: Test system status function
DO $$
DECLARE
    status_result JSONB;
BEGIN
    SELECT get_system_status() INTO status_result;
    
    IF status_result->>'system_initialized' IS NULL THEN
        RAISE EXCEPTION 'System status function not working properly';
    END IF;
    
    RAISE NOTICE '✅ System status function working';
    RAISE NOTICE 'System Status: %', status_result;
END $$;

-- Test 7: Verify no master admin exists yet
DO $$
DECLARE
    master_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO master_count 
    FROM profiles 
    WHERE role = 'master_admin';
    
    IF master_count > 0 THEN
        RAISE EXCEPTION 'Master admin already exists! System should be clean for production.';
    END IF;
    
    RAISE NOTICE '✅ No master admin exists - ready for initialization';
END $$;

-- Test 8: Verify no test data exists
DO $$
DECLARE
    profile_count INTEGER;
    hotel_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO hotel_count FROM hotels;
    
    IF profile_count > 0 OR hotel_count > 0 THEN
        RAISE EXCEPTION 'Test data still exists! Profiles: %, Hotels: %', profile_count, hotel_count;
    END IF;
    
    RAISE NOTICE '✅ No test data exists - clean system';
END $$;

-- Final verification message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ================================';
    RAISE NOTICE '🎉 PRODUCTION SYSTEM VERIFIED!';
    RAISE NOTICE '🎉 ================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. Deploy to production environment';
    RAISE NOTICE '2. Visit /system-setup to initialize master admin';
    RAISE NOTICE '3. Begin adding clients through master admin panel';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 BaitaHotel v1.0 is ready for launch!';
    RAISE NOTICE '';
END $$;
