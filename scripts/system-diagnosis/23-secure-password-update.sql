-- Secure Password Update Script
-- Updates passwords for admin and client users with proper hashing and salting

DO $$
DECLARE
    rec RECORD;
    admin_user_id UUID := '11111111-1111-1111-1111-111111111111';
    client_user_id UUID := '22222222-2222-2222-2222-222222222222';
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_new_password TEXT := 'masteradmin123';
    client_new_password TEXT := 'cliente123';
    hashed_admin_password TEXT;
    hashed_client_password TEXT;
    update_count INTEGER;
BEGIN
    RAISE NOTICE '🔐 === SECURE PASSWORD UPDATE PROCESS ===';
    RAISE NOTICE 'Updating passwords with bcrypt hashing and salt';
    RAISE NOTICE 'Admin: % -> New Password: %', admin_email, admin_new_password;
    RAISE NOTICE 'Client: % -> New Password: %', client_email, client_new_password;
    RAISE NOTICE '';
    
    -- Step 1: Generate secure hashed passwords using bcrypt with salt
    RAISE NOTICE '🧂 1. GENERATING SECURE HASHED PASSWORDS...';
    
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
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Password hashing failed: %', SQLERRM;
    END;
    
    -- Step 2: Verify users exist in auth.users table
    RAISE NOTICE '';
    RAISE NOTICE '👤 2. VERIFYING USERS EXIST IN AUTH SYSTEM...';
    
    BEGIN
        -- Check admin user
        SELECT COUNT(*) INTO update_count 
        FROM auth.users 
        WHERE id = admin_user_id AND email = admin_email;
        
        IF update_count = 0 THEN
            RAISE NOTICE '  ⚠️ Admin user not found in auth.users, creating...';
            
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
        ELSE
            RAISE NOTICE '  ✅ Admin user exists in auth.users';
        END IF;
        
        -- Check client user
        SELECT COUNT(*) INTO update_count 
        FROM auth.users 
        WHERE id = client_user_id AND email = client_email;
        
        IF update_count = 0 THEN
            RAISE NOTICE '  ⚠️ Client user not found in auth.users, creating...';
            
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
        ELSE
            RAISE NOTICE '  ✅ Client user exists in auth.users';
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'User verification/creation failed: %', SQLERRM;
    END;
    
    -- Step 3: Update passwords in auth.users table
    RAISE NOTICE '';
    RAISE NOTICE '🔄 3. UPDATING PASSWORDS IN AUTH SYSTEM...';
    
    BEGIN
        -- Update admin password
        UPDATE auth.users 
        SET 
            encrypted_password = hashed_admin_password,
            updated_at = NOW()
        WHERE id = admin_user_id AND email = admin_email;
        
        GET DIAGNOSTICS update_count = ROW_COUNT;
        
        IF update_count > 0 THEN
            RAISE NOTICE '  ✅ Admin password updated successfully';
        ELSE
            RAISE EXCEPTION 'Failed to update admin password - user not found';
        END IF;
        
        -- Update client password
        UPDATE auth.users 
        SET 
            encrypted_password = hashed_client_password,
            updated_at = NOW()
        WHERE id = client_user_id AND email = client_email;
        
        GET DIAGNOSTICS update_count = ROW_COUNT;
        
        IF update_count > 0 THEN
            RAISE NOTICE '  ✅ Client password updated successfully';
        ELSE
            RAISE EXCEPTION 'Failed to update client password - user not found';
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Password update failed: %', SQLERRM;
    END;
    
    -- Step 4: Ensure auth.identities exist
    RAISE NOTICE '';
    RAISE NOTICE '🆔 4. ENSURING AUTH IDENTITIES EXIST...';
    
    BEGIN
        -- Create/update admin identity
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
        
        -- Create/update client identity
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
            RAISE NOTICE '  ⚠️ Identity creation warning: %', SQLERRM;
    END;
    
    -- Step 5: Verify password hashes work correctly
    RAISE NOTICE '';
    RAISE NOTICE '🧪 5. VERIFYING PASSWORD HASHES...';
    
    BEGIN
        -- Test admin password
        FOR rec IN 
            SELECT 
                email,
                (encrypted_password = crypt(admin_new_password, encrypted_password)) as password_valid,
                encrypted_password IS NOT NULL as has_password,
                email_confirmed_at IS NOT NULL as email_confirmed
            FROM auth.users 
            WHERE id = admin_user_id
        LOOP
            RAISE NOTICE '  Admin User: %', rec.email;
            RAISE NOTICE '    Password Valid: %', rec.password_valid;
            RAISE NOTICE '    Has Password: %', rec.has_password;
            RAISE NOTICE '    Email Confirmed: %', rec.email_confirmed;
            
            IF NOT rec.password_valid THEN
                RAISE EXCEPTION 'Admin password verification failed';
            END IF;
        END LOOP;
        
        -- Test client password
        FOR rec IN 
            SELECT 
                email,
                (encrypted_password = crypt(client_new_password, encrypted_password)) as password_valid,
                encrypted_password IS NOT NULL as has_password,
                email_confirmed_at IS NOT NULL as email_confirmed
            FROM auth.users 
            WHERE id = client_user_id
        LOOP
            RAISE NOTICE '  Client User: %', rec.email;
            RAISE NOTICE '    Password Valid: %', rec.password_valid;
            RAISE NOTICE '    Has Password: %', rec.has_password;
            RAISE NOTICE '    Email Confirmed: %', rec.email_confirmed;
            
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
        -- Count users in auth.users
        SELECT COUNT(*) INTO update_count 
        FROM auth.users 
        WHERE email IN (admin_email, client_email);
        
        RAISE NOTICE '  Auth Users Found: %', update_count;
        
        -- Count identities
        SELECT COUNT(*) INTO update_count 
        FROM auth.identities 
        WHERE user_id IN (admin_user_id, client_user_id);
        
        RAISE NOTICE '  Auth Identities Found: %', update_count;
        
        -- Count profiles
        SELECT COUNT(*) INTO update_count 
        FROM profiles 
        WHERE email IN (admin_email, client_email);
        
        RAISE NOTICE '  Profiles Found: %', update_count;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️ Verification warning: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 === PASSWORD UPDATE COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEW CREDENTIALS FOR TESTING:';
    RAISE NOTICE '  🔑 Admin: % / %', admin_email, admin_new_password;
    RAISE NOTICE '  🔑 Client: % / %', client_email, client_new_password;
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SECURITY FEATURES IMPLEMENTED:';
    RAISE NOTICE '  ✅ bcrypt hashing with cost factor 12';
    RAISE NOTICE '  ✅ Automatic salt generation';
    RAISE NOTICE '  ✅ Password verification testing';
    RAISE NOTICE '  ✅ Secure database updates';
    RAISE NOTICE '  ✅ Identity synchronization';
    RAISE NOTICE '';
    RAISE NOTICE '✅ === READY FOR LOGIN TESTING ===';
    
END $$;
