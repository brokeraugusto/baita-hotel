-- Simple auth system check without loops

DO $$
DECLARE
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_password TEXT := 'masteradmin123';
    client_password TEXT := 'cliente123';
    auth_count INTEGER;
    profile_count INTEGER;
    admin_exists BOOLEAN := FALSE;
    client_exists BOOLEAN := FALSE;
    admin_pwd_ok BOOLEAN := FALSE;
    client_pwd_ok BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 === SIMPLE AUTH SYSTEM CHECK ===';
    RAISE NOTICE '';
    
    -- Count profiles
    SELECT COUNT(*) INTO profile_count 
    FROM profiles 
    WHERE email IN (admin_email, client_email);
    
    RAISE NOTICE '👤 Profiles found: %', profile_count;
    
    -- Count auth users
    SELECT COUNT(*) INTO auth_count 
    FROM auth.users 
    WHERE email IN (admin_email, client_email);
    
    RAISE NOTICE '🔐 Auth users found: %', auth_count;
    
    -- Check individual users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = admin_email) INTO admin_exists;
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = client_email) INTO client_exists;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 USER STATUS:';
    RAISE NOTICE '  Admin exists: %', admin_exists;
    RAISE NOTICE '  Client exists: %', client_exists;
    
    -- Test passwords if users exist
    IF admin_exists THEN
        SELECT EXISTS(
            SELECT 1 FROM auth.users 
            WHERE email = admin_email 
            AND encrypted_password = crypt(admin_password, encrypted_password)
        ) INTO admin_pwd_ok;
        RAISE NOTICE '  Admin password OK: %', admin_pwd_ok;
    END IF;
    
    IF client_exists THEN
        SELECT EXISTS(
            SELECT 1 FROM auth.users 
            WHERE email = client_email 
            AND encrypted_password = crypt(client_password, encrypted_password)
        ) INTO client_pwd_ok;
        RAISE NOTICE '  Client password OK: %', client_pwd_ok;
    END IF;
    
    RAISE NOTICE '';
    IF admin_exists AND client_exists AND admin_pwd_ok AND client_pwd_ok THEN
        RAISE NOTICE '🎉 AUTH SYSTEM READY! Both users can login.';
    ELSE
        RAISE NOTICE '⚠️  AUTH SYSTEM NEEDS FIXING.';
    END IF;
    RAISE NOTICE '';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error during check: %', SQLERRM;
END $$;
