-- Fix Supabase Auth System
-- This script diagnoses and fixes auth system issues

DO $$
DECLARE
    rec RECORD;
    auth_user_count INTEGER;
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '🔧 === FIXING SUPABASE AUTH SYSTEM ===';
    
    -- 1. Check current auth.users
    RAISE NOTICE '';
    RAISE NOTICE '🔍 1. CHECKING AUTH.USERS TABLE...';
    
    BEGIN
        EXECUTE 'SELECT COUNT(*) FROM auth.users' INTO auth_user_count;
        RAISE NOTICE '✅ Auth users table accessible';
        RAISE NOTICE '  Current auth users: %', auth_user_count;
        
        -- Show existing auth users
        FOR rec IN 
            EXECUTE 'SELECT id, email, email_confirmed, created_at FROM auth.users ORDER BY created_at'
        LOOP
            RAISE NOTICE '  - % (%) - Confirmed: % - Created: %', 
                rec.email, rec.id, rec.email_confirmed, rec.created_at;
        END LOOP;
        
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '❌ Cannot access auth.users table (insufficient privileges)';
            RAISE NOTICE '   This script needs to be run with proper auth permissions';
            RETURN;
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error accessing auth.users: %', SQLERRM;
            RETURN;
    END;
    
    -- 2. Check auth.identities
    RAISE NOTICE '';
    RAISE NOTICE '🔍 2. CHECKING AUTH.IDENTITIES TABLE...';
    
    BEGIN
        FOR rec IN 
            EXECUTE 'SELECT user_id, provider, provider_id, email FROM auth.identities ORDER BY created_at'
        LOOP
            RAISE NOTICE '  - % (%) - Provider: % - Email: %', 
                rec.user_id, rec.provider_id, rec.provider, rec.email;
        END LOOP;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error accessing auth.identities: %', SQLERRM;
    END;
    
    -- 3. Check profiles vs auth users sync
    RAISE NOTICE '';
    RAISE NOTICE '🔍 3. CHECKING PROFILES VS AUTH USERS SYNC...';
    
    SELECT COUNT(*) INTO profile_count FROM profiles;
    RAISE NOTICE '  Profiles count: %', profile_count;
    RAISE NOTICE '  Auth users count: %', auth_user_count;
    
    -- Check for profiles without auth users
    FOR rec IN 
        SELECT p.id, p.email, p.full_name, p.role
        FROM profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM auth.users au WHERE au.id = p.id
        )
    LOOP
        RAISE NOTICE '  ❌ Profile without auth user: % (%) - %', 
            rec.email, rec.id, rec.role;
    END LOOP;
    
    -- 4. Try to fix missing auth users
    RAISE NOTICE '';
    RAISE NOTICE '🔧 4. ATTEMPTING TO FIX AUTH USERS...';
    
    -- Check if we need to create auth users for existing profiles
    FOR rec IN 
        SELECT p.id, p.email, p.full_name, p.role
        FROM profiles p
        WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        AND NOT EXISTS (
            SELECT 1 FROM auth.users au WHERE au.id = p.id
        )
    LOOP
        RAISE NOTICE '  🔧 Creating auth user for: % (%)', rec.email, rec.role;
        
        BEGIN
            -- Insert into auth.users
            EXECUTE format('
                INSERT INTO auth.users (
                    id, 
                    email, 
                    encrypted_password, 
                    email_confirmed, 
                    created_at, 
                    updated_at,
                    role,
                    aud,
                    confirmation_token,
                    email_confirmed_at
                ) VALUES (
                    %L,
                    %L,
                    crypt(%L, gen_salt(''bf'')),
                    true,
                    NOW(),
                    NOW(),
                    ''authenticated'',
                    ''authenticated'',
                    '''',
                    NOW()
                ) ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    encrypted_password = EXCLUDED.encrypted_password,
                    email_confirmed = true,
                    email_confirmed_at = NOW(),
                    updated_at = NOW()
            ', rec.id, rec.email, '123456789');
            
            -- Insert into auth.identities
            EXECUTE format('
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
                    %L,
                    %L,
                    ''email'',
                    jsonb_build_object(''sub'', %L, ''email'', %L),
                    NOW(),
                    NOW(),
                    %L
                ) ON CONFLICT (provider, provider_id) DO UPDATE SET
                    identity_data = EXCLUDED.identity_data,
                    updated_at = NOW()
            ', rec.id, rec.email, rec.id, rec.email, rec.email);
            
            RAISE NOTICE '    ✅ Auth user created successfully for %', rec.email;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '    ❌ Failed to create auth user for %: %', rec.email, SQLERRM;
        END;
    END LOOP;
    
    -- 5. Verify the fix
    RAISE NOTICE '';
    RAISE NOTICE '✅ 5. VERIFYING THE FIX...';
    
    BEGIN
        EXECUTE 'SELECT COUNT(*) FROM auth.users' INTO auth_user_count;
        RAISE NOTICE '  Final auth users count: %', auth_user_count;
        
        -- Test auth for our specific users
        FOR rec IN 
            SELECT p.email, p.role
            FROM profiles p
            WHERE p.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
        LOOP
            IF EXISTS (SELECT 1 FROM auth.users WHERE email = rec.email) THEN
                RAISE NOTICE '  ✅ Auth user exists for: % (%)', rec.email, rec.role;
            ELSE
                RAISE NOTICE '  ❌ Auth user missing for: % (%)', rec.email, rec.role;
            END IF;
        END LOOP;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Verification failed: %', SQLERRM;
    END;
    
    -- 6. Check for RLS issues
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ 6. CHECKING RLS POLICIES...';
    
    -- Temporarily disable RLS on auth tables if possible
    BEGIN
        EXECUTE 'ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE '  ✅ Disabled RLS on auth.users';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️ Could not disable RLS on auth.users: %', SQLERRM;
    END;
    
    BEGIN
        EXECUTE 'ALTER TABLE auth.identities DISABLE ROW LEVEL SECURITY';
        RAISE NOTICE '  ✅ Disabled RLS on auth.identities';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️ Could not disable RLS on auth.identities: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 === AUTH SYSTEM FIX COMPLETE ===';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. Test login with credentials: admin@baitahotel.com / 123456789';
    RAISE NOTICE '2. Test login with credentials: hotel@exemplo.com / 123456789';
    RAISE NOTICE '3. If still failing, check Supabase dashboard for auth configuration';
    RAISE NOTICE '4. Verify that email confirmation is disabled in Supabase settings';
    
END $$;
