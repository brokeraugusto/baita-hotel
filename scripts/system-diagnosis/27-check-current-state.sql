-- Check Current State of Users and Auth System
-- Provides a clear overview of what exists and what needs to be fixed

DO $$
DECLARE
    rec RECORD;
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 === CURRENT SYSTEM STATE CHECK ===';
    RAISE NOTICE '';
    
    -- Check profiles table
    RAISE NOTICE '📋 1. PROFILES TABLE:';
    FOR rec IN 
        SELECT 
            email, id, role, full_name, 
            created_at, is_active
        FROM profiles 
        WHERE email IN (admin_email, client_email)
        ORDER BY email
    LOOP
        RAISE NOTICE '  👤 %', rec.email;
        RAISE NOTICE '    ID: %', rec.id;
        RAISE NOTICE '    Role: %', rec.role;
        RAISE NOTICE '    Name: %', rec.full_name;
        RAISE NOTICE '    Active: %', rec.is_active;
        RAISE NOTICE '    Created: %', rec.created_at;
        RAISE NOTICE '';
    END LOOP;
    
    -- Check auth.users table
    RAISE NOTICE '🔐 2. AUTH.USERS TABLE:';
    BEGIN
        FOR rec IN 
            SELECT 
                email, id, 
                encrypted_password IS NOT NULL as has_password,
                LENGTH(encrypted_password) as password_length,
                email_confirmed_at IS NOT NULL as email_confirmed,
                created_at, updated_at
            FROM auth.users 
            WHERE email IN (admin_email, client_email)
            ORDER BY email
        LOOP
            RAISE NOTICE '  🔑 %', rec.email;
            RAISE NOTICE '    ID: %', rec.id;
            RAISE NOTICE '    Has Password: %', rec.has_password;
            RAISE NOTICE '    Password Length: %', rec.password_length;
            RAISE NOTICE '    Email Confirmed: %', rec.email_confirmed;
            RAISE NOTICE '    Created: %', rec.created_at;
            RAISE NOTICE '    Updated: %', rec.updated_at;
            RAISE NOTICE '';
        END LOOP;
        
        -- Check if no users found
        IF NOT FOUND THEN
            RAISE NOTICE '  ❌ No users found in auth.users table';
            RAISE NOTICE '';
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error accessing auth.users: %', SQLERRM;
            RAISE NOTICE '';
    END;
    
    -- Check auth.identities table
    RAISE NOTICE '🆔 3. AUTH.IDENTITIES TABLE:';
    BEGIN
        FOR rec IN 
            SELECT 
                i.user_id, i.provider, 
                i.identity_data->>'email' as identity_email,
                i.created_at, i.updated_at
            FROM auth.identities i
            JOIN profiles p ON p.id = i.user_id
            WHERE p.email IN (admin_email, client_email)
            ORDER BY identity_email
        LOOP
            RAISE NOTICE '  🆔 %', rec.identity_email;
            RAISE NOTICE '    User ID: %', rec.user_id;
            RAISE NOTICE '    Provider: %', rec.provider;
            RAISE NOTICE '    Created: %', rec.created_at;
            RAISE NOTICE '    Updated: %', rec.updated_at;
            RAISE NOTICE '';
        END LOOP;
        
        -- Check if no identities found
        IF NOT FOUND THEN
            RAISE NOTICE '  ❌ No identities found in auth.identities table';
            RAISE NOTICE '';
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error accessing auth.identities: %', SQLERRM;
            RAISE NOTICE '';
    END;
    
    -- Summary
    RAISE NOTICE '📊 4. SUMMARY:';
    RAISE NOTICE '';
    
    -- Count profiles
    SELECT COUNT(*) INTO rec FROM profiles WHERE email IN (admin_email, client_email);
    RAISE NOTICE '  Profiles Found: %/2', rec;
    
    -- Count auth users
    BEGIN
        SELECT COUNT(*) INTO rec FROM auth.users WHERE email IN (admin_email, client_email);
        RAISE NOTICE '  Auth Users Found: %/2', rec;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  Auth Users Found: Error - %', SQLERRM;
    END;
    
    -- Count identities
    BEGIN
        SELECT COUNT(*) INTO rec 
        FROM auth.identities i
        JOIN profiles p ON p.id = i.user_id
        WHERE p.email IN (admin_email, client_email);
        RAISE NOTICE '  Auth Identities Found: %', rec;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  Auth Identities Found: Error - %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ === STATE CHECK COMPLETE ===';
    
END $$;
