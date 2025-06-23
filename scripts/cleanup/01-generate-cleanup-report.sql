-- Generate comprehensive cleanup report based on analysis

-- First, let's see what we're working with
SELECT 'CURRENT DATABASE STATE' as section;

SELECT 
    COUNT(*) as total_tables,
    SUM(CASE WHEN n_live_tup = 0 THEN 1 ELSE 0 END) as empty_tables,
    SUM(CASE WHEN tablename LIKE '%test%' OR tablename LIKE '%temp%' OR tablename LIKE '%debug%' THEN 1 ELSE 0 END) as test_tables,
    pg_size_pretty(SUM(pg_total_relation_size('public.' || tablename))) as total_size
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
WHERE t.schemaname = 'public';

-- Show all tables categorized
SELECT 'TABLE CATEGORIZATION' as section;

WITH categorized_tables AS (
    SELECT 
        t.tablename,
        COALESCE(s.n_live_tup, 0) as row_count,
        pg_total_relation_size('public.' || t.tablename) as size_bytes,
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
        END as category
    FROM pg_tables t
    LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
    WHERE t.schemaname = 'public'
)
SELECT 
    category,
    COUNT(*) as table_count,
    SUM(row_count) as total_rows,
    pg_size_pretty(SUM(size_bytes)) as total_size,
    array_agg(tablename ORDER BY tablename) as tables
FROM categorized_tables
GROUP BY category
ORDER BY 
    CASE category
        WHEN 'TEST/TEMP' THEN 1
        WHEN 'CORE' THEN 2
        ELSE 3
    END,
    category;
