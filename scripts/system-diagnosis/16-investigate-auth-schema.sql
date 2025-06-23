-- Investigate Auth Schema
-- This script checks the actual structure of Supabase auth tables

DO $$
DECLARE
    rec RECORD;
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 === INVESTIGATING AUTH SCHEMA ===';
    
    -- 1. Check if auth schema exists
    RAISE NOTICE '';
    RAISE NOTICE '📋 1. CHECKING AUTH SCHEMA...';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'auth'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ Auth schema exists';
    ELSE
        RAISE NOTICE '❌ Auth schema does not exist';
        RETURN;
    END IF;
    
    -- 2. List all tables in auth schema
    RAISE NOTICE '';
    RAISE NOTICE '📋 2. LISTING AUTH TABLES...';
    
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'auth'
        ORDER BY table_name
    LOOP
        RAISE NOTICE '  - %', rec.table_name;
    END LOOP;
    
    -- 3. Check auth.users table structure
    RAISE NOTICE '';
    RAISE NOTICE '📋 3. CHECKING AUTH.USERS TABLE STRUCTURE...';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ auth.users table exists';
        RAISE NOTICE '  Columns:';
        
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '    - % (%) - Nullable: % - Default: %', 
                rec.column_name, rec.data_type, rec.is_nullable, 
                COALESCE(rec.column_default, 'NULL');
        END LOOP;
    ELSE
        RAISE NOTICE '❌ auth.users table does not exist';
    END IF;
    
    -- 4. Check auth.identities table structure
    RAISE NOTICE '';
    RAISE NOTICE '📋 4. CHECKING AUTH.IDENTITIES TABLE STRUCTURE...';
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'identities'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ auth.identities table exists';
        RAISE NOTICE '  Columns:';
        
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'identities'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '    - % (%) - Nullable: % - Default: %', 
                rec.column_name, rec.data_type, rec.is_nullable, 
                COALESCE(rec.column_default, 'NULL');
        END LOOP;
    ELSE
        RAISE NOTICE '❌ auth.identities table does not exist';
    END IF;
    
    -- 5. Try to access auth.users data
    RAISE NOTICE '';
    RAISE NOTICE '📋 5. CHECKING AUTH.USERS DATA ACCESS...';
    
    BEGIN
        FOR rec IN 
            SELECT * FROM auth.users LIMIT 3
        LOOP
            RAISE NOTICE '  Found user: %', rec;
            EXIT; -- Just show we can access it
        END LOOP;
        RAISE NOTICE '✅ Can access auth.users data';
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '❌ Insufficient privileges to access auth.users';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error accessing auth.users: %', SQLERRM;
    END;
    
    -- 6. Check current auth users count
    RAISE NOTICE '';
    RAISE NOTICE '📊 6. CHECKING AUTH USERS COUNT...';
    
    BEGIN
        EXECUTE 'SELECT COUNT(*) FROM auth.users' INTO rec;
        RAISE NOTICE '  Current auth.users count: %', rec.count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot count auth.users: %', SQLERRM;
    END;
    
    -- 7. Check for our specific users
    RAISE NOTICE '';
    RAISE NOTICE '👤 7. CHECKING FOR OUR SPECIFIC USERS...';
    
    BEGIN
        FOR rec IN 
            EXECUTE 'SELECT id, email FROM auth.users WHERE email IN (''admin@baitahotel.com'', ''hotel@exemplo.com'')'
        LOOP
            RAISE NOTICE '  Found: % (%)', rec.email, rec.id;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot query specific users: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ === AUTH SCHEMA INVESTIGATION COMPLETE ===';
    
END $$;
