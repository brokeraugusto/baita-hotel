-- Analyze maintenance-related tables for duplicates and obsolete versions

-- 1. List all maintenance-related tables
SELECT 
    tablename,
    n_live_tup as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND tablename LIKE '%maintenance%'
ORDER BY tablename;

-- 2. Compare maintenance_orders table structures if multiple exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%maintenance%order%'
ORDER BY table_name, ordinal_position;

-- 3. Check for maintenance categories duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%maintenance%categor%'
ORDER BY table_name, ordinal_position;

-- 4. Check for maintenance technicians duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%maintenance%technic%'
ORDER BY table_name, ordinal_position;

-- 5. Identify maintenance tables with no data
SELECT 
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND tablename LIKE '%maintenance%'
    AND n_live_tup = 0
ORDER BY tablename;
