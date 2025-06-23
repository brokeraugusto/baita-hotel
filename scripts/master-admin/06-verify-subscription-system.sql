-- Verificar se o sistema de planos está funcionando corretamente

-- 1. Verificar planos criados
SELECT 
    'PLANOS DISPONÍVEIS' as section,
    name,
    price_monthly,
    price_yearly,
    max_rooms,
    max_users,
    is_active,
    is_featured,
    array_length(features, 1) as total_features
FROM subscription_plans
ORDER BY sort_order;

-- 2. Verificar estrutura das tabelas
SELECT 
    'ESTRUTURA DAS TABELAS' as section,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('subscription_plans', 'subscriptions', 'subscription_history')
ORDER BY table_name, ordinal_position;

-- 3. Verificar índices criados
SELECT 
    'ÍNDICES CRIADOS' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('subscription_plans', 'subscriptions', 'subscription_history')
ORDER BY tablename, indexname;

-- 4. Verificar triggers
SELECT 
    'TRIGGERS CRIADOS' as section,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('subscription_plans', 'subscriptions')
ORDER BY event_object_table, trigger_name;

-- 5. Testar inserção de um plano de teste
INSERT INTO subscription_plans (
    name, 
    slug, 
    description, 
    price_monthly, 
    price_yearly,
    features,
    max_hotels,
    max_rooms,
    max_users,
    max_integrations,
    is_active,
    is_featured,
    sort_order
) VALUES (
    'Teste Sistema',
    'teste-sistema',
    'Plano de teste para verificar funcionamento',
    49.90,
    499.00,
    '["Teste de funcionalidade", "Verificação do sistema", "Plano temporário"]'::jsonb,
    1,
    10,
    2,
    1,
    true,
    false,
    999
) ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

-- 6. Verificar se o plano de teste foi inserido
SELECT 
    'PLANO DE TESTE INSERIDO' as section,
    id,
    name,
    price_monthly,
    created_at,
    updated_at
FROM subscription_plans 
WHERE name = 'Teste Sistema';

-- 7. Remover o plano de teste
DELETE FROM subscription_plans WHERE name = 'Teste Sistema';

-- 8. Verificar contagem final
SELECT 
    'RESUMO FINAL' as section,
    COUNT(*) as total_planos,
    COUNT(*) FILTER (WHERE is_active = true) as planos_ativos,
    COUNT(*) FILTER (WHERE is_featured = true) as planos_destaque,
    SUM(price_monthly) as receita_total_mensal
FROM subscription_plans;
