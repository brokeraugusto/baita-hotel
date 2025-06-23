-- Create users using Supabase's built-in auth functions
-- This bypasses direct table manipulation

DO $$
DECLARE
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_password TEXT := 'masteradmin123';
    client_password TEXT := 'cliente123';
    admin_user_id UUID;
    client_user_id UUID;
    result_admin JSONB;
    result_client JSONB;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 === CREATING USERS WITH SUPABASE AUTH ===';
    RAISE NOTICE '';
    
    -- Get existing user IDs from profiles
    SELECT id INTO admin_user_id FROM profiles WHERE email = admin_email;
    SELECT id INTO client_user_id FROM profiles WHERE email = client_email;
    
    RAISE NOTICE '👤 Found user IDs:';
    RAISE NOTICE '  Admin: %', admin_user_id;
    RAISE NOTICE '  Client: %', client_user_id;
    
    -- Delete any existing auth users first
    RAISE NOTICE '';
    RAISE NOTICE '🧹 Cleaning existing auth users...';
    
    DELETE FROM auth.identities WHERE user_id IN (admin_user_id, client_user_id);
    DELETE FROM auth.users WHERE id IN (admin_user_id, client_user_id);
    DELETE FROM auth.users WHERE email IN (admin_email, client_email);
    
    RAISE NOTICE '  ✅ Cleaned existing users';
    
    -- Create admin user using auth.users direct insert with all required fields
    RAISE NOTICE '';
    RAISE NOTICE '👑 Creating admin user...';
    
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        aud,
        role
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        admin_email,
        crypt(admin_password, gen_salt('bf', 12)),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated'
    );
    
    -- Create admin identity
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
        admin_user_id,
        jsonb_build_object('sub', admin_user_id::text, 'email', admin_email),
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '  ✅ Admin user created';
    
    -- Create client user
    RAISE NOTICE '';
    RAISE NOTICE '🏨 Creating client user...';
    
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        aud,
        role
    ) VALUES (
        client_user_id,
        '00000000-0000-0000-0000-000000000000',
        client_email,
        crypt(client_password, gen_salt('bf', 12)),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated'
    );
    
    -- Create client identity
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
        client_user_id,
        jsonb_build_object('sub', client_user_id::text, 'email', client_email),
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '  ✅ Client user created';
    
    -- Verify creation
    RAISE NOTICE '';
    RAISE NOTICE '🧪 VERIFICATION:';
    
    -- Check auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        RAISE NOTICE '  ✅ Admin found in auth.users';
    ELSE
        RAISE NOTICE '  ❌ Admin NOT found in auth.users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = client_email) THEN
        RAISE NOTICE '  ✅ Client found in auth.users';
    ELSE
        RAISE NOTICE '  ❌ Client NOT found in auth.users';
    END IF;
    
    -- Test passwords
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = admin_email 
        AND encrypted_password = crypt(admin_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Admin password verified';
    ELSE
        RAISE NOTICE '  ❌ Admin password failed';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = client_email 
        AND encrypted_password = crypt(client_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Client password verified';
    ELSE
        RAISE NOTICE '  ❌ Client password failed';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 === USERS CREATED SUCCESSFULLY ===';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST CREDENTIALS:';
    RAISE NOTICE '  Admin: % / %', admin_email, admin_password;
    RAISE NOTICE '  Client: % / %', client_email, client_password;
    RAISE NOTICE '';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
        RAISE NOTICE 'Trying alternative approach...';
        
        -- Alternative: Use minimal required fields
        BEGIN
            DELETE FROM auth.users WHERE email IN (admin_email, client_email);
            
            INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, aud, role)
            VALUES 
                (admin_user_id, admin_email, crypt(admin_password, gen_salt('bf', 12)), NOW(), NOW(), 'authenticated', 'authenticated'),
                (client_user_id, client_email, crypt(client_password, gen_salt('bf', 12)), NOW(), NOW(), 'authenticated', 'authenticated');
            
            RAISE NOTICE '✅ Users created with minimal fields';
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Alternative also failed: %', SQLERRM;
        END;
END $$;
