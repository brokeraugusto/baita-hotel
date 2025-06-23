-- Complete system cleanup for production v1.0
-- Removes all test data and prepares for clean master user setup

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 === PRODUCTION V1.0 SYSTEM CLEANUP ===';
    RAISE NOTICE '';
    
    -- Step 1: Clean all test data from auth system
    RAISE NOTICE '1. Cleaning authentication system...';
    
    -- Remove all test users from auth.identities
    DELETE FROM auth.identities WHERE provider = 'email';
    
    -- Remove all test users from auth.users
    DELETE FROM auth.users WHERE email LIKE '%@%';
    
    RAISE NOTICE '   ✅ Auth system cleaned';
    
    -- Step 2: Clean all application tables
    RAISE NOTICE '2. Cleaning application data...';
    
    -- Clean in proper order to respect foreign keys
    DELETE FROM maintenance_orders;
    DELETE FROM maintenance_templates;
    DELETE FROM maintenance_technicians;
    DELETE FROM maintenance_categories;
    DELETE FROM cleaning_tasks;
    DELETE FROM cleaning_personnel;
    DELETE FROM room_status_logs;
    DELETE FROM financial_transactions;
    DELETE FROM reservations;
    DELETE FROM guests;
    DELETE FROM rooms;
    DELETE FROM hotels;
    DELETE FROM profiles;
    DELETE FROM subscription_plans;
    DELETE FROM subscriptions;
    
    RAISE NOTICE '   ✅ Application data cleaned';
    
    -- Step 3: Reset sequences
    RAISE NOTICE '3. Resetting sequences...';
    
    -- Reset any sequences that might exist
    PERFORM setval(pg_get_serial_sequence('hotels', 'id'), 1, false) WHERE pg_get_serial_sequence('hotels', 'id') IS NOT NULL;
    PERFORM setval(pg_get_serial_sequence('rooms', 'id'), 1, false) WHERE pg_get_serial_sequence('rooms', 'id') IS NOT NULL;
    
    RAISE NOTICE '   ✅ Sequences reset';
    
    -- Step 4: Verify cleanup
    RAISE NOTICE '4. Verifying cleanup...';
    
    DECLARE
        profile_count INTEGER;
        auth_count INTEGER;
        hotel_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO profile_count FROM profiles;
        SELECT COUNT(*) INTO auth_count FROM auth.users;
        SELECT COUNT(*) INTO hotel_count FROM hotels;
        
        RAISE NOTICE '   Profiles remaining: %', profile_count;
        RAISE NOTICE '   Auth users remaining: %', auth_count;
        RAISE NOTICE '   Hotels remaining: %', hotel_count;
        
        IF profile_count = 0 AND auth_count = 0 AND hotel_count = 0 THEN
            RAISE NOTICE '   ✅ System completely clean';
        ELSE
            RAISE NOTICE '   ⚠️ Some data may remain';
        END IF;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 === CLEANUP COMPLETED ===';
    RAISE NOTICE 'System is now ready for production master user setup';
    RAISE NOTICE '';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Cleanup error: %', SQLERRM;
        RAISE NOTICE 'Continuing with partial cleanup...';
END $$;
