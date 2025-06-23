-- FINAL DATABASE CLEANUP EXECUTION SCRIPT
-- This script performs the actual cleanup based on our analysis
-- 
-- IMPORTANT: 
-- 1. BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT
-- 2. Review the analysis reports first
-- 3. Test in a development environment
-- 4. This script uses transactions - you can ROLLBACK if needed

BEGIN;

-- Create cleanup log table
CREATE TEMP TABLE IF NOT EXISTS cleanup_execution_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255),
    action VARCHAR(50),
    reason TEXT,
    row_count INTEGER,
    table_size_bytes BIGINT,
    table_size_pretty TEXT,
    execution_time TIMESTAMP DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

-- Create safe drop function
CREATE OR REPLACE FUNCTION execute_safe_drop(
    p_table_name TEXT, 
    p_reason TEXT,
    p_dry_run BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
DECLARE
    v_row_count INTEGER := 0;
    v_table_size_bytes BIGINT := 0;
    v_table_size_pretty TEXT := '0 bytes';
    v_exists BOOLEAN := FALSE;
    v_is_referenced BOOLEAN := FALSE;
    v_error_msg TEXT;
BEGIN
    -- Check if table exists
    SELECT EXISTS(
        SELECT 1 FROM pg_tables 
        WHERE tablename = p_table_name AND schemaname = 'public'
    ) INTO v_exists;
    
    IF NOT v_exists THEN
        INSERT INTO cleanup_execution_log (table_name, action, reason, success, error_message)
        VALUES (p_table_name, 'SKIP', p_reason, TRUE, 'Table does not exist');
        RETURN TRUE;
    END IF;
    
    -- Get table statistics
    SELECT 
        COALESCE(n_live_tup, 0),
        pg_total_relation_size('public.' || p_table_name),
        pg_size_pretty(pg_total_relation_size('public.' || p_table_name))
    INTO v_row_count, v_table_size_bytes, v_table_size_pretty
    FROM pg_stat_user_tables 
    WHERE tablename = p_table_name AND schemaname = 'public';
    
    -- Check if table is referenced by foreign keys (extra safety check)
    SELECT EXISTS(
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = p_table_name
            AND tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
    ) INTO v_is_referenced;
    
    -- Log the planned action
    INSERT INTO cleanup_execution_log (
        table_name, action, reason, row_count, 
        table_size_bytes, table_size_pretty
    ) VALUES (
        p_table_name, 
        CASE WHEN p_dry_run THEN 'DRY_RUN' ELSE 'DROP' END, 
        p_reason, 
        v_row_count, 
        v_table_size_bytes, 
        v_table_size_pretty
    );
    
    -- If dry run, just log and return
    IF p_dry_run THEN
        RAISE NOTICE 'DRY RUN: Would drop table % (Reason: %, Rows: %, Size: %)', 
                     p_table_name, p_reason, v_row_count, v_table_size_pretty;
        RETURN TRUE;
    END IF;
    
    -- Additional safety check for referenced tables
    IF v_is_referenced THEN
        UPDATE cleanup_execution_log 
        SET success = FALSE, error_message = 'Table is referenced by foreign keys - skipping for safety'
        WHERE table_name = p_table_name AND action = 'DROP' 
            AND execution_time = (SELECT MAX(execution_time) FROM cleanup_execution_log WHERE table_name = p_table_name);
        
        RAISE NOTICE 'SKIPPED: Table % is referenced by foreign keys', p_table_name;
        RETURN FALSE;
    END IF;
    
    -- Execute the drop
    BEGIN
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(p_table_name) || ' CASCADE';
        
        UPDATE cleanup_execution_log 
        SET success = TRUE
        WHERE table_name = p_table_name AND action = 'DROP' 
            AND execution_time = (SELECT MAX(execution_time) FROM cleanup_execution_log WHERE table_name = p_table_name);
        
        RAISE NOTICE 'DROPPED: Table % (Reason: %, Rows: %, Size: %)', 
                     p_table_name, p_reason, v_row_count, v_table_size_pretty;
        RETURN TRUE;
        
    EXCEPTION WHEN OTHERS THEN
        v_error_msg := SQLERRM;
        
        UPDATE cleanup_execution_log 
        SET success = FALSE, error_message = v_error_msg
        WHERE table_name = p_table_name AND action = 'DROP' 
            AND execution_time = (SELECT MAX(execution_time) FROM cleanup_execution_log WHERE table_name = p_table_name);
        
        RAISE NOTICE 'ERROR dropping table %: %', p_table_name, v_error_msg;
        RETURN FALSE;
    END;
END;
$$ LANGUAGE plpgsql;

-- CONFIGURATION: Set to TRUE for dry run, FALSE for actual execution
-- CHANGE THIS TO FALSE WHEN READY TO EXECUTE
DO $$
DECLARE
    DRY_RUN BOOLEAN := TRUE;  -- SET TO FALSE TO ACTUALLY EXECUTE
    table_rec RECORD;
BEGIN
    RAISE NOTICE '=== STARTING DATABASE CLEANUP ===';
    RAISE NOTICE 'DRY RUN MODE: %', DRY_RUN;
    
    -- PHASE 1: Remove test/debug/temporary tables
    RAISE NOTICE '--- PHASE 1: Test/Debug/Temporary Tables ---';
    
    FOR table_rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
            AND (
                tablename LIKE '%test%' OR 
                tablename LIKE '%temp%' OR 
                tablename LIKE '%debug%' OR
                tablename LIKE '%sample%' OR
                tablename LIKE '%demo%'
            )
        ORDER BY tablename
    LOOP
        PERFORM execute_safe_drop(table_rec.tablename, 'Test/Debug/Temporary table', DRY_RUN);
    END LOOP;
    
    -- PHASE 2: Remove empty unreferenced tables
    RAISE NOTICE '--- PHASE 2: Empty Unreferenced Tables ---';
    
    FOR table_rec IN 
        WITH empty_unreferenced AS (
            SELECT t.tablename
            FROM pg_tables t
            LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
            WHERE t.schemaname = 'public'
                AND COALESCE(s.n_live_tup, 0) = 0
                AND NOT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu
                        ON tc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_name = t.tablename
                        AND tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_schema = 'public'
                )
                -- Preserve essential system tables even if empty
                AND t.tablename NOT IN (
                    'profiles', 'hotels', 'rooms', 'guests', 'reservations',
                    'subscription_plans', 'maintenance_orders', 'cleaning_tasks',
                    'maintenance_categories', 'maintenance_technicians',
                    'cleaning_personnel', 'financial_transactions', 'expenses',
                    'room_categories', 'pricing_rules', 'support_tickets'
                )
                -- Don't remove log/audit tables
                AND t.tablename NOT LIKE '%_log'
                AND t.tablename NOT LIKE '%_audit'
                AND t.tablename NOT LIKE '%_history'
        )
        SELECT tablename FROM empty_unreferenced ORDER BY tablename
    LOOP
        PERFORM execute_safe_drop(table_rec.tablename, 'Empty unreferenced table', DRY_RUN);
    END LOOP;
    
    -- PHASE 3: Remove known obsolete tables (based on code analysis)
    RAISE NOTICE '--- PHASE 3: Known Obsolete Tables ---';
    
    -- These are specific tables identified as obsolete from the codebase analysis
    PERFORM execute_safe_drop('maintenance_orders_old', 'Obsolete version of maintenance_orders', DRY_RUN);
    PERFORM execute_safe_drop('maintenance_orders_backup', 'Backup table no longer needed', DRY_RUN);
    PERFORM execute_safe_drop('maintenance_orders_temp', 'Temporary migration table', DRY_RUN);
    PERFORM execute_safe_drop('cleaning_tasks_old', 'Obsolete version of cleaning_tasks', DRY_RUN);
    PERFORM execute_safe_drop('cleaning_tasks_backup', 'Backup table no longer needed', DRY_RUN);
    PERFORM execute_safe_drop('cleaning_tasks_temp', 'Temporary migration table', DRY_RUN);
    PERFORM execute_safe_drop('financial_transactions_old', 'Obsolete version of financial_transactions', DRY_RUN);
    PERFORM execute_safe_drop('transactions_backup', 'Backup table no longer needed', DRY_RUN);
    
    RAISE NOTICE '=== CLEANUP COMPLETED ===';
END $$;

-- Display cleanup summary
SELECT '=== CLEANUP EXECUTION SUMMARY ===' as section;

SELECT 
    action,
    COUNT(*) as table_count,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
    pg_size_pretty(SUM(COALESCE(table_size_bytes, 0))) as total_size_processed
FROM cleanup_execution_log
GROUP BY action
ORDER BY action;

-- Show detailed results
SELECT '=== DETAILED CLEANUP RESULTS ===' as section;

SELECT 
    table_name,
    action,
    reason,
    row_count,
    table_size_pretty,
    success,
    COALESCE(error_message, 'Success') as result,
    execution_time
FROM cleanup_execution_log
ORDER BY execution_time;

-- Calculate space savings
SELECT '=== SPACE SAVINGS ===' as section;

SELECT 
    COUNT(*) as tables_removed,
    SUM(row_count) as total_rows_removed,
    pg_size_pretty(SUM(table_size_bytes)) as total_space_freed
FROM cleanup_execution_log
WHERE action = 'DROP' AND success = TRUE;

-- Clean up temporary function
DROP FUNCTION IF EXISTS execute_safe_drop(TEXT, TEXT, BOOLEAN);

-- IMPORTANT: Choose your action
SELECT '=== TRANSACTION CONTROL ===' as section;
SELECT 'Review the results above. To apply changes, change ROLLBACK to COMMIT below.' as instruction;

-- ROLLBACK to undo changes (safe default)
-- COMMIT to apply changes (uncomment when ready)
ROLLBACK;
-- COMMIT;
