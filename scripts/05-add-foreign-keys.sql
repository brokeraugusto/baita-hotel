-- Adicionar foreign keys de forma segura
BEGIN;

SELECT 'ADICIONANDO FOREIGN KEYS DE FORMA SEGURA' as title;

-- Função para adicionar FK apenas se não existir
CREATE OR REPLACE FUNCTION add_foreign_key_if_not_exists(
    table_name TEXT,
    constraint_name TEXT,
    foreign_key_sql TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = constraint_name 
        AND table_name = table_name
    ) THEN
        EXECUTE foreign_key_sql;
        RAISE NOTICE 'Foreign key % adicionada à tabela %', constraint_name, table_name;
    ELSE
        RAISE NOTICE 'Foreign key % já existe na tabela %', constraint_name, table_name;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao adicionar FK % na tabela %: %', constraint_name, table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Adicionar FKs para reservations (apenas se as tabelas existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations') THEN
        PERFORM add_foreign_key_if_not_exists(
            'reservations',
            'fk_reservations_room',
            'ALTER TABLE reservations ADD CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL'
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guests') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations') THEN
        PERFORM add_foreign_key_if_not_exists(
            'reservations',
            'fk_reservations_guest',
            'ALTER TABLE reservations ADD CONSTRAINT fk_reservations_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL'
        );
    END IF;
END $$;

-- Adicionar FKs para maintenance_orders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_orders') THEN
        PERFORM add_foreign_key_if_not_exists(
            'maintenance_orders',
            'fk_maintenance_orders_room',
            'ALTER TABLE maintenance_orders ADD CONSTRAINT fk_maintenance_orders_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL'
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_categories') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_orders') THEN
        PERFORM add_foreign_key_if_not_exists(
            'maintenance_orders',
            'fk_maintenance_orders_category',
            'ALTER TABLE maintenance_orders ADD CONSTRAINT fk_maintenance_orders_category FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE SET NULL'
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_technicians') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_orders') THEN
        PERFORM add_foreign_key_if_not_exists(
            'maintenance_orders',
            'fk_maintenance_orders_technician',
            'ALTER TABLE maintenance_orders ADD CONSTRAINT fk_maintenance_orders_technician FOREIGN KEY (assigned_technician_id) REFERENCES maintenance_technicians(id) ON DELETE SET NULL'
        );
    END IF;
END $$;

-- Adicionar FKs para maintenance_order_materials
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_orders') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_order_materials') THEN
        PERFORM add_foreign_key_if_not_exists(
            'maintenance_order_materials',
            'fk_maintenance_order_materials_order',
            'ALTER TABLE maintenance_order_materials ADD CONSTRAINT fk_maintenance_order_materials_order FOREIGN KEY (maintenance_order_id) REFERENCES maintenance_orders(id) ON DELETE CASCADE'
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_materials') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_order_materials') THEN
        PERFORM add_foreign_key_if_not_exists(
            'maintenance_order_materials',
            'fk_maintenance_order_materials_material',
            'ALTER TABLE maintenance_order_materials ADD CONSTRAINT fk_maintenance_order_materials_material FOREIGN KEY (material_id) REFERENCES maintenance_materials(id) ON DELETE CASCADE'
        );
    END IF;
END $$;

-- Adicionar FKs para maintenance_templates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_categories') AND
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_templates') THEN
        PERFORM add_foreign_key_if_not_exists(
            'maintenance_templates',
            'fk_maintenance_templates_category',
            'ALTER TABLE maintenance_templates ADD CONSTRAINT fk_maintenance_templates_category FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE SET NULL'
        );
    END IF;
END $$;

-- Remover função temporária
DROP FUNCTION IF EXISTS add_foreign_key_if_not_exists(TEXT, TEXT, TEXT);

COMMIT;

SELECT 'Foreign keys adicionadas com sucesso!' as status;
