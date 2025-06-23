-- Comprehensive Database Cleanup Analysis Report
-- This script provides a detailed analysis of what can be cleaned up

-- SECTION 1: Current Database Overview
SELECT '=== CURRENT DATABASE OVERVIEW ===' as section;

WITH db_overview AS (
    SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN COALESCE(s.n_live_tup, 0) = 0 THEN 1 ELSE 0 END) as empty_tables,
        SUM(CASE WHEN t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' THEN 1 ELSE 0 END) as test_tables,
        SUM(COALESCE(s.n_live_tup, 0)) as total_rows,
        pg_size_pretty(SUM(pg_total_relation_size('public.' || t.tablename))) as total_size,
        SUM(pg_total_relation_size('public.' || t.tablename)) as total_size_bytes
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
    WHERE t.schemaname = 'public'
)
SELECT * FROM db_overview;

-- SECTION 2: Tables by Category with Cleanup Recommendations
SELECT '=== TABLES BY CATEGORY ===' as section;

WITH table_analysis AS (
    SELECT 
        t.tablename,
        COALESCE(s.n_live_tup, 0) as row_count,
        pg_total_relation_size('public.' || t.tablename) as size_bytes,
        pg_size_pretty(pg_total_relation_size('public.' || t.tablename)) as size_pretty,
        CASE 
            WHEN t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' OR t.tablename LIKE '%sample%' THEN 'TEST/TEMP'
            WHEN t.tablename LIKE '%maintenance%' THEN 'MAINTENANCE'
            WHEN t.tablename LIKE '%cleaning%' OR t.tablename LIKE '%clean%' THEN 'CLEANING'
            WHEN t.tablename LIKE '%financial%' OR t.tablename LIKE '%transaction%' OR t.tablename LIKE '%payment%' OR t.tablename LIKE '%expense%' THEN 'FINANCIAL'
            WHEN t.tablename LIKE '%email%' THEN 'EMAIL'
            WHEN t.tablename LIKE '%subscription%' OR t.tablename LIKE '%plan%' THEN 'SUBSCRIPTION'
            WHEN t.tablename LIKE '%profile%' OR t.tablename LIKE '%user%' THEN 'USER/PROFILE'
            WHEN t.tablename LIKE '%hotel%' THEN 'HOTEL'
            WHEN t.tablename LIKE '%room%' THEN 'ROOM'
            WHEN t.tablename LIKE '%guest%' THEN 'GUEST'
            WHEN t.tablename LIKE '%reservation%' THEN 'RESERVATION'
            WHEN t.tablename LIKE '%support%' OR t.tablename LIKE '%ticket%' THEN 'SUPPORT'
            ELSE 'CORE'
        END as category,
        -- Check if table is referenced by foreign keys
        EXISTS(
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
            WHERE ccu.table_name = t.tablename
                AND tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
        ) as is_referenced,
        -- Check if table has foreign keys
        EXISTS(
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_name = t.tablename 
                AND tc.table_schema = 'public'
                AND tc.constraint_type = 'FOREIGN KEY'
        ) as has_foreign_keys
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
    WHERE t.schemaname = 'public'
),
categorized_summary AS (
    SELECT 
        category,
        COUNT(*) as table_count,
        SUM(row_count) as total_rows,
        SUM(size_bytes) as total_bytes,
        pg_size_pretty(SUM(size_bytes)) as total_size,
        SUM(CASE WHEN row_count = 0 THEN 1 ELSE 0 END) as empty_tables,
        SUM(CASE WHEN NOT is_referenced AND row_count = 0 THEN 1 ELSE 0 END) as removable_empty
    FROM table_analysis
    GROUP BY category
)
SELECT 
    category,
    table_count,
    total_rows,
    total_size,
    empty_tables,
    removable_empty,
    CASE 
        WHEN category = 'TEST/TEMP' THEN 'REMOVE ALL - Test/temporary tables'
        WHEN removable_empty > 0 THEN 'REVIEW - Has ' || removable_empty || ' removable empty tables'
        ELSE 'KEEP - Active category'
    END as recommendation
FROM categorized_summary
ORDER BY 
    CASE category
        WHEN 'TEST/TEMP' THEN 1
        WHEN 'CORE' THEN 2
        ELSE 3
    END,
    category;

-- SECTION 3: Specific Tables Recommended for Removal
SELECT '=== TABLES RECOMMENDED FOR REMOVAL ===' as section;

WITH removal_candidates AS (
    SELECT 
        t.tablename,
        COALESCE(s.n_live_tup, 0) as row_count,
        pg_size_pretty(pg_total_relation_size('public.' || t.tablename)) as table_size,
        CASE 
            WHEN t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' OR t.tablename LIKE '%sample%' 
                THEN 'TEST/TEMP - Safe to remove'
            WHEN COALESCE(s.n_live_tup, 0) = 0 
                AND NOT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu
                        ON tc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_name = t.tablename
                        AND tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_schema = 'public'
                )
                AND t.tablename NOT IN (
                    'profiles', 'hotels', 'rooms', 'guests', 'reservations',
                    'subscription_plans', 'maintenance_orders', 'cleaning_tasks',
                    'maintenance_categories', 'maintenance_technicians',
                    'cleaning_personnel', 'financial_transactions', 'expenses'
                )
                THEN 'EMPTY UNREFERENCED - Safe to remove'
            ELSE NULL
        END as removal_reason
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
    WHERE t.schemaname = 'public'
)
SELECT 
    tablename,
    row_count,
    table_size,
    removal_reason
FROM removal_candidates
WHERE removal_reason IS NOT NULL
ORDER BY 
    CASE 
        WHEN removal_reason LIKE 'TEST/TEMP%' THEN 1
        ELSE 2
    END,
    tablename;

-- SECTION 4: Potential Duplicates Requiring Manual Review
SELECT '=== POTENTIAL DUPLICATES FOR MANUAL REVIEW ===' as section;

WITH potential_duplicates AS (
    SELECT 
        t1.tablename as table1,
        t2.tablename as table2,
        COALESCE(s1.n_live_tup, 0) as table1_rows,
        COALESCE(s2.n_live_tup, 0) as table2_rows,
        pg_size_pretty(pg_total_relation_size('public.' || t1.tablename)) as table1_size,
        pg_size_pretty(pg_total_relation_size('public.' || t2.tablename)) as table2_size
    FROM pg_tables t1
    JOIN pg_tables t2 ON t1.tablename < t2.tablename
    LEFT JOIN pg_stat_user_tables s1 ON s1.tablename = t1.tablename
    LEFT JOIN pg_stat_user_tables s2 ON s2.tablename = t2.tablename
    WHERE t1.schemaname = 'public' 
        AND t2.schemaname = 'public'
        AND (
            -- Tables with similar base names
            similarity(t1.tablename, t2.tablename) > 0.7
            OR
            -- Tables that might be versions of each other
            (t1.tablename = regexp_replace(t2.tablename, '_v[0-9]+$|_[0-9]+$|_fixed$|_new$|_old$|_backup$|_temp$', ''))
            OR
            -- Similar functional tables
            (t1.tablename LIKE '%maintenance%' AND t2.tablename LIKE '%maintenance%' AND t1.tablename != t2.tablename)
            OR
            (t1.tablename LIKE '%cleaning%' AND t2.tablename LIKE '%cleaning%' AND t1.tablename != t2.tablename)
        )
)
SELECT 
    table1,
    table2,
    table1_rows,
    table2_rows,
    table1_size,
    table2_size,
    CASE 
        WHEN table1_rows = 0 AND table2_rows > 0 THEN 'Consider removing ' || table1
        WHEN table2_rows = 0 AND table1_rows > 0 THEN 'Consider removing ' || table2
        WHEN table1_rows = 0 AND table2_rows = 0 THEN 'Both empty - compare structure'
        ELSE 'Manual review needed - both have data'
    END as recommendation
FROM potential_duplicates
ORDER BY table1;

-- SECTION 5: Space Savings Estimate
SELECT '=== ESTIMATED SPACE SAVINGS ===' as section;

WITH savings_estimate AS (
    SELECT 
        SUM(CASE 
            WHEN t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' OR t.tablename LIKE '%sample%'
            THEN pg_total_relation_size('public.' || t.tablename)
            ELSE 0
        END) as test_table_bytes,
        SUM(CASE 
            WHEN COALESCE(s.n_live_tup, 0) = 0 
                AND NOT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu
                        ON tc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_name = t.tablename
                        AND tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_schema = 'public'
                )
                AND t.tablename NOT IN (
                    'profiles', 'hotels', 'rooms', 'guests', 'reservations',
                    'subscription_plans', 'maintenance_orders', 'cleaning_tasks',
                    'maintenance_categories', 'maintenance_technicians',
                    'cleaning_personnel', 'financial_transactions', 'expenses'
                )
            THEN pg_total_relation_size('public.' || t.tablename)
            ELSE 0
        END) as empty_table_bytes
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
    WHERE t.schemaname = 'public'
)
SELECT 
    pg_size_pretty(test_table_bytes) as space_from_test_tables,
    pg_size_pretty(empty_table_bytes) as space_from_empty_tables,
    pg_size_pretty(test_table_bytes + empty_table_bytes) as total_potential_savings
FROM savings_estimate;

-- SECTION 6: Final Recommendations Summary
SELECT '=== FINAL RECOMMENDATIONS SUMMARY ===' as section;

SELECT 
    'IMMEDIATE REMOVAL' as priority,
    'Test/Debug/Temporary tables' as category,
    COUNT(*) as table_count
FROM pg_tables t
WHERE t.schemaname = 'public'
    AND (t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' OR t.tablename LIKE '%sample%')

UNION ALL

SELECT 
    'SAFE REMOVAL' as priority,
    'Empty unreferenced tables' as category,
    COUNT(*) as table_count
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
    AND t.tablename NOT IN (
        'profiles', 'hotels', 'rooms', 'guests', 'reservations',
        'subscription_plans', 'maintenance_orders', 'cleaning_tasks',
        'maintenance_categories', 'maintenance_technicians',
        'cleaning_personnel', 'financial_transactions', 'expenses'
    )

UNION ALL

SELECT 
    'MANUAL REVIEW' as priority,
    'Potential duplicates' as category,
    COUNT(DISTINCT t1.tablename) as table_count
FROM pg_tables t1
JOIN pg_tables t2 ON t1.tablename < t2.tablename
WHERE t1.schemaname = 'public' 
    AND t2.schemaname = 'public'
    AND similarity(t1.tablename, t2.tablename) > 0.7

ORDER BY 
    CASE priority
        WHEN 'IMMEDIATE REMOVAL' THEN 1
        WHEN 'SAFE REMOVAL' THEN 2
        WHEN 'MANUAL REVIEW' THEN 3
    END;
