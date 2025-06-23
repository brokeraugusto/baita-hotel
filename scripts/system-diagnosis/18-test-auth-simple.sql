-- Test Auth System - Simple Version
-- This script tests auth without assuming specific column names

DO $$
DECLARE
    rec RECORD;
    user_count INTEGER;
BEGIN
    RAISE NOTICE '🧪 === TESTING AUTH SYSTEM (SIMPLE) ===';
    
    -- 1. Count total users
    RAISE NOTICE '';
    RAISE NOTICE '📊 1. COUNTING USERS...';
    
    BEGIN
        EXECUTE 'SELECT COUNT(*) FROM auth.users' INTO user_count;
        RAISE NOTICE '  Total auth users: %', user_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot count auth users: %', SQLERRM;
            RETURN;
    END;
    
    -- 2. List our specific users
    RAISE NOTICE '';
    RAISE NOTICE '👤 2. CHECKING OUR USERS...';
    
    BEGIN
        FOR rec IN 
            EXECUTE 'SELECT id, email FROM auth.users WHERE email IN (''admin@baitahotel.com'', ''hotel@exemplo.com'') ORDER BY email'
        LOOP
            RAISE NOTICE '  ✅ Found user: % (%)', rec.email, rec.id;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot query users: %', SQLERRM;
    END;
    
    -- 3. Check identities
    RAISE NOTICE '';
    RAISE NOTICE '🔐 3. CHECKING IDENTITIES...';
    
    BEGIN
        FOR rec IN 
            EXECUTE 'SELECT user_id, email, provider FROM auth.identities WHERE email IN (''admin@baitahotel.com'', ''hotel@exemplo.com'') ORDER BY email'
        LOOP
            RAISE NOTICE '  ✅ Found identity: % (%) - Provider: %', rec.email, rec.user_id, rec.provider;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot query identities: %', SQLERRM;
    END;
    
    -- 4. Test password validation
    RAISE NOTICE '';
    RAISE NOTICE '🔐 4. TESTING PASSWORDS...';
    
    BEGIN
        FOR rec IN 
            EXECUTE 'SELECT email, (encrypted_password = crypt(''123456789'', encrypted_password)) as password_valid FROM auth.users WHERE email IN (''admin@baitahotel.com'', ''hotel@exemplo.com'')'
        LOOP
            RAISE NOTICE '  Password for %: %', 
                rec.email, 
                CASE WHEN rec.password_valid THEN '✅ VALID' ELSE '❌ INVALID' END;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot test passwords: %', SQLERRM;
    END;
    
    -- 5. Check profile sync
    RAISE NOTICE '';
    RAISE NOTICE '👥 5. CHECKING PROFILE SYNC...';
    
    BEGIN
        FOR rec IN 
            SELECT 
                p.email,
                p.id as profile_id,
                CASE WHEN au.id IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as auth_status
            FROM profiles p
            LEFT JOIN auth.users au ON p.id = au.id
            WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY p.email
        LOOP
            RAISE NOTICE '  Profile %: Auth User %', rec.email, rec.auth_status;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot check profile sync: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ === AUTH SYSTEM TEST COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '📋 SUMMARY:';
    RAISE NOTICE '  - Total auth users: %', user_count;
    RAISE NOTICE '  - Ready to test login with credentials above';
    
END $$;
