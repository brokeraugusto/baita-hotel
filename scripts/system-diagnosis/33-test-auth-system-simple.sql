-- Simple test of the auth system

DO $$
DECLARE
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_password TEXT := 'masteradmin123';
    client_password TEXT := 'cliente123';
    auth_count INTEGER;
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 === AUTH SYSTEM TEST ===';
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
    
    -- Show auth user details
    RAISE NOTICE '';
    RAISE NOTICE '📊 AUTH USER DETAILS:';
    
    FOR rec IN 
        SELECT 
            email, 
            id,
            (encrypted_password IS NOT NULL) as has_password,
            LENGTH(encrypted_password) as pwd_length,
            email_confirmed_at IS NOT NULL as email_confirmed,
            aud,
            role
        FROM auth.users 
        WHERE email IN (admin_email, client_email)
    LOOP
        RAISE NOTICE '  % - ID: %, Password: %, Length: %, Confirmed: %, Aud: %, Role: %', 
            rec.email, rec.id, rec.has_password, rec.pwd_length, rec.email_confirmed, rec.aud, rec.role;
    END LOOP;
    
    -- Test password verification
    RAISE NOTICE '';
    RAISE NOTICE '🔑 PASSWORD VERIFICATION:';
    
    -- Admin test
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = admin_email 
        AND encrypted_password = crypt(admin_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Admin password: CORRECT';
    ELSE
        RAISE NOTICE '  ❌ Admin password: INCORRECT';
    END IF;
    
    -- Client test
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = client_email 
        AND encrypted_password = crypt(client_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Client password: CORRECT';
    ELSE
        RAISE NOTICE '  ❌ Client password: INCORRECT';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready for login testing!';
    RAISE NOTICE '';
    
END $$;
