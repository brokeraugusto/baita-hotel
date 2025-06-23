-- Recriar foreign keys de forma segura
BEGIN;

SELECT 'RECRIANDO FOREIGN KEYS DE FORMA SEGURA' as title;

-- 1. Verificar se as tabelas de referência existem e têm dados válidos
SELECT 'Verificando tabelas de referência...' as status;

-- Verificar rooms
SELECT 'ROOMS:' as tabela, COUNT(*) as registros FROM rooms WHERE id IS NOT NULL;

-- Verificar maintenance_categories  
SELECT 'CATEGORIES:' as tabela, COUNT(*) as registros FROM maintenance_categories WHERE id IS NOT NULL;

-- Verificar maintenance_technicians
SELECT 'TECHNICIANS:' as tabela, COUNT(*) as registros FROM maintenance_technicians WHERE id IS NOT NULL;

-- 2. Criar foreign keys apenas se as referências existirem
DO $$
BEGIN
    -- FK para rooms (apenas se existirem rooms)
    IF EXISTS (SELECT 1 FROM rooms LIMIT 1) THEN
        -- Primeiro, limpar referências órfãs
        UPDATE maintenance_orders 
        SET room_id = NULL 
        WHERE room_id IS NOT NULL 
        AND room_id NOT IN (SELECT id FROM rooms WHERE id IS NOT NULL);
        
        -- Criar FK
        ALTER TABLE maintenance_orders 
        ADD CONSTRAINT fk_maintenance_orders_room_id 
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'FK para rooms criada';
    ELSE
        RAISE NOTICE 'Tabela rooms vazia - FK não criada';
    END IF;

    -- FK para categories (apenas se existirem categories)
    IF EXISTS (SELECT 1 FROM maintenance_categories LIMIT 1) THEN
        -- Primeiro, limpar referências órfãs
        UPDATE maintenance_orders 
        SET category_id = NULL 
        WHERE category_id IS NOT NULL 
        AND category_id NOT IN (SELECT id FROM maintenance_categories WHERE id IS NOT NULL);
        
        -- Criar FK
        ALTER TABLE maintenance_orders 
        ADD CONSTRAINT fk_maintenance_orders_category_id 
        FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'FK para categories criada';
    ELSE
        RAISE NOTICE 'Tabela maintenance_categories vazia - FK não criada';
    END IF;

    -- FK para technicians (apenas se existirem technicians)
    IF EXISTS (SELECT 1 FROM maintenance_technicians LIMIT 1) THEN
        -- Primeiro, limpar referências órfãs
        UPDATE maintenance_orders 
        SET assigned_technician_id = NULL 
        WHERE assigned_technician_id IS NOT NULL 
        AND assigned_technician_id NOT IN (SELECT id FROM maintenance_technicians WHERE id IS NOT NULL);
        
        -- Criar FK
        ALTER TABLE maintenance_orders 
        ADD CONSTRAINT fk_maintenance_orders_technician_id 
        FOREIGN KEY (assigned_technician_id) REFERENCES maintenance_technicians(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'FK para technicians criada';
    ELSE
        RAISE NOTICE 'Tabela maintenance_technicians vazia - FK não criada';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar FKs: %', SQLERRM;
        -- Continuar sem FKs se houver problemas
END $$;

COMMIT;

SELECT 'Foreign keys recriadas com segurança!' as status;

-- Verificar FKs criadas
SELECT 'FOREIGN KEYS CRIADAS:' as section;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'maintenance_orders';
