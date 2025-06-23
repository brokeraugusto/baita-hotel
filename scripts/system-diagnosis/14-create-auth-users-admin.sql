-- Create Auth Users using Admin Functions
-- This approach uses Supabase's built-in admin functions

DO $$
DECLARE
    admin_user_id UUID := '11111111-1111-1111-1111-111111111111';
    client_user_id UUID := '22222222-2222-2222-2222-222222222222';
    result RECORD;
BEGIN
    RAISE NOTICE '🔧 === CREATING AUTH USERS WITH ADMIN FUNCTIONS ===';
    
    -- 1. Create Master Admin User
    RAISE NOTICE '';
    RAISE NOTICE '👤 1. CREATING MASTER ADMIN USER...';
    
    BEGIN
        -- Delete existing auth user if exists
        DELETE FROM auth.users WHERE id = admin_user_id;
        DELETE FROM auth.identities WHERE user_id = admin_user_id;
        
        -- Create new auth user
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            admin_user_id,
            'admin@baitahotel.com',
            crypt('123456789', gen_salt('bf')),
            true,
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        
        -- Create identity
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
        
        RAISE NOTICE '✅ Master admin user created successfully';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create master admin: %', SQLERRM;
    END;
    
    -- 2. Create Client User
    RAISE NOTICE '';
    RAISE NOTICE '👤 2. CREATING CLIENT USER...';
    
    BEGIN
        -- Delete existing auth user if exists
        DELETE FROM auth.users WHERE id = client_user_id;
        DELETE FROM auth.identities WHERE user_id = client_user_id;
        
        -- Create new auth user
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            client_user_id,
            'hotel@exemplo.com',
            crypt('123456789', gen_salt('bf')),
            true,
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        
        -- Create identity
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
        
        RAISE NOTICE '✅ Client user created successfully';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create client user: %', SQLERRM;
    END;
    
    -- 3. Verify creation
    RAISE NOTICE '';
    RAISE NOTICE '✅ 3. VERIFYING USER CREATION...';
    
    FOR result IN 
        SELECT u.id, u.email, u.email_confirmed, i.provider
        FROM auth.users u
        LEFT JOIN auth.identities i ON u.id = i.user_id
        WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        ORDER BY u.email
    LOOP
        RAISE NOTICE '  ✅ User: % (%) - Confirmed: % - Provider: %', 
            result.email, result.id, result.email_confirmed, result.provider;
    END LOOP;
    
    -- 4. Test password hashing
    RAISE NOTICE '';
    RAISE NOTICE '🔐 4. TESTING PASSWORD HASHING...';
    
    FOR result IN 
        SELECT email, 
               (encrypted_password = crypt('123456789', encrypted_password)) as password_valid
        FROM auth.users 
        WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
    LOOP
        RAISE NOTICE '  Password test for %: %', 
            result.email, 
            CASE WHEN result.password_valid THEN '✅ Valid' ELSE '❌ Invalid' END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 === AUTH USER CREATION COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST CREDENTIALS:';
    RAISE NOTICE '  Master Admin: admin@baitahotel.com / 123456789';
    RAISE NOTICE '  Client: hotel@exemplo.com / 123456789';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. Test login immediately after running this script';
    RAISE NOTICE '2. If still failing, check Supabase Auth settings in dashboard';
    RAISE NOTICE '3. Ensure email confirmation is disabled';
    RAISE NOTICE '4. Check for any RLS policies blocking auth queries';
    
END $$;
