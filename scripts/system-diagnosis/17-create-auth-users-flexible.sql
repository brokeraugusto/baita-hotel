-- Create Auth Users - Flexible Version
-- This script adapts to the actual auth table structure

DO $$
DECLARE
    admin_user_id UUID := '11111111-1111-1111-1111-111111111111';
    client_user_id UUID := '22222222-2222-2222-2222-222222222222';
    has_email_confirmed BOOLEAN;
    has_email_confirmed_at BOOLEAN;
    has_confirmation_token BOOLEAN;
    rec RECORD;
BEGIN
    RAISE NOTICE '🔧 === CREATING AUTH USERS (FLEXIBLE) ===';
    
    -- 1. Check what columns exist in auth.users
    RAISE NOTICE '';
    RAISE NOTICE '🔍 1. CHECKING AUTH.USERS COLUMNS...';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' 
        AND column_name = 'email_confirmed'
    ) INTO has_email_confirmed;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' 
        AND column_name = 'email_confirmed_at'
    ) INTO has_email_confirmed_at;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' 
        AND column_name = 'confirmation_token'
    ) INTO has_confirmation_token;
    
    RAISE NOTICE '  email_confirmed column: %', 
        CASE WHEN has_email_confirmed THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '  email_confirmed_at column: %', 
        CASE WHEN has_email_confirmed_at THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    RAISE NOTICE '  confirmation_token column: %', 
        CASE WHEN has_confirmation_token THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    
    -- 2. Clean existing users
    RAISE NOTICE '';
    RAISE NOTICE '🧹 2. CLEANING EXISTING USERS...';
    
    BEGIN
        DELETE FROM auth.identities WHERE user_id IN (admin_user_id, client_user_id);
        DELETE FROM auth.users WHERE id IN (admin_user_id, client_user_id);
        RAISE NOTICE '✅ Cleaned existing auth users';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Could not clean existing users: %', SQLERRM;
    END;
    
    -- 3. Create Master Admin User with flexible columns
    RAISE NOTICE '';
    RAISE NOTICE '👤 3. CREATING MASTER ADMIN USER...';
    
    BEGIN
        -- Build dynamic INSERT statement based on available columns
        EXECUTE format('
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                created_at,
                updated_at,
                role,
                aud
                %s
                %s
                %s
            ) VALUES (
                %L,
                %L,
                crypt(%L, gen_salt(''bf'')),
                NOW(),
                NOW(),
                ''authenticated'',
                ''authenticated''
                %s
                %s
                %s
            )',
            CASE WHEN has_email_confirmed THEN ', email_confirmed' ELSE '' END,
            CASE WHEN has_email_confirmed_at THEN ', email_confirmed_at' ELSE '' END,
            CASE WHEN has_confirmation_token THEN ', confirmation_token' ELSE '' END,
            admin_user_id,
            'admin@baitahotel.com',
            '123456789',
            CASE WHEN has_email_confirmed THEN ', true' ELSE '' END,
            CASE WHEN has_email_confirmed_at THEN ', NOW()' ELSE '' END,
            CASE WHEN has_confirmation_token THEN ', ''''''' ELSE '' END
        );
        
        RAISE NOTICE '✅ Master admin user created in auth.users';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create master admin in auth.users: %', SQLERRM;
    END;
    
    -- 4. Create Client User with flexible columns
    RAISE NOTICE '';
    RAISE NOTICE '👤 4. CREATING CLIENT USER...';
    
    BEGIN
        EXECUTE format('
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                created_at,
                updated_at,
                role,
                aud
                %s
                %s
                %s
            ) VALUES (
                %L,
                %L,
                crypt(%L, gen_salt(''bf'')),
                NOW(),
                NOW(),
                ''authenticated'',
                ''authenticated''
                %s
                %s
                %s
            )',
            CASE WHEN has_email_confirmed THEN ', email_confirmed' ELSE '' END,
            CASE WHEN has_email_confirmed_at THEN ', email_confirmed_at' ELSE '' END,
            CASE WHEN has_confirmation_token THEN ', confirmation_token' ELSE '' END,
            client_user_id,
            'hotel@exemplo.com',
            '123456789',
            CASE WHEN has_email_confirmed THEN ', true' ELSE '' END,
            CASE WHEN has_email_confirmed_at THEN ', NOW()' ELSE '' END,
            CASE WHEN has_confirmation_token THEN ', ''''''' ELSE '' END
        );
        
        RAISE NOTICE '✅ Client user created in auth.users';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create client in auth.users: %', SQLERRM;
    END;
    
    -- 5. Create identities
    RAISE NOTICE '';
    RAISE NOTICE '🔐 5. CREATING IDENTITIES...';
    
    -- Master Admin Identity
    BEGIN
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            provider,
            identity_data,
            created_at,
            updated_at,
            email
        ) VALUES (
            gen_random_uuid(),
            admin_user_id,
            'admin@baitahotel.com',
            'email',
            jsonb_build_object(
                'sub', admin_user_id::text,
                'email', 'admin@baitahotel.com',
                'email_verified', true
            ),
            NOW(),
            NOW(),
            'admin@baitahotel.com'
        );
        
        RAISE NOTICE '✅ Master admin identity created';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create master admin identity: %', SQLERRM;
    END;
    
    -- Client Identity
    BEGIN
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            provider,
            identity_data,
            created_at,
            updated_at,
            email
        ) VALUES (
            gen_random_uuid(),
            client_user_id,
            'hotel@exemplo.com',
            'email',
            jsonb_build_object(
                'sub', client_user_id::text,
                'email', 'hotel@exemplo.com',
                'email_verified', true
            ),
            NOW(),
            NOW(),
            'hotel@exemplo.com'
        );
        
        RAISE NOTICE '✅ Client identity created';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create client identity: %', SQLERRM;
    END;
    
    -- 6. Verify creation
    RAISE NOTICE '';
    RAISE NOTICE '✅ 6. VERIFYING CREATION...';
    
    BEGIN
        FOR rec IN 
            EXECUTE 'SELECT id, email FROM auth.users WHERE email IN (''admin@baitahotel.com'', ''hotel@exemplo.com'') ORDER BY email'
        LOOP
            RAISE NOTICE '  ✅ Auth user: % (%)', rec.email, rec.id;
        END LOOP;
        
        FOR rec IN 
            EXECUTE 'SELECT user_id, email, provider FROM auth.identities WHERE email IN (''admin@baitahotel.com'', ''hotel@exemplo.com'') ORDER BY email'
        LOOP
            RAISE NOTICE '  ✅ Identity: % (%) - Provider: %', rec.email, rec.user_id, rec.provider;
        END LOOP;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Verification failed: %', SQLERRM;
    END;
    
    -- 7. Test password hashing
    RAISE NOTICE '';
    RAISE NOTICE '🔐 7. TESTING PASSWORD HASHING...';
    
    BEGIN
        FOR rec IN 
            EXECUTE 'SELECT email, (encrypted_password = crypt(''123456789'', encrypted_password)) as password_valid FROM auth.users WHERE email IN (''admin@baitahotel.com'', ''hotel@exemplo.com'')'
        LOOP
            RAISE NOTICE '  Password test for %: %', 
                rec.email, 
                CASE WHEN rec.password_valid THEN '✅ Valid' ELSE '❌ Invalid' END;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Password test failed: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 === FLEXIBLE AUTH USER CREATION COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST CREDENTIALS:';
    RAISE NOTICE '  Master Admin: admin@baitahotel.com / 123456789';
    RAISE NOTICE '  Client: hotel@exemplo.com / 123456789';
    
END $$;
