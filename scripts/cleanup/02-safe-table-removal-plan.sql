-- Safe table removal plan based on comprehensive analysis
-- This script identifies tables for removal and provides the cleanup commands

-- PHASE 1: Identify tables that are definitely safe to remove
SELECT 'PHASE 1: SAFE TO REMOVE IMMEDIATELY' as phase;

-- Test and temporary tables (clearly marked as such)
SELECT 'Test/Temporary Tables:' as category;
SELECT tablename, 'Test/Debug table - safe to remove' as reason
FROM pg_tables 
WHERE schemaname = 'public' 
    AND (
        tablename LIKE '%test%' OR 
        tablename LIKE '%temp%' OR 
        tablename LIKE '%debug%' OR
        tablename LIKE '%sample%' OR
        tablename LIKE '%demo%'
    )
ORDER BY tablename;

-- PHASE 2: Empty tables with no foreign key references
SELECT 'PHASE 2: EMPTY UNREFERENCED TABLES' as phase;

WITH empty_unreferenced AS (
    SELECT 
        t.tablename,
        COALESCE(s.n_live_tup, 0) as row_count
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
        -- Exclude core system tables that might be empty but needed
        AND t.tablename NOT IN (
            'profiles', 'hotels', 'rooms', 'guests', 'reservations',
            'subscription_plans', 'maintenance_orders', 'cleaning_tasks'
        )
)
SELECT tablename, 'Empty table with no foreign key references' as reason
FROM empty_unreferenced
ORDER BY tablename;

-- PHASE 3: Identify potential duplicates (requires manual review)
SELECT 'PHASE 3: POTENTIAL DUPLICATES (MANUAL REVIEW NEEDED)' as phase;

-- Look for tables with very similar names
WITH similar_names AS (
    SELECT 
        t1.tablename as table1,
        t2.tablename as table2,
        s1.n_live_tup as table1_rows,
        s2.n_live_tup as table2_rows
    FROM pg_tables t1
    JOIN pg_tables t2 ON t1.tablename < t2.tablename
    LEFT JOIN pg_stat_user_tables s1 ON s1.tablename = t1.tablename
    LEFT JOIN pg_stat_user_tables s2 ON s2.tablename = t2.tablename
    WHERE t1.schemaname = 'public' 
        AND t2.schemaname = 'public'
        AND (
            -- Similar maintenance tables
            (t1.tablename LIKE '%maintenance%' AND t2.tablename LIKE '%maintenance%') OR
            -- Similar cleaning tables  
            (t1.tablename LIKE '%cleaning%' AND t2.tablename LIKE '%cleaning%') OR
            -- Similar financial tables
            (t1.tablename LIKE '%financial%' AND t2.tablename LIKE '%financial%') OR
            -- Tables with version suffixes
            (t1.tablename = regexp_replace(t2.tablename, '_v[0-9]+$|_[0-9]+$|_fixed$|_new$|_old$', ''))
        )
)
SELECT 
    table1,
    table2,
    COALESCE(table1_rows, 0) as table1_rows,
    COALESCE(table2_rows, 0) as table2_rows,
    CASE 
        WHEN COALESCE(table1_rows, 0) = 0 AND COALESCE(table2_rows, 0) > 0 THEN 'Consider removing ' || table1
        WHEN COALESCE(table2_rows, 0) = 0 AND COALESCE(table1_rows, 0) > 0 THEN 'Consider removing ' || table2
        WHEN COALESCE(table1_rows, 0) = 0 AND COALESCE(table2_rows, 0) = 0 THEN 'Both empty - review structure'
        ELSE 'Manual review needed - both have data'
    END as recommendation
FROM similar_names
ORDER BY table1;
