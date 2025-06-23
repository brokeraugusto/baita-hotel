-- Investigar estrutura atual da tabela maintenance_orders
SELECT 'INVESTIGANDO ESTRUTURA DA TABELA MAINTENANCE_ORDERS' as title;

-- Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_orders')
        THEN 'Tabela maintenance_orders EXISTE'
        ELSE 'Tabela maintenance_orders NÃO EXISTE'
    END as table_status;

-- Mostrar todas as colunas da tabela maintenance_orders
SELECT 'COLUNAS ATUAIS DA TABELA MAINTENANCE_ORDERS:' as title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'maintenance_orders' 
ORDER BY ordinal_position;

-- Verificar se existe alguma coluna com nome similar
SELECT 'COLUNAS COM NOMES SIMILARES:' as title;
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'maintenance_orders' 
AND (column_name ILIKE '%assign%' OR column_name ILIKE '%technic%');

-- Verificar constraints
SELECT 'CONSTRAINTS DA TABELA:' as title;
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'maintenance_orders';

-- Verificar índices
SELECT 'ÍNDICES DA TABELA:' as title;
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'maintenance_orders';
