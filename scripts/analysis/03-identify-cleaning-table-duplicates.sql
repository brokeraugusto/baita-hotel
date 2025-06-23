-- Analyze cleaning-related tables for duplicates and obsolete versions

-- 1. List all cleaning-related tables
SELECT 
    tablename,
    n_live_tup as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND (tablename LIKE '%cleaning%' OR tablename LIKE '%clean%')
ORDER BY tablename;

-- 2. Compare cleaning task table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%cleaning%task%'
ORDER BY table_name, ordinal_position;

-- 3. Check for cleaning personnel duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%cleaning%personnel%'
ORDER BY table_name, ordinal_position;

-- 4. Identify cleaning tables with no data
SELECT 
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND (tablename LIKE '%cleaning%' OR tablename LIKE '%clean%')
    AND n_live_tup = 0
ORDER BY tablename;
