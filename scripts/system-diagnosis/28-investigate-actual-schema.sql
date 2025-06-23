-- Investigate Actual Database Schema
-- Find out what columns and constraints actually exist

DO $$
DECLARE
    rec RECORD;
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 === INVESTIGATING ACTUAL DATABASE SCHEMA ===';
    RAISE NOTICE '';
    
    -- Check profiles table structure
    RAISE NOTICE '📋 1. PROFILES TABLE STRUCTURE:';
    BEGIN
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  📝 %: % (nullable: %, default: %)', 
                rec.column_name, rec.data_type, rec.is_nullable, 
                COALESCE(rec.column_default, 'none');
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error checking profiles structure: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    
    -- Check auth.users table structure
    RAISE NOTICE '🔐 2. AUTH.USERS TABLE STRUCTURE:';
    BEGIN
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'auth' AND table_name = 'users'
        ) INTO table_exists;
        
        IF table_exists THEN
            FOR rec IN 
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND table_schema = 'auth'
                ORDER BY ordinal_position
            LOOP
                RAISE NOTICE '  🔑 %: % (nullable: %, default: %)', 
                    rec.column_name, rec.data_type, rec.is_nullable, 
                    COALESCE(rec.column_default, 'none');
            END LOOP;
        ELSE
            RAISE NOTICE '  ❌ auth.users table does not exist';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error checking auth.users structure: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    
    -- Check auth.identities table structure
    RAISE NOTICE '🆔 3. AUTH.IDENTITIES TABLE STRUCTURE:';
    BEGIN
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'auth' AND table_name = 'identities'
        ) INTO table_exists;
        
        IF table_exists THEN
            FOR rec IN 
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'identities' 
                AND table_schema = 'auth'
                ORDER BY ordinal_position
            LOOP
                RAISE NOTICE '  🆔 %: % (nullable: %, default: %)', 
                    rec.column_name, rec.data_type, rec.is_nullable, 
                    COALESCE(rec.column_default, 'none');
            END LOOP;
        ELSE
            RAISE NOTICE '  ❌ auth.identities table does not exist';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error checking auth.identities structure: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    
    -- Check current data in profiles
    RAISE NOTICE '📊 4. CURRENT PROFILES DATA:';
    BEGIN
        FOR rec IN 
            SELECT id, email, role, full_name, created_at
            FROM profiles 
            WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY email
        LOOP
            RAISE NOTICE '  👤 %', rec.email;
            RAISE NOTICE '    ID: %', rec.id;
            RAISE NOTICE '    Role: %', rec.role;
            RAISE NOTICE '    Name: %', rec.full_name;
            RAISE NOTICE '    Created: %', rec.created_at;
            RAISE NOTICE '';
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error checking profiles data: %', SQLERRM;
    END;
    
    -- Check current data in auth.users
    RAISE NOTICE '🔐 5. CURRENT AUTH.USERS DATA:';
    BEGIN
        FOR rec IN 
            SELECT id, email, encrypted_password IS NOT NULL as has_password, 
                   created_at, updated_at
            FROM auth.users 
            WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
            ORDER BY email
        LOOP
            RAISE NOTICE '  🔑 %', rec.email;
            RAISE NOTICE '    ID: %', rec.id;
            RAISE NOTICE '    Has Password: %', rec.has_password;
            RAISE NOTICE '    Created: %', rec.created_at;
            RAISE NOTICE '    Updated: %', rec.updated_at;
            RAISE NOTICE '';
        END LOOP;
        
        IF NOT FOUND THEN
            RAISE NOTICE '  ℹ️ No matching users found in auth.users';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error checking auth.users data: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ === SCHEMA INVESTIGATION COMPLETE ===';
    
END $$;
