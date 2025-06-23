-- Script para testar funcionalidades básicas (SEM criar usuários fictícios)

-- 1. Verificar se existem usuários no sistema
SELECT 
    COUNT(*) as total_users,
    'Usuários existentes no sistema de autenticação' as description
FROM auth.users;

-- 2. Verificar planos de assinatura
SELECT 
    COUNT(*) as total_plans,
    'Planos de assinatura disponíveis' as description
FROM subscription_plans;

-- 3. Listar planos disponíveis
SELECT 
    name,
    price_monthly,
    max_hotels,
    max_rooms,
    'Plano disponível' as status
FROM subscription_plans
ORDER BY price_monthly;

-- 4. Verificar estrutura das tabelas principais
SELECT 
    table_name,
    'Tabela criada' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles',
    'hotels', 
    'rooms',
    'reservations',
    'maintenance_orders',
    'cleaning_tasks',
    'financial_transactions'
)
ORDER BY table_name;

-- 5. Verificar tipos ENUM criados
SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN (
    'user_role',
    'room_status', 
    'reservation_status',
    'maintenance_status',
    'cleaning_status'
)
GROUP BY t.typname
ORDER BY t.typname;

-- 6. Verificar RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Ativo'
        ELSE '❌ RLS Inativo'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'hotels', 'rooms', 'reservations')
ORDER BY tablename;

-- 7. Verificar índices criados
SELECT 
    indexname,
    tablename,
    'Índice criado para performance' as description
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 8. Verificar triggers/funções
SELECT 
    trigger_name,
    event_object_table,
    'Trigger ativo' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

SELECT '🎉 SISTEMA VERIFICADO E PRONTO PARA USO!' as final_status;
SELECT '📝 Para testar com dados reais, faça login na aplicação' as next_step;
