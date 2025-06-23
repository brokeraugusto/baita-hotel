-- Script de diagnóstico completo do banco de dados
SELECT 'DIAGNÓSTICO COMPLETO DO BANCO DE DADOS' as title;

-- 1. Verificar todas as tabelas existentes
SELECT 'TABELAS EXISTENTES:' as section;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- 2. Verificar constraints problemáticas
SELECT 'CONSTRAINTS PROBLEMÁTICAS:' as section;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 3. Verificar contagem de registros em tabelas existentes
SELECT 'CONTAGEM DE REGISTROS:' as section;

DO $$
DECLARE
    table_record RECORD;
    sql_query TEXT;
    result_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        sql_query := 'SELECT COUNT(*) FROM ' || table_record.tablename;
        EXECUTE sql_query INTO result_count;
        RAISE NOTICE 'Tabela %: % registros', table_record.tablename, result_count;
    END LOOP;
END $$;

-- 4. Verificar se há erros de estrutura
SELECT 'VERIFICAÇÃO DE ESTRUTURA:' as section;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'rooms', 'maintenance_orders', 'maintenance_categories', 'maintenance_technicians')
ORDER BY table_name, ordinal_position;
