-- Minimal Password Update - Avoids all conflicts
-- Only updates auth.users table with existing IDs

DO $$
DECLARE
    admin_user_id UUID;
    client_user_id UUID;
    admin_email TEXT := 'admin@baitahotel.com';
    client_email TEXT := 'hotel@exemplo.com';
    admin_new_password TEXT := 'masteradmin123';
    client_new_password TEXT := 'cliente123';
    hashed_admin_password TEXT;
    hashed_client_password TEXT;
    auth_users_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 === MINIMAL PASSWORD UPDATE ===';
    RAISE NOTICE 'Strategy: Only update existing auth.users, no inserts';
    RAISE NOTICE '';
    
    -- Step 1: Get user IDs from profiles (must exist)
    RAISE NOTICE '👤 1. GETTING USER IDS...';
    
    SELECT id INTO admin_user_id FROM profiles WHERE email = admin_email;
    SELECT id INTO client_user_id FROM profiles WHERE email = client_email;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found: %', admin_email;
    END IF;
    
    IF client_user_id IS NULL THEN
        RAISE EXCEPTION 'Client user not found: %', client_email;
    END IF;
    
    RAISE NOTICE '  ✅ Admin ID: %', admin_user_id;
    RAISE NOTICE '  ✅ Client ID: %', client_user_id;
    
    -- Step 2: Generate password hashes
    RAISE NOTICE '';
    RAISE NOTICE '🧂 2. GENERATING PASSWORD HASHES...';
    
    SELECT crypt(admin_new_password, gen_salt('bf', 12)) INTO hashed_admin_password;
    SELECT crypt(client_new_password, gen_salt('bf', 12)) INTO hashed_client_password;
    
    RAISE NOTICE '  ✅ Passwords hashed with bcrypt';
    
    -- Step 3: Check if users exist in auth.users
    RAISE NOTICE '';
    RAISE NOTICE '🔍 3. CHECKING AUTH.USERS...';
    
    SELECT COUNT(*) INTO auth_users_count 
    FROM auth.users 
    WHERE id IN (admin_user_id, client_user_id);
    
    RAISE NOTICE '  Found % existing auth users', auth_users_count;
    
    -- Step 4: Update existing users OR create minimal entries
    RAISE NOTICE '';
    RAISE NOTICE '🔄 4. UPDATING PASSWORDS...';
    
    IF auth_users_count > 0 THEN
        -- Update existing users
        UPDATE auth.users 
        SET 
            encrypted_password = CASE 
                WHEN id = admin_user_id THEN hashed_admin_password
                WHEN id = client_user_id THEN hashed_client_password
            END,
            updated_at = NOW()
        WHERE id IN (admin_user_id, client_user_id);
        
        RAISE NOTICE '  ✅ Updated % existing auth users', auth_users_count;
    ELSE
        -- Create minimal auth users (only essential columns)
        RAISE NOTICE '  Creating minimal auth users...';
        
        -- Try with minimal columns first
        BEGIN
            INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
            VALUES 
                (admin_user_id, admin_email, hashed_admin_password, NOW(), NOW()),
                (client_user_id, client_email, hashed_client_password, NOW(), NOW());
            
            RAISE NOTICE '  ✅ Created minimal auth users';
            
        EXCEPTION
            WHEN unique_violation THEN
                RAISE NOTICE '  ⚠️ Users already exist, trying update instead...';
                
                UPDATE auth.users 
                SET encrypted_password = hashed_admin_password, updated_at = NOW()
                WHERE email = admin_email;
                
                UPDATE auth.users 
                SET encrypted_password = hashed_client_password, updated_at = NOW()
                WHERE email = client_email;
                
                RAISE NOTICE '  ✅ Updated via email lookup';
                
            WHEN OTHERS THEN
                RAISE NOTICE '  ❌ Insert failed: %', SQLERRM;
                RAISE NOTICE '  Trying alternative approach...';
                
                -- Try updating by email instead
                UPDATE auth.users 
                SET encrypted_password = hashed_admin_password, updated_at = NOW()
                WHERE email = admin_email;
                
                UPDATE auth.users 
                SET encrypted_password = hashed_client_password, updated_at = NOW()
                WHERE email = client_email;
                
                GET DIAGNOSTICS auth_users_count = ROW_COUNT;
                RAISE NOTICE '  ✅ Updated % users via email', auth_users_count;
        END;
    END IF;
    
    -- Step 5: Verify passwords work
    RAISE NOTICE '';
    RAISE NOTICE '🧪 5. VERIFYING PASSWORDS...';
    
    -- Test admin password
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = admin_email 
        AND encrypted_password = crypt(admin_new_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Admin password verified';
    ELSE
        RAISE NOTICE '  ❌ Admin password verification failed';
    END IF;
    
    -- Test client password
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = client_email 
        AND encrypted_password = crypt(client_new_password, encrypted_password)
    ) THEN
        RAISE NOTICE '  ✅ Client password verified';
    ELSE
        RAISE NOTICE '  ❌ Client password verification failed';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 === UPDATE COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST THESE CREDENTIALS:';
    RAISE NOTICE '  Admin: % / %', admin_email, admin_new_password;
    RAISE NOTICE '  Client: % / %', client_email, client_new_password;
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Next: Visit /test-new-credentials to test login';
    
END $$;
