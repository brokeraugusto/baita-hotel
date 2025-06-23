-- Execute safe table cleanup
-- This script will remove tables that are definitely safe to remove

-- IMPORTANT: This script should be run with caution
-- Always backup your database before running cleanup operations

BEGIN;

-- Create a log table to track what we're removing
CREATE TEMP TABLE cleanup_log (
    table_name VARCHAR(255),
    reason TEXT,
    row_count INTEGER,
    table_size TEXT,
    removed_at TIMESTAMP DEFAULT NOW()
);

-- Function to safely drop a table if it exists
CREATE OR REPLACE FUNCTION safe_drop_table(table_name TEXT, reason TEXT) 
RETURNS VOID AS $$
DECLARE
    row_count INTEGER;
    table_size TEXT;
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = table_name AND schemaname = 'public') THEN
        -- Get stats before dropping
        SELECT COALESCE(n_live_tup, 0), pg_size_pretty(pg_total_relation_size('public.' || table_name))
        INTO row_count, table_size
        FROM pg_stat_user_tables 
        WHERE tablename = table_name AND schemaname = 'public';
        
        -- Log the removal
        INSERT INTO cleanup_log (table_name, reason, row_count, table_size)
        VALUES (table_name, reason, row_count, table_size);
        
        -- Drop the table
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(table_name) || ' CASCADE';
        
        RAISE NOTICE 'Dropped table: % (Reason: %, Rows: %, Size: %)', 
                     table_name, reason, row_count, table_size;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- PHASE 1: Remove obvious test/debug/temporary tables
SELECT 'PHASE 1: Removing test/debug/temporary tables' as phase;

-- Remove test tables (if any exist)
SELECT safe_drop_table(tablename, 'Test/Debug table')
FROM pg_tables 
WHERE schemaname = 'public' 
    AND (
        tablename LIKE '%test%' OR 
        tablename LIKE '%temp%' OR 
        tablename LIKE '%debug%' OR
        tablename LIKE '%sample%' OR
        tablename LIKE '%demo%'
    );

-- PHASE 2: Remove empty tables that are not core system tables
SELECT 'PHASE 2: Removing empty unreferenced tables' as phase;

-- Identify and remove empty tables that are safe to remove
WITH empty_safe_tables AS (
    SELECT t.tablename
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
    WHERE t.schemaname = 'public'
        AND COALESCE(s.n_live_tup, 0) = 0
        -- Not referenced by foreign keys
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
            WHERE ccu.table_name = t.tablename
                AND tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
        )
        -- Exclude essential system tables even if empty
        AND t.tablename NOT IN (
            'profiles', 'hotels', 'rooms', 'guests', 'reservations',
            'subscription_plans', 'maintenance_orders', 'cleaning_tasks',
            'maintenance_categories', 'maintenance_technicians',
            'cleaning_personnel', 'financial_transactions', 'expenses'
        )
        -- Exclude tables that might be legitimately empty but needed
        AND t.tablename NOT LIKE '%_log'
        AND t.tablename NOT LIKE '%_audit'
        AND t.tablename NOT LIKE '%_history'
)
SELECT safe_drop_table(tablename, 'Empty unreferenced table')
FROM empty_safe_tables;

-- PHASE 3: Remove specific known obsolete tables based on code analysis
SELECT 'PHASE 3: Removing known obsolete tables' as phase;

-- These are tables that were created during development but are no longer used
-- Based on the analysis of the codebase and SQL scripts

-- Remove old maintenance table versions if they exist
SELECT safe_drop_table('maintenance_orders_old', 'Obsolete version of maintenance_orders');
SELECT safe_drop_table('maintenance_orders_backup', 'Backup table no longer needed');
SELECT safe_drop_table('maintenance_orders_temp', 'Temporary table from migration');

-- Remove old cleaning table versions if they exist  
SELECT safe_drop_table('cleaning_tasks_old', 'Obsolete version of cleaning_tasks');
SELECT safe_drop_table('cleaning_tasks_backup', 'Backup table no longer needed');
SELECT safe_drop_table('cleaning_tasks_temp', 'Temporary table from migration');

-- Remove duplicate financial tables if they exist
SELECT safe_drop_table('financial_transactions_old', 'Obsolete version of financial_transactions');
SELECT safe_drop_table('transactions_backup', 'Backup table no longer needed');

-- Show cleanup summary
SELECT 'CLEANUP SUMMARY' as section;
SELECT 
    table_name,
    reason,
    row_count,
    table_size,
    removed_at
FROM cleanup_log
ORDER BY removed_at;

-- Show space saved
SELECT 
    'Total tables removed: ' || COUNT(*) as summary
FROM cleanup_log;

-- Clean up our temporary function
DROP FUNCTION IF EXISTS safe_drop_table(TEXT, TEXT);

-- COMMIT or ROLLBACK based on results
-- Uncomment one of the following lines:
-- COMMIT;   -- To apply the changes
ROLLBACK;   -- To undo the changes (safe default)
