-- Comprehensive analysis of current database state (FIXED)
-- This script will identify all tables, their relationships, and usage patterns

-- 1. List all tables in the database
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Get table sizes and row counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Identify foreign key relationships
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 4. Check for duplicate table structures (similar column patterns)
WITH table_columns AS (
    SELECT 
        table_name,
        string_agg(column_name || ':' || data_type, ',' ORDER BY ordinal_position) as column_signature
    FROM information_schema.columns
    WHERE table_schema = 'public'
    GROUP BY table_name
)
SELECT 
    t1.table_name as table1,
    t2.table_name as table2,
    t1.column_signature
FROM table_columns t1
JOIN table_columns t2 ON t1.column_signature = t2.column_signature
WHERE t1.table_name < t2.table_name
ORDER BY t1.table_name;

-- 5. Identify tables with similar names (potential duplicates) - simplified version
SELECT 
    t1.tablename as table1,
    t2.tablename as table2
FROM pg_tables t1
CROSS JOIN pg_tables t2
WHERE t1.schemaname = 'public' 
    AND t2.schemaname = 'public'
    AND t1.tablename != t2.tablename
    AND t1.tablename < t2.tablename
    AND (
        t1.tablename LIKE t2.tablename || '%' OR
        t2.tablename LIKE t1.tablename || '%' OR
        levenshtein(t1.tablename, t2.tablename) <= 3
    )
ORDER BY t1.tablename;

-- 6. Check for empty tables
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_live_tup = 0
ORDER BY tablename;

-- 7. Identify tables that might be test/temporary tables
SELECT tablename
FROM pg_tables 
WHERE schemaname = 'public'
    AND (
        tablename LIKE '%test%' OR
        tablename LIKE '%temp%' OR
        tablename LIKE '%tmp%' OR
        tablename LIKE '%debug%' OR
        tablename LIKE '%sample%' OR
        tablename LIKE '%demo%' OR
        tablename LIKE '%old%' OR
        tablename LIKE '%backup%' OR
        tablename LIKE '%_v1%' OR
        tablename LIKE '%_v2%' OR
        tablename LIKE '%_fixed%'
    )
ORDER BY tablename;

-- 8. Check for tables with no foreign key references (potentially unused)
SELECT t.tablename
FROM pg_tables t
WHERE t.schemaname = 'public'
    AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = t.tablename
            AND tc.table_schema = 'public'
            AND tc.constraint_type = 'FOREIGN KEY'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = t.tablename
            AND tc.constraint_type = 'FOREIGN KEY'
    )
ORDER BY t.tablename;
