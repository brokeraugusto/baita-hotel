-- Verificar se as tabelas foram criadas
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('maintenance_templates', 'maintenance_inspections', 'maintenance_materials', 'maintenance_order_materials');

-- Verificar se os campos foram adicionados à tabela maintenance_orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'maintenance_orders' 
AND column_name IN ('maintenance_type', 'recurrence_type', 'next_occurrence', 'is_emergency', 'emergency_level');

-- Verificar se os índices foram criados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename LIKE 'maintenance%';

-- Verificar se os triggers foram criados
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'maintenance_orders';

-- Verificar dados de exemplo
SELECT COUNT(*) AS template_count FROM maintenance_templates;
SELECT COUNT(*) AS material_count FROM maintenance_materials;
