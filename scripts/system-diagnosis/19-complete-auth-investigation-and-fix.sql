-- Complete Auth Investigation and Fix
-- This script investigates the auth schema and creates users properly

DO $$
DECLARE
    rec RECORD;
    table_exists BOOLEAN;
    user_count INTEGER := 0;
    auth_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 === COMPLETE AUTH INVESTIGATION AND FIX ===';
    
    -- 1. Check auth schema structure
    RAISE NOTICE '';
    RAISE NOTICE '📋 1. INVESTIGATING AUTH SCHEMA...';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ auth.users table exists';
        
        -- Show column structure
        RAISE NOTICE '  Columns in auth.users:';
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '    - % (%)', rec.column_name, rec.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ auth.users table does not exist - cannot proceed';
        RETURN;
    END IF;
    
    -- 2. Check current auth users
    RAISE NOTICE '';
    RAISE NOTICE '👤 2. CHECKING CURRENT AUTH USERS...';
    
    BEGIN
        SELECT COUNT(*) INTO user_count FROM auth.users;
        RAISE NOTICE '  Total auth users: %', user_count;
        
        -- Check for our specific users
        FOR rec IN 
            SELECT id, email FROM auth.users 
            WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY email
        LOOP
            RAISE NOTICE '  ✅ Found auth user: % (%)', rec.email, rec.id;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot access auth.users: %', SQLERRM;
    END;
    
    -- 3. Create missing auth users
    RAISE NOTICE '';
    RAISE NOTICE '🔧 3. CREATING MISSING AUTH USERS...';
    
    -- Create Master Admin
    BEGIN
        -- Check if auth user exists
        SELECT COUNT(*) INTO user_count 
        FROM auth.users 
        WHERE email = 'admin@baitahotel.com';
        
        IF user_count = 0 THEN
            RAISE NOTICE '  Creating auth user for admin@baitahotel.com...';
            
            -- Use the profile ID as auth user ID for consistency
            auth_user_id := '11111111-1111-1111-1111-111111111111'::UUID;
            
            -- Insert into auth.users
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                confirmation_token,
                recovery_token,
                email_change_token_new,
                email_change
            ) VALUES (
                auth_user_id,
                'admin@baitahotel.com',
                crypt('123456789', gen_salt('bf')),
                NOW(),
                NOW(),
                NOW(),
                '',
                '',
                '',
                ''
            );
            
            -- Insert into auth.identities
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                last_sign_in_at,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                auth_user_id,
                jsonb_build_object(
                    'sub', auth_user_id::text,
                    'email', 'admin@baitahotel.com'
                ),
                'email',
                NOW(),
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '  ✅ Created auth user for admin@baitahotel.com';
        ELSE
            RAISE NOTICE '  ℹ️ Auth user for admin@baitahotel.com already exists';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Failed to create admin user: %', SQLERRM;
    END;
    
    -- Create Client User
    BEGIN
        -- Check if auth user exists
        SELECT COUNT(*) INTO user_count 
        FROM auth.users 
        WHERE email = 'hotel@exemplo.com';
        
        IF user_count = 0 THEN
            RAISE NOTICE '  Creating auth user for hotel@exemplo.com...';
            
            -- Use the profile ID as auth user ID for consistency
            auth_user_id := '22222222-2222-2222-2222-222222222222'::UUID;
            
            -- Insert into auth.users
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                confirmation_token,
                recovery_token,
                email_change_token_new,
                email_change
            ) VALUES (
                auth_user_id,
                'hotel@exemplo.com',
                crypt('123456789', gen_salt('bf')),
                NOW(),
                NOW(),
                NOW(),
                '',
                '',
                '',
                ''
            );
            
            -- Insert into auth.identities
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                last_sign_in_at,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                auth_user_id,
                jsonb_build_object(
                    'sub', auth_user_id::text,
                    'email', 'hotel@exemplo.com'
                ),
                'email',
                NOW(),
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '  ✅ Created auth user for hotel@exemplo.com';
        ELSE
            RAISE NOTICE '  ℹ️ Auth user for hotel@exemplo.com already exists';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Failed to create client user: %', SQLERRM;
    END;
    
    -- 4. Verify creation
    RAISE NOTICE '';
    RAISE NOTICE '✅ 4. VERIFYING AUTH USER CREATION...';
    
    BEGIN
        FOR rec IN 
            SELECT id, email FROM auth.users 
            WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY email
        LOOP
            RAISE NOTICE '  ✅ Auth user verified: % (%)', rec.email, rec.id;
        END LOOP;
        
        -- Check identities
        FOR rec IN 
            SELECT user_id, provider, identity_data->>'email' as email 
            FROM auth.identities 
            WHERE identity_data->>'email' IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY identity_data->>'email'
        LOOP
            RAISE NOTICE '  ✅ Identity verified: % (%) - Provider: %', 
                rec.email, rec.user_id, rec.provider;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Verification failed: %', SQLERRM;
    END;
    
    -- 5. Test password validation
    RAISE NOTICE '';
    RAISE NOTICE '🔐 5. TESTING PASSWORD VALIDATION...';
    
    BEGIN
        FOR rec IN 
            SELECT 
                email,
                (encrypted_password = crypt('123456789', encrypted_password)) as password_valid
            FROM auth.users 
            WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        LOOP
            RAISE NOTICE '  Password test for %: %', 
                rec.email, 
                CASE WHEN rec.password_valid THEN '✅ VALID' ELSE '❌ INVALID' END;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Password test failed: %', SQLERRM;
    END;
    
    -- 6. Final summary
    RAISE NOTICE '';
    RAISE NOTICE '📊 === FINAL SUMMARY ===';
    
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE '  Total auth users: %', user_count;
    
    SELECT COUNT(*) INTO user_count 
    FROM auth.users 
    WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');
    RAISE NOTICE '  Our test users in auth: %', user_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 READY TO TEST LOGIN:';
    RAISE NOTICE '  - admin@baitahotel.com / 123456789';
    RAISE NOTICE '  - hotel@exemplo.com / 123456789';
    RAISE NOTICE '';
    RAISE NOTICE '✅ === AUTH SYSTEM FIX COMPLETE ===';
    
END $$;
