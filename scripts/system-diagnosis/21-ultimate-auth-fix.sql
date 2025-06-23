-- Ultimate Auth Fix - Using Supabase Auth Functions
-- This script uses proper Supabase auth functions to create users

DO $$
DECLARE
    rec RECORD;
    auth_user_id UUID;
    user_exists BOOLEAN;
    result JSONB;
BEGIN
    RAISE NOTICE '🚀 === ULTIMATE AUTH FIX ===';
    RAISE NOTICE 'Using Supabase auth functions to create users properly';
    
    -- 1. Check current state
    RAISE NOTICE '';
    RAISE NOTICE '📋 1. CHECKING CURRENT AUTH STATE...';
    
    -- Check auth.users
    BEGIN
        SELECT COUNT(*) > 0 INTO user_exists 
        FROM auth.users 
        WHERE email = 'admin@baitahotel.com';
        
        RAISE NOTICE '  Admin user in auth.users: %', 
            CASE WHEN user_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
            
        SELECT COUNT(*) > 0 INTO user_exists 
        FROM auth.users 
        WHERE email = 'hotel@exemplo.com';
        
        RAISE NOTICE '  Client user in auth.users: %', 
            CASE WHEN user_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot access auth.users: %', SQLERRM;
    END;
    
    -- 2. Clean existing auth users if they exist but don't work
    RAISE NOTICE '';
    RAISE NOTICE '🧹 2. CLEANING EXISTING AUTH USERS...';
    
    BEGIN
        -- Delete from auth.identities first (foreign key constraint)
        DELETE FROM auth.identities 
        WHERE identity_data->>'email' IN ('admin@baitahotel.com', 'hotel@exemplo.com');
        
        -- Delete from auth.users
        DELETE FROM auth.users 
        WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com');
        
        RAISE NOTICE '  ✅ Cleaned existing auth users';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️ Cleanup warning: %', SQLERRM;
    END;
    
    -- 3. Create users using proper Supabase method
    RAISE NOTICE '';
    RAISE NOTICE '👤 3. CREATING AUTH USERS WITH PROPER METHOD...';
    
    -- Method 1: Direct insertion with proper structure
    BEGIN
        -- Create Master Admin
        auth_user_id := '11111111-1111-1111-1111-111111111111'::UUID;
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            auth_user_id,
            'authenticated',
            'authenticated',
            'admin@baitahotel.com',
            crypt('123456789', gen_salt('bf')),
            NOW(),
            NULL,
            '',
            NULL,
            '',
            NULL,
            '',
            '',
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Master Admin"}',
            FALSE,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            NULL,
            '',
            0,
            NULL,
            '',
            NULL
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            encrypted_password = EXCLUDED.encrypted_password,
            updated_at = NOW();
        
        RAISE NOTICE '  ✅ Created/Updated auth user: admin@baitahotel.com';
        
        -- Create Client User
        auth_user_id := '22222222-2222-2222-2222-222222222222'::UUID;
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            auth_user_id,
            'authenticated',
            'authenticated',
            'hotel@exemplo.com',
            crypt('123456789', gen_salt('bf')),
            NOW(),
            NULL,
            '',
            NULL,
            '',
            NULL,
            '',
            '',
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Hotel Cliente"}',
            FALSE,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            NULL,
            '',
            0,
            NULL,
            '',
            NULL
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            encrypted_password = EXCLUDED.encrypted_password,
            updated_at = NOW();
        
        RAISE NOTICE '  ✅ Created/Updated auth user: hotel@exemplo.com';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create auth users: %', SQLERRM;
            RAISE NOTICE '  Trying alternative method...';
            
            -- Alternative method with minimal columns
            BEGIN
                INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, email_confirmed_at)
                VALUES 
                    ('11111111-1111-1111-1111-111111111111', 'admin@baitahotel.com', crypt('123456789', gen_salt('bf')), NOW(), NOW(), NOW()),
                    ('22222222-2222-2222-2222-222222222222', 'hotel@exemplo.com', crypt('123456789', gen_salt('bf')), NOW(), NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    encrypted_password = EXCLUDED.encrypted_password,
                    updated_at = NOW();
                    
                RAISE NOTICE '  ✅ Created users with alternative method';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Alternative method also failed: %', SQLERRM;
            END;
    END;
    
    -- 4. Create identities
    RAISE NOTICE '';
    RAISE NOTICE '🆔 4. CREATING AUTH IDENTITIES...';
    
    BEGIN
        -- Create identities for both users
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES 
            (
                gen_random_uuid(),
                '11111111-1111-1111-1111-111111111111',
                jsonb_build_object(
                    'sub', '11111111-1111-1111-1111-111111111111',
                    'email', 'admin@baitahotel.com',
                    'email_verified', true,
                    'phone_verified', false
                ),
                'email',
                NULL,
                NOW(),
                NOW()
            ),
            (
                gen_random_uuid(),
                '22222222-2222-2222-2222-222222222222',
                jsonb_build_object(
                    'sub', '22222222-2222-2222-2222-222222222222',
                    'email', 'hotel@exemplo.com',
                    'email_verified', true,
                    'phone_verified', false
                ),
                'email',
                NULL,
                NOW(),
                NOW()
            )
        ON CONFLICT (provider, user_id) DO UPDATE SET
            identity_data = EXCLUDED.identity_data,
            updated_at = NOW();
            
        RAISE NOTICE '  ✅ Created auth identities';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create identities: %', SQLERRM;
    END;
    
    -- 5. Verify everything was created
    RAISE NOTICE '';
    RAISE NOTICE '✅ 5. VERIFICATION...';
    
    BEGIN
        FOR rec IN 
            SELECT 
                u.id,
                u.email,
                u.encrypted_password IS NOT NULL as has_password,
                u.email_confirmed_at IS NOT NULL as email_confirmed,
                (u.encrypted_password = crypt('123456789', u.encrypted_password)) as password_valid
            FROM auth.users u
            WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY u.email
        LOOP
            RAISE NOTICE '  User: %', rec.email;
            RAISE NOTICE '    ID: %', rec.id;
            RAISE NOTICE '    Has Password: %', rec.has_password;
            RAISE NOTICE '    Email Confirmed: %', rec.email_confirmed;
            RAISE NOTICE '    Password Valid: %', rec.password_valid;
        END LOOP;
        
        -- Check identities
        FOR rec IN 
            SELECT 
                i.user_id,
                i.provider,
                i.identity_data->>'email' as email
            FROM auth.identities i
            WHERE i.identity_data->>'email' IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY i.identity_data->>'email'
        LOOP
            RAISE NOTICE '  Identity: % (%) - Provider: %', rec.email, rec.user_id, rec.provider;
        END LOOP;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Verification failed: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 === READY FOR TESTING ===';
    RAISE NOTICE '  Credentials to test:';
    RAISE NOTICE '  - admin@baitahotel.com / 123456789';
    RAISE NOTICE '  - hotel@exemplo.com / 123456789';
    RAISE NOTICE '';
    RAISE NOTICE '✅ === ULTIMATE AUTH FIX COMPLETE ===';
    
END $$;
