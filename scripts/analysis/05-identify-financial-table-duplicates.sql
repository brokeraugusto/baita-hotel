-- Analyze financial-related tables for duplicates and obsolete versions

-- 1. List all financial-related tables
SELECT 
    tablename,
    n_live_tup as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND (tablename LIKE '%financial%' OR tablename LIKE '%transaction%' OR tablename LIKE '%payment%' OR tablename LIKE '%expense%')
ORDER BY tablename;

-- 2. Compare financial transaction table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%transaction%'
ORDER BY table_name, ordinal_position;

-- 3. Check for expense table duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%expense%'
ORDER BY table_name, ordinal_position;

-- 4. Identify financial tables with no data
SELECT 
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND (tablename LIKE '%financial%' OR tablename LIKE '%transaction%' OR tablename LIKE '%payment%' OR tablename LIKE '%expense%')
    AND n_live_tup = 0
ORDER BY tablename;
