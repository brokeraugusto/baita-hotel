-- Verificar se todas as tabelas essenciais existem
DO $$
DECLARE
    missing_tables text[] := ARRAY[]::text[];
    table_name text;
    essential_tables text[] := ARRAY[
        'profiles',
        'hotels', 
        'rooms',
        'reservations',
        'guests',
        'maintenance_orders',
        'cleaning_tasks',
        'financial_transactions'
    ];
BEGIN
    -- Verificar cada tabela essencial
    FOREACH table_name IN ARRAY essential_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    -- Reportar resultado
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ Tabelas não encontradas: %', array_to_string(missing_tables, ', ');
        RAISE EXCEPTION 'Sistema não está pronto para produção';
    ELSE
        RAISE NOTICE '✅ Todas as tabelas essenciais estão criadas';
        RAISE NOTICE '✅ Sistema pronto para produção!';
    END IF;
END $$;

-- Verificar RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'hotels', 'rooms', 'reservations')
ORDER BY tablename;
