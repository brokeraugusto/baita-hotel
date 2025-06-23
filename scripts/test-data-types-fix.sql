-- Testar se os tipos de dados foram corrigidos
SELECT 'TESTANDO CORREÇÃO DOS TIPOS DE DADOS' as title;

-- 1. Verificar tipos finais
SELECT 'TIPOS DE DADOS FINAIS:' as section;
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name IN ('maintenance_orders', 'rooms', 'maintenance_categories', 'maintenance_technicians')
AND column_name IN ('id', 'hotel_id', 'room_id', 'category_id', 'assigned_technician_id')
ORDER BY table_name, column_name;

-- 2. Testar inserção de uma ordem de manutenção
SELECT 'TESTANDO INSERÇÃO:' as section;

DO $$
DECLARE
    test_room_id UUID;
    test_category_id UUID;
    test_technician_id UUID;
    new_order_id UUID;
BEGIN
    -- Obter IDs válidos para teste (se existirem)
    SELECT id INTO test_room_id FROM rooms LIMIT 1;
    SELECT id INTO test_category_id FROM maintenance_categories LIMIT 1;
    SELECT id INTO test_technician_id FROM maintenance_technicians LIMIT 1;
    
    -- Inserir ordem de teste
    INSERT INTO maintenance_orders (
        id,
        hotel_id,
        room_id,
        category_id,
        assigned_technician_id,
        title,
        description,
        priority,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'hotel-test',
        test_room_id,
        test_category_id,
        test_technician_id,
        'Teste de Inserção',
        'Testando se os tipos de dados estão corretos',
        'medium',
        'pending',
        NOW(),
        NOW()
    ) RETURNING id INTO new_order_id;
    
    RAISE NOTICE 'Ordem de teste inserida com sucesso! ID: %', new_order_id;
    
    -- Remover ordem de teste
    DELETE FROM maintenance_orders WHERE id = new_order_id;
    RAISE NOTICE 'Ordem de teste removida';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no teste: %', SQLERRM;
END $$;

-- 3. Verificar dados existentes
SELECT 'DADOS EXISTENTES:' as section;
SELECT 
    COUNT(*) as total_orders,
    COUNT(room_id) as orders_with_room,
    COUNT(category_id) as orders_with_category,
    COUNT(assigned_technician_id) as orders_with_technician
FROM maintenance_orders;

-- 4. Verificar se há problemas de tipo restantes
SELECT 'VERIFICANDO PROBLEMAS RESTANTES:' as section;
SELECT 
    'Sem problemas de tipo detectados' as status
WHERE NOT EXISTS (
    SELECT 1 FROM maintenance_orders mo
    LEFT JOIN rooms r ON mo.room_id = r.id
    LEFT JOIN maintenance_categories mc ON mo.category_id = mc.id
    LEFT JOIN maintenance_technicians mt ON mo.assigned_technician_id = mt.id
    WHERE (mo.room_id IS NOT NULL AND r.id IS NULL)
    OR (mo.category_id IS NOT NULL AND mc.id IS NULL)
    OR (mo.assigned_technician_id IS NOT NULL AND mt.id IS NULL)
);

SELECT 'TESTE COMPLETO!' as final_status;
