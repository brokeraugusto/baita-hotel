-- Verifica a existência e a estrutura da tabela maintenance_orders
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'maintenance_orders'
ORDER BY
    ordinal_position;

-- Verifica a existência de índices na tabela maintenance_orders
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'maintenance_orders';

-- Verifica a existência de chaves primárias e estrangeiras
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
JOIN
    information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN
    information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE
    tc.table_name = 'maintenance_orders';
