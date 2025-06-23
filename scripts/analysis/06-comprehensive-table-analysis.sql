-- Comprehensive analysis to create removal recommendations

-- 1. Create a summary of all tables with metadata
WITH table_analysis AS (
    SELECT 
        t.tablename,
        COALESCE(s.n_live_tup, 0) as row_count,
        pg_size_pretty(pg_total_relation_size('public.' || t.tablename)) as table_size,
        pg_total_relation_size('public.' || t.tablename) as size_bytes,
        CASE 
            WHEN t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' THEN 'TEST/TEMP'
            WHEN t.tablename LIKE '%maintenance%' THEN 'MAINTENANCE'
            WHEN t.tablename LIKE '%cleaning%' OR t.tablename LIKE '%clean%' THEN 'CLEANING'
            WHEN t.tablename LIKE '%financial%' OR t.tablename LIKE '%transaction%' OR t.tablename LIKE '%payment%' THEN 'FINANCIAL'
            WHEN t.tablename LIKE '%profile%' OR t.tablename LIKE '%user%' THEN 'USER/PROFILE'
            WHEN t.tablename LIKE '%hotel%' THEN 'HOTEL'
            WHEN t.tablename LIKE '%room%' THEN 'ROOM'
            WHEN t.tablename LIKE '%guest%' THEN 'GUEST'
            WHEN t.tablename LIKE '%reservation%' THEN 'RESERVATION'
            ELSE 'OTHER'
        END as category,
        -- Check if table has foreign key constraints
        EXISTS(
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_name = t.tablename 
                AND tc.table_schema = 'public'
                AND tc.constraint_type = 'FOREIGN KEY'
        ) as has_foreign_keys,
        -- Check if table is referenced by other tables
        EXISTS(
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
            WHERE ccu.table_name = t.tablename
                AND tc.constraint_type = 'FOREIGN KEY'
        ) as is_referenced
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
    WHERE t.schemaname = 'public'
)
SELECT 
    tablename,
    category,
    row_count,
    table_size,
    has_foreign_keys,
    is_referenced,
    CASE 
        WHEN category = 'TEST/TEMP' THEN 'REMOVE - Test/Temporary table'
        WHEN row_count = 0 AND NOT is_referenced THEN 'CONSIDER REMOVAL - Empty and not referenced'
        WHEN row_count = 0 AND is_referenced THEN 'KEEP - Empty but referenced'
        WHEN size_bytes < 8192 AND row_count < 10 THEN 'REVIEW - Very small table'
        ELSE 'KEEP - Active table'
    END as recommendation
FROM table_analysis
ORDER BY 
    CASE 
        WHEN category = 'TEST/TEMP' THEN 1
        WHEN row_count = 0 AND NOT is_referenced THEN 2
        ELSE 3
    END,
    category,
    tablename;

-- 2. Identify potential duplicate tables by comparing column structures
WITH table_signatures AS (
    SELECT 
        table_name,
        array_agg(column_name || ':' || data_type ORDER BY ordinal_position) as columns,
        count(*) as column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    GROUP BY table_name
),
potential_duplicates AS (
    SELECT 
        t1.table_name as table1,
        t2.table_name as table2,
        t1.column_count,
        CASE 
            WHEN t1.columns = t2.columns THEN 'IDENTICAL'
            WHEN array_length(t1.columns & t2.columns, 1) > (t1.column_count * 0.8) THEN 'VERY_SIMILAR'
            WHEN array_length(t1.columns & t2.columns, 1) > (t1.column_count * 0.6) THEN 'SIMILAR'
            ELSE 'DIFFERENT'
        END as similarity
    FROM table_signatures t1
    JOIN table_signatures t2 ON t1.table_name < t2.table_name
    WHERE t1.column_count > 3  -- Only compare tables with substantial structure
)
SELECT 
    table1,
    table2,
    similarity,
    s1.n_live_tup as table1_rows,
    s2.n_live_tup as table2_rows,
    CASE 
        WHEN similarity = 'IDENTICAL' AND COALESCE(s1.n_live_tup, 0) = 0 THEN 'REMOVE ' || table1
        WHEN similarity = 'IDENTICAL' AND COALESCE(s2.n_live_tup, 0) = 0 THEN 'REMOVE ' || table2
        WHEN similarity = 'IDENTICAL' THEN 'REVIEW - Both have data'
        WHEN similarity = 'VERY_SIMILAR' THEN 'REVIEW - Very similar structure'
        ELSE 'OK - Different enough'
    END as recommendation
FROM potential_duplicates pd
LEFT JOIN pg_stat_user_tables s1 ON s1.tablename = pd.table1
LEFT JOIN pg_stat_user_tables s2 ON s2.tablename = pd.table2
WHERE similarity IN ('IDENTICAL', 'VERY_SIMILAR')
ORDER BY similarity DESC, table1;
