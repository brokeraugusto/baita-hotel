-- Verify Auth Fix
-- Simple verification that auth users were created correctly

DO $$
DECLARE
    rec RECORD;
    auth_count INTEGER;
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '✅ === VERIFYING AUTH FIX ===';
    
    -- Count auth users
    SELECT COUNT(*) INTO auth_count 
    FROM auth.users 
    WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');
    
    -- Count profiles
    SELECT COUNT(*) INTO profile_count 
    FROM profiles 
    WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 COUNTS:';
    RAISE NOTICE '  Profiles: %', profile_count;
    RAISE NOTICE '  Auth Users: %', auth_count;
    
    IF auth_count = profile_count AND auth_count = 2 THEN
        RAISE NOTICE '✅ SUCCESS: Auth users match profiles!';
    ELSE
        RAISE NOTICE '❌ MISMATCH: Auth users do not match profiles';
    END IF;
    
    -- Show detailed comparison
    RAISE NOTICE '';
    RAISE NOTICE '👥 DETAILED COMPARISON:';
    
    FOR rec IN 
        SELECT 
            p.email,
            p.id as profile_id,
            au.id as auth_id,
            CASE WHEN au.id IS NOT NULL THEN '✅' ELSE '❌' END as auth_exists
        FROM profiles p
        LEFT JOIN auth.users au ON p.id = au.id
        WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        ORDER BY p.email
    LOOP
        RAISE NOTICE '  % %: Profile % | Auth %', 
            rec.auth_exists, rec.email, rec.profile_id, 
            COALESCE(rec.auth_id::text, 'MISSING');
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST CREDENTIALS:';
    RAISE NOTICE '  admin@baitahotel.com / 123456789';
    RAISE NOTICE '  hotel@exemplo.com / 123456789';
    
END $$;
