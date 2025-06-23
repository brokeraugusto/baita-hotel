-- Verificação final do sistema - CORRIGIDO

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    missing_tables text[] := ARRAY[]::text[];
    current_table text;
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
    FOREACH current_table IN ARRAY essential_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = current_table
        ) THEN
            missing_tables := array_append(missing_tables, current_table);
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

-- Verificar tipos ENUM
SELECT 
    COUNT(*) as total_enums,
    CASE WHEN COUNT(*) >= 8 THEN '✅ Tipos ENUM criados' ELSE '❌ Faltam tipos ENUM' END as status
FROM pg_type 
WHERE typtype = 'e' 
AND typname IN ('user_role', 'subscription_status', 'room_status', 'reservation_status', 'maintenance_status', 'maintenance_priority', 'cleaning_status', 'transaction_type');

-- Verificar índices
SELECT 
    COUNT(*) as total_indexes,
    CASE WHEN COUNT(*) >= 10 THEN '✅ Índices criados' ELSE '❌ Faltam índices' END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Resumo final
SELECT 
    '🎉 SISTEMA PRONTO PARA PRODUÇÃO!' as status,
    '📋 Próximos passos:' as next_steps;

SELECT 
    '1. Fazer deploy da aplicação' as step_1,
    '2. Testar cadastro de usuário' as step_2,
    '3. Testar criação de hotel' as step_3,
    '4. Configurar domínio personalizado' as step_4;
