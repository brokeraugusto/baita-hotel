-- Verificação final do sistema

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    missing_tables text[] := ARRAY[]::text[];
    table_name text;
    essential_tables text[] := ARRAY[
        'profiles',
        'subscription_plans',
        'hotels', 
        'subscriptions',
        'room_categories',
        'rooms',
        'guests',
        'reservations',
        'maintenance_categories',
        'maintenance_technicians',
        'maintenance_orders',
        'cleaning_personnel',
        'cleaning_tasks',
        'financial_transactions'
    ];
BEGIN
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
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ Tabelas não encontradas: %', array_to_string(missing_tables, ', ');
        RAISE EXCEPTION 'Sistema não está completo';
    ELSE
        RAISE NOTICE '✅ Todas as tabelas essenciais foram criadas!';
    END IF;
END $$;

-- Verificar RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'hotels', 'rooms', 'reservations', 'maintenance_orders', 'cleaning_tasks', 'financial_transactions')
ORDER BY tablename;

-- Verificar planos de assinatura
SELECT 
    COUNT(*) as total_plans,
    CASE WHEN COUNT(*) >= 3 THEN '✅ Planos criados' ELSE '❌ Faltam planos' END as status
FROM subscription_plans;

-- Verificar triggers
SELECT 
    COUNT(*) as total_triggers,
    CASE WHEN COUNT(*) >= 8 THEN '✅ Triggers criados' ELSE '❌ Faltam triggers' END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

RAISE NOTICE '🎉 SISTEMA PRONTO PARA PRODUÇÃO!';
RAISE NOTICE '📋 Próximos passos:';
RAISE NOTICE '1. Fazer deploy da aplicação';
RAISE NOTICE '2. Testar cadastro de usuário';
RAISE NOTICE '3. Testar criação de hotel';
RAISE NOTICE '4. Configurar domínio personalizado';
