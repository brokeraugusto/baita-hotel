-- Password Update Verification Script
-- Comprehensive verification of the password update process

DO $$
DECLARE
    rec RECORD;
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_new_password TEXT := 'masteradmin123';
    client_new_password TEXT := 'cliente123';
    test_passed BOOLEAN := TRUE;
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
BEGIN
    RAISE NOTICE '🧪 === PASSWORD UPDATE VERIFICATION REPORT ===';
    RAISE NOTICE 'Testing new credentials and system integrity';
    RAISE NOTICE '';
    
    -- Test 1: Verify users exist in auth.users
    RAISE NOTICE '📋 TEST 1: AUTH USERS EXISTENCE';
    total_tests := total_tests + 2;
    
    -- Check admin user
    SELECT COUNT(*) > 0 INTO test_passed 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Admin user exists in auth.users';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Admin user missing from auth.users';
    END IF;
    
    -- Check client user
    SELECT COUNT(*) > 0 INTO test_passed 
    FROM auth.users 
    WHERE email = client_email;
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Client user exists in auth.users';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Client user missing from auth.users';
    END IF;
    
    -- Test 2: Verify password hashes
    RAISE NOTICE '';
    RAISE NOTICE '🔐 TEST 2: PASSWORD HASH VERIFICATION';
    total_tests := total_tests + 2;
    
    -- Test admin password hash
    SELECT (encrypted_password = crypt(admin_new_password, encrypted_password)) INTO test_passed
    FROM auth.users 
    WHERE email = admin_email;
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Admin password hash is valid';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Admin password hash is invalid';
    END IF;
    
    -- Test client password hash
    SELECT (encrypted_password = crypt(client_new_password, encrypted_password)) INTO test_passed
    FROM auth.users 
    WHERE email = client_email;
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Client password hash is valid';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Client password hash is invalid';
    END IF;
    
    -- Test 3: Verify identities exist
    RAISE NOTICE '';
    RAISE NOTICE '🆔 TEST 3: AUTH IDENTITIES VERIFICATION';
    total_tests := total_tests + 2;
    
    -- Check admin identity
    SELECT COUNT(*) > 0 INTO test_passed 
    FROM auth.identities 
    WHERE identity_data->>'email' = admin_email;
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Admin identity exists';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Admin identity missing';
    END IF;
    
    -- Check client identity
    SELECT COUNT(*) > 0 INTO test_passed 
    FROM auth.identities 
    WHERE identity_data->>'email' = client_email;
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Client identity exists';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Client identity missing';
    END IF;
    
    -- Test 4: Verify profiles synchronization
    RAISE NOTICE '';
    RAISE NOTICE '👤 TEST 4: PROFILES SYNCHRONIZATION';
    total_tests := total_tests + 2;
    
    -- Check admin profile
    SELECT COUNT(*) > 0 INTO test_passed 
    FROM profiles 
    WHERE email = admin_email AND role = 'master_admin';
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Admin profile synchronized';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Admin profile not synchronized';
    END IF;
    
    -- Check client profile
    SELECT COUNT(*) > 0 INTO test_passed 
    FROM profiles 
    WHERE email = client_email AND role = 'client';
    
    IF test_passed THEN
        RAISE NOTICE '  ✅ Client profile synchronized';
        passed_tests := passed_tests + 1;
    ELSE
        RAISE NOTICE '  ❌ Client profile not synchronized';
    END IF;
    
    -- Test 5: Detailed user information
    RAISE NOTICE '';
    RAISE NOTICE '📊 TEST 5: DETAILED USER INFORMATION';
    
    FOR rec IN 
        SELECT 
            u.id,
            u.email,
            u.created_at,
            u.updated_at,
            u.email_confirmed_at IS NOT NULL as email_confirmed,
            u.encrypted_password IS NOT NULL as has_password,
            LENGTH(u.encrypted_password) as password_length,
            p.role,
            p.full_name
        FROM auth.users u
        LEFT JOIN profiles p ON u.id = p.id
        WHERE u.email IN (admin_email, client_email)
        ORDER BY u.email
    LOOP
        RAISE NOTICE '  User: %', rec.email;
        RAISE NOTICE '    ID: %', rec.id;
        RAISE NOTICE '    Role: %', rec.role;
        RAISE NOTICE '    Full Name: %', rec.full_name;
        RAISE NOTICE '    Email Confirmed: %', rec.email_confirmed;
        RAISE NOTICE '    Has Password: %', rec.has_password;
        RAISE NOTICE '    Password Length: % chars', rec.password_length;
        RAISE NOTICE '    Created: %', rec.created_at;
        RAISE NOTICE '    Updated: %', rec.updated_at;
        RAISE NOTICE '';
    END LOOP;
    
    -- Test 6: Security validation
    RAISE NOTICE '🔒 TEST 6: SECURITY VALIDATION';
    total_tests := total_tests + 4;
    
    -- Check password complexity (bcrypt format)
    FOR rec IN 
        SELECT 
            email,
            encrypted_password,
            (encrypted_password LIKE '$2%') as is_bcrypt,
            LENGTH(encrypted_password) >= 60 as proper_length
        FROM auth.users 
        WHERE email IN (admin_email, client_email)
    LOOP
        IF rec.is_bcrypt THEN
            RAISE NOTICE '  ✅ % password uses bcrypt format', rec.email;
            passed_tests := passed_tests + 1;
        ELSE
            RAISE NOTICE '  ❌ % password not in bcrypt format', rec.email;
        END IF;
        
        IF rec.proper_length THEN
            RAISE NOTICE '  ✅ % password has proper length', rec.email;
            passed_tests := passed_tests + 1;
        ELSE
            RAISE NOTICE '  ❌ % password length insufficient', rec.email;
        END IF;
    END LOOP;
    
    -- Final Report
    RAISE NOTICE '';
    RAISE NOTICE '📈 === VERIFICATION SUMMARY ===';
    RAISE NOTICE '  Total Tests: %', total_tests;
    RAISE NOTICE '  Passed Tests: %', passed_tests;
    RAISE NOTICE '  Failed Tests: %', (total_tests - passed_tests);
    RAISE NOTICE '  Success Rate: %%%', ROUND((passed_tests::DECIMAL / total_tests::DECIMAL) * 100, 1);
    
    IF passed_tests = total_tests THEN
        RAISE NOTICE '  🎉 ALL TESTS PASSED - SYSTEM READY';
    ELSE
        RAISE NOTICE '  ⚠️ SOME TESTS FAILED - REVIEW REQUIRED';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔑 === NEW CREDENTIALS FOR TESTING ===';
    RAISE NOTICE '  Admin: % / %', admin_email, admin_new_password;
    RAISE NOTICE '  Client: % / %', client_email, client_new_password;
    RAISE NOTICE '';
    RAISE NOTICE '✅ === VERIFICATION COMPLETE ===';
    
END $$;
