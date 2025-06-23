-- Fixed Secure Password Update Script
-- Updates passwords for existing users without conflicting with profiles

DO $$
DECLARE
    rec RECORD;
    admin_user_id UUID;
    client_user_id UUID;
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_new_password TEXT := 'masteradmin123';
    client_new_password TEXT := 'cliente123';
    hashed_admin_password TEXT;
    hashed_client_password TEXT;
    update_count INTEGER;
    auth_user_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔐 === FIXED SECURE PASSWORD UPDATE PROCESS ===';
    RAISE NOTICE 'Working with existing profiles, updating auth system only';
    RAISE NOTICE 'Admin: % -> New Password: %', admin_email, admin_new_password;
    RAISE NOTICE 'Client: % -> New Password: %', client_email, client_new_password;
    RAISE NOTICE '';
    
    -- Step 1: Get existing user IDs from profiles table
    RAISE NOTICE '👤 1. RETRIEVING EXISTING USER IDS FROM PROFILES...';
    
    BEGIN
        -- Get admin user ID
        SELECT id INTO admin_user_id 
        FROM profiles 
        WHERE email = admin_email;
        
        IF admin_user_id IS NULL THEN
            RAISE EXCEPTION 'Admin user not found in profiles table: %', admin_email;
        END IF;
        
        RAISE NOTICE '  ✅ Admin user ID: %', admin_user_id;
        
        -- Get client user ID
        SELECT id INTO client_user_id 
        FROM profiles 
        WHERE email = client_email;
        
        IF client_user_id IS NULL THEN
            RAISE EXCEPTION 'Client user not found in profiles table: %', client_email;
        END IF;
        
        RAISE NOTICE '  ✅ Client user ID: %', client_user_id;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Failed to retrieve user IDs: %', SQLERRM;
    END;
    
    -- Step 2: Generate secure hashed passwords using bcrypt with salt
    RAISE NOTICE '';
    RAISE NOTICE '🧂 2. GENERATING SECURE HASHED PASSWORDS...';
    
    BEGIN
        -- Generate bcrypt hash with salt for admin password
        SELECT crypt(admin_new_password, gen_salt('bf', 12)) INTO hashed_admin_password;
        RAISE NOTICE '  ✅ Admin password hashed with bcrypt (cost: 12)';
        
        -- Generate bcrypt hash with salt for client password  
        SELECT crypt(client_new_password, gen_salt('bf', 12)) INTO hashed_client_password;
        RAISE NOTICE '  ✅ Client password hashed with bcrypt (cost: 12)';
        
        -- Verify hashes were generated
        IF hashed_admin_password IS NULL OR hashed_client_password IS NULL THEN
            RAISE EXCEPTION 'Failed to generate password hashes';
        END IF;
        
        RAISE NOTICE '  ✅ Password hashing completed successfully';
        RAISE NOTICE '  📏 Admin hash length: % characters', LENGTH(hashed_admin_password);
        RAISE NOTICE '  📏 Client hash length: % characters', LENGTH(hashed_client_password);
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Password hashing failed: %', SQLERRM;
    END;
    
    -- Step 3: Handle auth.users table (create or update)
    RAISE NOTICE '';
    RAISE NOTICE '🔄 3. MANAGING AUTH.USERS TABLE...';
    
    BEGIN
        -- Handle admin user in auth.users
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = admin_user_id) INTO auth_user_exists;
        
        IF auth_user_exists THEN
            RAISE NOTICE '  🔄 Updating existing admin user in auth.users...';
            
            UPDATE auth.users 
            SET 
                encrypted_password = hashed_admin_password,
                email = admin_email,
                updated_at = NOW(),
                email_confirmed_at = COALESCE(email_confirmed_at, NOW())
            WHERE id = admin_user_id;
            
            GET DIAGNOSTICS update_count = ROW_COUNT;
            RAISE NOTICE '  ✅ Admin user updated (% rows affected)', update_count;
        ELSE
            RAISE NOTICE '  🆕 Creating new admin user in auth.users...';
            
            INSERT INTO auth.users (
                id, email, encrypted_password, 
                email_confirmed_at, created_at, updated_at,
                aud, role, instance_id
            ) VALUES (
                admin_user_id, admin_email, hashed_admin_password,
                NOW(), NOW(), NOW(),
                'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'
            );
            
            RAISE NOTICE '  ✅ Admin user created in auth.users';
        END IF;
        
        -- Handle client user in auth.users
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = client_user_id) INTO auth_user_exists;
        
        IF auth_user_exists THEN
            RAISE NOTICE '  🔄 Updating existing client user in auth.users...';
            
            UPDATE auth.users 
            SET 
                encrypted_password = hashed_client_password,
                email = client_email,
                updated_at = NOW(),
                email_confirmed_at = COALESCE(email_confirmed_at, NOW())
            WHERE id = client_user_id;
            
            GET DIAGNOSTICS update_count = ROW_COUNT;
            RAISE NOTICE '  ✅ Client user updated (% rows affected)', update_count;
        ELSE
            RAISE NOTICE '  🆕 Creating new client user in auth.users...';
            
            INSERT INTO auth.users (
                id, email, encrypted_password, 
                email_confirmed_at, created_at, updated_at,
                aud, role, instance_id
            ) VALUES (
                client_user_id, client_email, hashed_client_password,
                NOW(), NOW(), NOW(),
                'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000'
            );
            
            RAISE NOTICE '  ✅ Client user created in auth.users';
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Auth users management failed: %', SQLERRM;
    END;
    
    -- Step 4: Handle auth.identities table
    RAISE NOTICE '';
    RAISE NOTICE '🆔 4. MANAGING AUTH IDENTITIES...';
    
    BEGIN
        -- Handle admin identity
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, 
            created_at, updated_at, last_sign_in_at
        ) VALUES (
            gen_random_uuid(), admin_user_id,
            jsonb_build_object(
                'sub', admin_user_id::text,
                'email', admin_email,
                'email_verified', true,
                'phone_verified', false
            ),
            'email', NOW(), NOW(), NULL
        ) ON CONFLICT (provider, user_id) DO UPDATE SET
            identity_data = EXCLUDED.identity_data,
            updated_at = NOW();
        
        RAISE NOTICE '  ✅ Admin identity created/updated';
        
        -- Handle client identity
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, 
            created_at, updated_at, last_sign_in_at
        ) VALUES (
            gen_random_uuid(), client_user_id,
            jsonb_build_object(
                'sub', client_user_id::text,
                'email', client_email,
                'email_verified', true,
                'phone_verified', false
            ),
            'email', NOW(), NOW(), NULL
        ) ON CONFLICT (provider, user_id) DO UPDATE SET
            identity_data = EXCLUDED.identity_data,
            updated_at = NOW();
        
        RAISE NOTICE '  ✅ Client identity created/updated';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️ Identity management warning: %', SQLERRM;
            RAISE NOTICE '  ℹ️ This is often normal if identities table has different constraints';
    END;
    
    -- Step 5: Verify password hashes work correctly
    RAISE NOTICE '';
    RAISE NOTICE '🧪 5. VERIFYING PASSWORD HASHES...';
    
    BEGIN
        -- Test admin password
        FOR rec IN 
            SELECT 
                u.email,
                u.id,
                (u.encrypted_password = crypt(admin_new_password, u.encrypted_password)) as password_valid,
                u.encrypted_password IS NOT NULL as has_password,
                u.email_confirmed_at IS NOT NULL as email_confirmed,
                LENGTH(u.encrypted_password) as hash_length,
                (u.encrypted_password LIKE '$2%') as is_bcrypt_format
            FROM auth.users u
            WHERE u.id = admin_user_id
        LOOP
            RAISE NOTICE '  👤 Admin User: %', rec.email;
            RAISE NOTICE '    🆔 ID: %', rec.id;
            RAISE NOTICE '    🔐 Password Valid: %', rec.password_valid;
            RAISE NOTICE '    📝 Has Password: %', rec.has_password;
            RAISE NOTICE '    ✉️ Email Confirmed: %', rec.email_confirmed;
            RAISE NOTICE '    📏 Hash Length: % chars', rec.hash_length;
            RAISE NOTICE '    🔒 bcrypt Format: %', rec.is_bcrypt_format;
            
            IF NOT rec.password_valid THEN
                RAISE EXCEPTION 'Admin password verification failed';
            END IF;
        END LOOP;
        
        -- Test client password
        FOR rec IN 
            SELECT 
                u.email,
                u.id,
                (u.encrypted_password = crypt(client_new_password, u.encrypted_password)) as password_valid,
                u.encrypted_password IS NOT NULL as has_password,
                u.email_confirmed_at IS NOT NULL as email_confirmed,
                LENGTH(u.encrypted_password) as hash_length,
                (u.encrypted_password LIKE '$2%') as is_bcrypt_format
            FROM auth.users u
            WHERE u.id = client_user_id
        LOOP
            RAISE NOTICE '  👤 Client User: %', rec.email;
            RAISE NOTICE '    🆔 ID: %', rec.id;
            RAISE NOTICE '    🔐 Password Valid: %', rec.password_valid;
            RAISE NOTICE '    📝 Has Password: %', rec.has_password;
            RAISE NOTICE '    ✉️ Email Confirmed: %', rec.email_confirmed;
            RAISE NOTICE '    📏 Hash Length: % chars', rec.hash_length;
            RAISE NOTICE '    🔒 bcrypt Format: %', rec.is_bcrypt_format;
            
            IF NOT rec.password_valid THEN
                RAISE EXCEPTION 'Client password verification failed';
            END IF;
        END LOOP;
        
        RAISE NOTICE '  ✅ All password verifications passed';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Password verification failed: %', SQLERRM;
    END;
    
    -- Step 6: Final system verification
    RAISE NOTICE '';
    RAISE NOTICE '📊 6. FINAL SYSTEM VERIFICATION...';
    
    BEGIN
        -- Verify profiles exist and are linked
        FOR rec IN 
            SELECT 
                p.email,
                p.id,
                p.role,
                p.full_name,
                (SELECT COUNT(*) FROM auth.users au WHERE au.id = p.id) as has_auth_user
            FROM profiles p
            WHERE p.email IN (admin_email, client_email)
            ORDER BY p.email
        LOOP
            RAISE NOTICE '  📋 Profile: % (%)', rec.email, rec.role;
            RAISE NOTICE '    🆔 ID: %', rec.id;
            RAISE NOTICE '    👤 Name: %', rec.full_name;
            RAISE NOTICE '    🔗 Has Auth User: %', (rec.has_auth_user > 0);
        END LOOP;
        
        -- Count totals
        SELECT COUNT(*) INTO update_count 
        FROM auth.users 
        WHERE id IN (admin_user_id, client_user_id);
        
        RAISE NOTICE '';
        RAISE NOTICE '  📊 Summary:';
        RAISE NOTICE '    Auth Users: %/2', update_count;
        
        SELECT COUNT(*) INTO update_count 
        FROM auth.identities 
        WHERE user_id IN (admin_user_id, client_user_id);
        
        RAISE NOTICE '    Auth Identities: %', update_count;
        
        SELECT COUNT(*) INTO update_count 
        FROM profiles 
        WHERE id IN (admin_user_id, client_user_id);
        
        RAISE NOTICE '    Profiles: %/2', update_count;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️ Verification warning: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 === PASSWORD UPDATE COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '📋 UPDATED CREDENTIALS FOR TESTING:';
    RAISE NOTICE '  🔑 Admin: % / %', admin_email, admin_new_password;
    RAISE NOTICE '  🔑 Client: % / %', client_email, client_new_password;
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SECURITY FEATURES IMPLEMENTED:';
    RAISE NOTICE '  ✅ bcrypt hashing with cost factor 12';
    RAISE NOTICE '  ✅ Automatic salt generation per password';
    RAISE NOTICE '  ✅ Password verification testing passed';
    RAISE NOTICE '  ✅ Secure database updates completed';
    RAISE NOTICE '  ✅ Identity synchronization attempted';
    RAISE NOTICE '  ✅ Existing profiles preserved';
    RAISE NOTICE '';
    RAISE NOTICE '✅ === READY FOR LOGIN TESTING ===';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 NEXT STEPS:';
    RAISE NOTICE '  1. Visit /test-new-credentials';
    RAISE NOTICE '  2. Test both sets of credentials';
    RAISE NOTICE '  3. Verify successful authentication';
    RAISE NOTICE '  4. Check user roles and permissions';
    
END $$;
