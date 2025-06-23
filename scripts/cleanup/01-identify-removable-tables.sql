-- Identify tables that can be safely removed

-- 1. Test/Debug/Temporary tables (SAFE TO REMOVE)
SELECT 
    'TEST/TEMP' as category,
    tablename,
    COALESCE(n_live_tup, 0) as row_count,
    'Safe to remove - test/temporary table' as reason
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
WHERE t.schemaname = 'public'
    AND (
        t.tablename LIKE '%test%' OR
        t.tablename LIKE '%temp%' OR
        t.tablename LIKE '%tmp%' OR
        t.tablename LIKE '%debug%' OR
        t.tablename LIKE '%sample%' OR
        t.tablename LIKE '%demo%'
    )
ORDER BY t.tablename;

-- 2. Versioned/Backup tables (REVIEW NEEDED)
SELECT 
    'VERSIONED' as category,
    tablename,
    COALESCE(n_live_tup, 0) as row_count,
    'Review needed - may be obsolete version' as reason
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
WHERE t.schemaname = 'public'
    AND (
        t.tablename LIKE '%old%' OR
        t.tablename LIKE '%backup%' OR
        t.tablename LIKE '%_v1%' OR
        t.tablename LIKE '%_v2%' OR
        t.tablename LIKE '%_fixed%' OR
        t.tablename LIKE '%_temp%'
    )
ORDER BY t.tablename;

-- 3. Empty tables that might be removable
SELECT 
    'EMPTY' as category,
    t.tablename,
    0 as row_count,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
            WHERE ccu.table_name = t.tablename
                AND tc.constraint_type = 'FOREIGN KEY'
        ) THEN 'Keep - referenced by other tables'
        WHEN t.tablename IN ('profiles', 'hotels', 'rooms', 'guests', 'reservations', 
                            'maintenance_orders', 'cleaning_tasks', 'financial_transactions',
                            'subscription_plans') THEN 'Keep - core system table'
        ELSE 'Consider removal - empty and not referenced'
    END as reason
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON s.tablename = t.tablename
WHERE t.schemaname = 'public'
    AND COALESCE(s.n_live_tup, 0) = 0
ORDER BY t.tablename;
