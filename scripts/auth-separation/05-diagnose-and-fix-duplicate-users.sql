-- =====================================================
-- DIAGNOSE AND FIX DUPLICATE MASTER ADMIN USERS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNOSING DUPLICATE MASTER ADMIN USERS...';
END $$;

-- Check if master_admins table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        RAISE NOTICE '❌ Table master_admins does not exist!';
        RAISE NOTICE '💡 Run: scripts/auth-separation/00-diagnose-and-create-structure-fixed.sql';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Table master_admins exists';
END $$;

-- Diagnose duplicate users
DO $$
DECLARE
    duplicate_count INTEGER;
    total_count INTEGER;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO total_count FROM master_admins;
    RAISE NOTICE '📊 Total master admins: %', total_count;
    
    -- Count duplicates by email
    SELECT COUNT(*) INTO duplicate_count 
    FROM (
        SELECT email, COUNT(*) as cnt 
        FROM master_admins 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE '🔍 Emails with duplicates: %', duplicate_count;
    
    -- Show duplicate details
    IF duplicate_count > 0 THEN
        RAISE NOTICE '⚠️ DUPLICATE USERS FOUND:';
        
        FOR rec IN 
            SELECT email, COUNT(*) as count, 
                   array_agg(id ORDER BY created_at) as ids,
                   array_agg(is_active ORDER BY created_at) as active_status
            FROM master_admins 
            GROUP BY email 
            HAVING COUNT(*) > 1
        LOOP
            RAISE NOTICE '  📧 Email: % (% duplicates)', rec.email, rec.count;
            RAISE NOTICE '     IDs: %', rec.ids;
            RAISE NOTICE '     Active: %', rec.active_status;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ No duplicate users found';
    END IF;
END $$;

-- Show all users for reference
DO $$
BEGIN
    RAISE NOTICE '📋 ALL MASTER ADMINS:';
    
    FOR rec IN 
        SELECT id, email, full_name, is_active, created_at
        FROM master_admins 
        ORDER BY email, created_at
    LOOP
        RAISE NOTICE '  👤 % | % | % | Active: % | Created: %', 
            rec.id, rec.email, rec.full_name, rec.is_active, rec.created_at;
    END LOOP;
END $$;

-- Create function to clean duplicates (commented out for safety)
/*
CREATE OR REPLACE FUNCTION clean_duplicate_master_admins()
RETURNS TEXT AS $$
DECLARE
    rec RECORD;
    kept_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- For each email with duplicates
    FOR rec IN 
        SELECT email
        FROM master_admins 
        GROUP BY email 
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the oldest active user, or just the oldest if none are active
        SELECT id INTO kept_id
        FROM master_admins 
        WHERE email = rec.email
        ORDER BY 
            CASE WHEN is_active THEN 0 ELSE 1 END,  -- Active users first
            created_at ASC  -- Then by creation date
        LIMIT 1;
        
        -- Delete the duplicates
        DELETE FROM master_admins 
        WHERE email = rec.email AND id != kept_id;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        
        RAISE NOTICE 'Cleaned % duplicates for email: %, kept ID: %', 
            deleted_count, rec.email, kept_id;
    END LOOP;
    
    RETURN 'Duplicate cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- To execute the cleanup, uncomment and run:
-- SELECT clean_duplicate_master_admins();
*/

-- Create unique constraint to prevent future duplicates
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'master_admins' 
        AND constraint_name = 'master_admins_email_unique'
    ) THEN
        -- Only add if no duplicates exist
        IF NOT EXISTS (
            SELECT email FROM master_admins 
            GROUP BY email HAVING COUNT(*) > 1
        ) THEN
            ALTER TABLE master_admins 
            ADD CONSTRAINT master_admins_email_unique UNIQUE (email);
            RAISE NOTICE '✅ Added unique constraint on email';
        ELSE
            RAISE NOTICE '⚠️ Cannot add unique constraint - duplicates exist';
            RAISE NOTICE '💡 Clean duplicates first, then re-run this script';
        END IF;
    ELSE
        RAISE NOTICE '✅ Unique constraint already exists';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '⚠️ Could not add unique constraint: %', SQLERRM;
END $$;

-- Final verification
DO $$
DECLARE
    final_count INTEGER;
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_count FROM master_admins;
    
    SELECT COUNT(*) INTO duplicate_count 
    FROM (
        SELECT email FROM master_admins 
        GROUP BY email HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE '🎯 FINAL STATUS:';
    RAISE NOTICE '   Total users: %', final_count;
    RAISE NOTICE '   Duplicate emails: %', duplicate_count;
    
    IF duplicate_count = 0 THEN
        RAISE NOTICE '✅ System is clean - no duplicates';
    ELSE
        RAISE NOTICE '⚠️ Duplicates still exist - manual cleanup needed';
    END IF;
END $$;

RAISE NOTICE '🏁 Duplicate user diagnosis completed!';
