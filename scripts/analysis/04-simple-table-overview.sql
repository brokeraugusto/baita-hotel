-- Simple overview of all tables in the database

-- 1. Basic table list with row counts
SELECT 
    t.tablename,
    COALESCE(s.n_live_tup, 0) as row_count,
    pg_size_pretty(pg_total_relation_size('public.' || t.tablename)) as table_size,
    CASE 
        WHEN t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' 
             OR t.tablename LIKE '%sample%' OR t.tablename LIKE '%demo%' THEN 'TEST/TEMP'
        WHEN t.tablename LIKE '%old%' OR t.tablename LIKE '%backup%' OR t.tablename LIKE '%_v1%' 
             OR t.tablename LIKE '%_v2%' OR t.tablename LIKE '%_fixed%' THEN 'VERSIONED'
        WHEN t.tablename LIKE '%maintenance%' THEN 'MAINTENANCE'
        WHEN t.tablename LIKE '%cleaning%' OR t.tablename LIKE '%clean%' THEN 'CLEANING'
        WHEN t.tablename LIKE '%financial%' OR t.tablename LIKE '%transaction%' OR t.tablename LIKE '%payment%' THEN 'FINANCIAL'
        WHEN t.tablename LIKE '%profile%' OR t.tablename LIKE '%user%' THEN 'USER/PROFILE'
        WHEN t.tablename LIKE '%hotel%' THEN 'HOTEL'
        WHEN t.tablename LIKE '%room%' THEN 'ROOM'
        WHEN t.tablename LIKE '%guest%' THEN 'GUEST'
        WHEN t.tablename LIKE '%reservation%' THEN 'RESERVATION'
        ELSE 'CORE'
    END as category
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename AND s.schemaname = t.schemaname
WHERE t.schemaname = 'public'
ORDER BY 
    CASE 
        WHEN t.tablename LIKE '%test%' OR t.tablename LIKE '%temp%' OR t.tablename LIKE '%debug%' 
             OR t.tablename LIKE '%sample%' OR t.tablename LIKE '%demo%' THEN 1
        WHEN t.tablename LIKE '%old%' OR t.tablename LIKE '%backup%' OR t.tablename LIKE '%_v1%' 
             OR t.tablename LIKE '%_v2%' OR t.tablename LIKE '%_fixed%' THEN 2
        ELSE 3
    END,
    t.tablename;

-- 2. Tables with zero rows
SELECT 
    tablename,
    'Empty table - candidate for removal' as note
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_live_tup = 0
ORDER BY tablename;

-- 3. Potential duplicate tables (similar names)
SELECT 
    t1.tablename as table1,
    t2.tablename as table2,
    'Potential duplicates - review needed' as note
FROM pg_tables t1
JOIN pg_tables t2 ON t1.schemaname = t2.schemaname
WHERE t1.schemaname = 'public'
    AND t1.tablename < t2.tablename
    AND (
        -- Similar base names
        SUBSTRING(t1.tablename FROM '^[^_]+') = SUBSTRING(t2.tablename FROM '^[^_]+')
        OR
        -- One is a version of the other
        t1.tablename LIKE t2.tablename || '%' OR t2.tablename LIKE t1.tablename || '%'
    )
ORDER BY t1.tablename;
