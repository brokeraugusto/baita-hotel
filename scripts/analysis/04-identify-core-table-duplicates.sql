-- Analyze core system tables for duplicates and obsolete versions

-- 1. Check for profile/user table duplicates
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND (table_name LIKE '%profile%' OR table_name LIKE '%user%')
ORDER BY table_name, ordinal_position;

-- 2. Check for hotel-related table duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%hotel%'
ORDER BY table_name, ordinal_position;

-- 3. Check for room-related table duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%room%'
ORDER BY table_name, ordinal_position;

-- 4. Check for guest-related table duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%guest%'
ORDER BY table_name, ordinal_position;

-- 5. Check for reservation-related table duplicates
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%reservation%'
ORDER BY table_name, ordinal_position;
