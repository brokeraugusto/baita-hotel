-- Comprehensive Database Diagnosis Script
-- This script checks all aspects of the database setup

DO $$
DECLARE
    rec RECORD;
    table_count INTEGER;
    auth_user_count INTEGER;
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 === COMPREHENSIVE DATABASE DIAGNOSIS ===';
    
    -- Check if basic tables exist
    RAISE NOTICE '';
    RAISE NOTICE '📋 1. CHECKING CORE TABLES...';
    
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'hotels', 'user_roles');
    
    RAISE NOTICE 'Core tables found: %', table_count;
    
    -- List all public tables
    RAISE NOTICE '';
    RAISE NOTICE '📊 2. ALL PUBLIC TABLES:';
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    LOOP
        RAISE NOTICE '  - %', rec.table_name;
    END LOOP;
    
    -- Check user_role enum
    RAISE NOTICE '';
    RAISE NOTICE '🏷️ 3. CHECKING USER_ROLE ENUM...';
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE NOTICE '✅ user_role enum exists';
        
        -- Show enum values
        FOR rec IN 
            SELECT enumlabel 
            FROM pg_enum e 
            JOIN pg_type t ON e.enumtypid = t.oid 
            WHERE t.typname = 'user_role'
        LOOP
            RAISE NOTICE '  - %', rec.enumlabel;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ user_role enum does NOT exist';
    END IF;
    
    -- Check profiles table structure
    RAISE NOTICE '';
    RAISE NOTICE '👤 4. CHECKING PROFILES TABLE...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✅ profiles table exists';
        
        -- Show columns
        FOR rec IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - % (%) %', rec.column_name, rec.data_type, 
                CASE WHEN rec.is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END;
        END LOOP;
        
        -- Count profiles
        EXECUTE 'SELECT COUNT(*) FROM profiles' INTO profile_count;
        RAISE NOTICE '  Total profiles: %', profile_count;
        
        -- Show sample profiles
        IF profile_count > 0 THEN
            RAISE NOTICE '  Sample profiles:';
            FOR rec IN 
                SELECT email, role, full_name 
                FROM profiles 
                LIMIT 5
            LOOP
                RAISE NOTICE '    - % (%) - %', rec.email, rec.role, rec.full_name;
            END LOOP;
        END IF;
    ELSE
        RAISE NOTICE '❌ profiles table does NOT exist';
    END IF;
    
    -- Check hotels table
    RAISE NOTICE '';
    RAISE NOTICE '🏨 5. CHECKING HOTELS TABLE...';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        RAISE NOTICE '✅ hotels table exists';
        
        -- Count hotels
        EXECUTE 'SELECT COUNT(*) FROM hotels' INTO table_count;
        RAISE NOTICE '  Total hotels: %', table_count;
        
        -- Show sample hotels
        IF table_count > 0 THEN
            FOR rec IN 
                SELECT name, email 
                FROM hotels 
                LIMIT 3
            LOOP
                RAISE NOTICE '    - % (%)', rec.name, rec.email;
            END LOOP;
        END IF;
    ELSE
        RAISE NOTICE '❌ hotels table does NOT exist';
    END IF;
    
    -- Check auth.users (this requires special permissions)
    RAISE NOTICE '';
    RAISE NOTICE '🔐 6. CHECKING AUTH USERS...';
    
    BEGIN
        EXECUTE 'SELECT COUNT(*) FROM auth.users' INTO auth_user_count;
        RAISE NOTICE '✅ Can access auth.users table';
        RAISE NOTICE '  Total auth users: %', auth_user_count;
        
        -- Show sample auth users (email only for privacy)
        IF auth_user_count > 0 THEN
            FOR rec IN 
                EXECUTE 'SELECT email FROM auth.users LIMIT 5'
            LOOP
                RAISE NOTICE '    - %', rec.email;
            END LOOP;
        END IF;
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '❌ Cannot access auth.users table (insufficient privileges)';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Error accessing auth.users: %', SQLERRM;
    END;
    
    -- Check RLS policies
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ 7. CHECKING RLS POLICIES...';
    
    FOR rec IN 
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE '  - %.%: % (%) for %', 
            rec.schemaname, rec.tablename, rec.policyname, rec.cmd, rec.roles;
    END LOOP;
    
    -- Final recommendations
    RAISE NOTICE '';
    RAISE NOTICE '💡 8. RECOMMENDATIONS:';
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE NOTICE '  ❗ Create user_role enum first';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '  ❗ Create profiles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        RAISE NOTICE '  ❗ Create hotels table';
    END IF;
    
    IF profile_count = 0 THEN
        RAISE NOTICE '  ❗ Insert test profiles';
    END IF;
    
    IF auth_user_count = 0 THEN
        RAISE NOTICE '  ❗ Create auth users (run auth setup script)';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ === DIAGNOSIS COMPLETE ===';
    
END $$;
