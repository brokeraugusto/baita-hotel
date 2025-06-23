-- Verificar se o sistema de e-mail foi criado corretamente

-- Verificar tabelas criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('email_templates', 'email_logs', 'email_settings', 'email_variables')
ORDER BY table_name;

-- Verificar templates inseridos
SELECT 
    id,
    name,
    template_key,
    is_active,
    is_system,
    created_at
FROM email_templates
ORDER BY name;

-- Verificar variáveis inseridas
SELECT 
    variable_key,
    variable_name,
    variable_type,
    is_required,
    is_system
FROM email_variables
ORDER BY variable_key;

-- Verificar configurações de e-mail
SELECT 
    from_email,
    from_name,
    provider,
    is_active
FROM email_settings;

-- Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('email_templates', 'email_logs', 'email_settings', 'email_variables')
ORDER BY tablename, indexname;

-- Verificar triggers criados
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%email%'
ORDER BY event_object_table, trigger_name;

-- Contar registros
SELECT 
    'email_templates' as tabela,
    COUNT(*) as total_registros
FROM email_templates
UNION ALL
SELECT 
    'email_variables' as tabela,
    COUNT(*) as total_registros
FROM email_variables
UNION ALL
SELECT 
    'email_settings' as tabela,
    COUNT(*) as total_registros
FROM email_settings
UNION ALL
SELECT 
    'email_logs' as tabela,
    COUNT(*) as total_registros
FROM email_logs;
