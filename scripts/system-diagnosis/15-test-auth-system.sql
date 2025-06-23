-- Test Auth System
-- This script tests if the auth system is working properly

DO $$
DECLARE
    test_result RECORD;
    auth_count INTEGER;
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '🧪 === TESTING AUTH SYSTEM ===';
    
    -- 1. Count users
    RAISE NOTICE '';
    RAISE NOTICE '📊 1. COUNTING USERS...';
    
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    RAISE NOTICE '  Auth users: %', auth_count;
    RAISE NOTICE '  Profiles: %', profile_count;
    
    -- 2. Test specific users
    RAISE NOTICE '';
    RAISE NOTICE '👤 2. TESTING SPECIFIC USERS...';
    
    FOR test_result IN 
        SELECT 
            u.id,
            u.email,
            u.email_confirmed,
            u.created_at,
            (u.encrypted_password = crypt('123456789', u.encrypted_password)) as password_correct,
            p.full_name,
            p.role
        FROM auth.users u
        JOIN profiles p ON u.id = p.id
        WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        ORDER BY u.email
    LOOP
        RAISE NOTICE '  User: %', test_result.email;
        RAISE NOTICE '    ID: %', test_result.id;
        RAISE NOTICE '    Email Confirmed: %', test_result.email_confirmed;
        RAISE NOTICE '    Password Correct: %', test_result.password_correct;
        RAISE NOTICE '    Profile Name: %', test_result.full_name;
        RAISE NOTICE '    Profile Role: %', test_result.role;
        RAISE NOTICE '    Created: %', test_result.created_at;
        RAISE NOTICE '';
    END LOOP;
    
    -- 3. Test identities
    RAISE NOTICE '';
    RAISE NOTICE '🔐 3. TESTING IDENTITIES...';
    
    FOR test_result IN 
        SELECT 
            i.user_id,
            i.provider,
            i.provider_id,
            i.email,
            u.email as auth_email
        FROM auth.identities i
        JOIN auth.users u ON i.user_id = u.id
        WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        ORDER BY u.email
    LOOP
        RAISE NOTICE '  Identity for: %', test_result.auth_email;
        RAISE NOTICE '    Provider: %', test_result.provider;
        RAISE NOTICE '    Provider ID: %', test_result.provider_id;
        RAISE NOTICE '    Identity Email: %', test_result.email;
        RAISE NOTICE '';
    END LOOP;
    
    -- 4. Check for common issues
    RAISE NOTICE '';
    RAISE NOTICE '🔍 4. CHECKING FOR COMMON ISSUES...';
    
    -- Check for missing identities
    FOR test_result IN 
        SELECT u.email
        FROM auth.users u
        WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        AND NOT EXISTS (
            SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
        )
    LOOP
        RAISE NOTICE '  ❌ Missing identity for: %', test_result.email;
    END LOOP;
    
    -- Check for unconfirmed emails
    FOR test_result IN 
        SELECT u.email
        FROM auth.users u
        WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        AND u.email_confirmed = false
    LOOP
        RAISE NOTICE '  ⚠️ Unconfirmed email: %', test_result.email;
    END LOOP;
    
    -- Check for mismatched IDs
    FOR test_result IN 
        SELECT u.email, u.id as auth_id, p.id as profile_id
        FROM auth.users u
        JOIN profiles p ON u.email = p.email
        WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        AND u.id != p.id
    LOOP
        RAISE NOTICE '  ❌ ID mismatch for %: auth=%s, profile=%s', 
            test_result.email, test_result.auth_id, test_result.profile_id;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ === AUTH SYSTEM TEST COMPLETE ===';
    
END $$;
