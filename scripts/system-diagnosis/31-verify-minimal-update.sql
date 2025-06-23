-- Simple verification of password update

DO $$
DECLARE
    rec RECORD;
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_password TEXT := 'masteradmin123';
    client_password TEXT := 'cliente123';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 === VERIFICATION REPORT ===';
    RAISE NOTICE '';
    
    -- Check profiles
    RAISE NOTICE '👤 PROFILES TABLE:';
    FOR rec IN 
        SELECT email, id, role, full_name
        FROM profiles 
        WHERE email IN (admin_email, client_email)
        ORDER BY email
    LOOP
        RAISE NOTICE '  ✅ % (%) - %', rec.email, rec.role, rec.id;
    END LOOP;
    
    -- Check auth.users
    RAISE NOTICE '';
    RAISE NOTICE '🔐 AUTH.USERS TABLE:';
    FOR rec IN 
        SELECT 
            email, id,
            (encrypted_password IS NOT NULL) as has_password,
            LENGTH(encrypted_password) as password_length,
            (encrypted_password LIKE '$2%') as is_bcrypt,
            created_at
        FROM auth.users 
        WHERE email IN (admin_email, client_email)
        ORDER BY email
    LOOP
        RAISE NOTICE '  ✅ % - Password: %, Length: %, bcrypt: %', 
            rec.email, rec.has_password, rec.password_length, rec.is_bcrypt;
    END LOOP;
    
    -- Test passwords
    RAISE NOTICE '';
    RAISE NOTICE '🧪 PASSWORD TESTS:';
    
    -- Test admin
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = admin_email 
        AND encrypted_password = crypt(admin_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Admin password: VALID';
    ELSE
        RAISE NOTICE '  ❌ Admin password: INVALID';
    END IF;
    
    -- Test client
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = client_email 
        AND encrypted_password = crypt(client_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Client password: VALID';
    ELSE
        RAISE NOTICE '  ❌ Client password: INVALID';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 READY FOR LOGIN TESTING!';
    RAISE NOTICE '';
    
END $$;
