-- Script para corrigir dados e adicionar chaves estrangeiras à tabela maintenance_templates

-- Função auxiliar para verificar se uma tabela existe
CREATE OR REPLACE FUNCTION table_exists(p_schema_name TEXT, p_table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = p_schema_name AND table_name = p_table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para verificar se uma constraint existe
CREATE OR REPLACE FUNCTION constraint_exists(p_constraint_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = p_constraint_name
    );
END;
$$ LANGUAGE plpgsql;

-- 1. Corrigir e adicionar FK para hotel_id
DO $$
BEGIN
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_maintenance_templates_hotel_id') THEN
        RAISE NOTICE 'Verificando e corrigindo hotel_id em maintenance_templates...';
        -- Atualiza hotel_id para NULL onde não há correspondência em hotels
        UPDATE maintenance_templates
        SET hotel_id = NULL
        WHERE hotel_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM hotels WHERE hotels.id = maintenance_templates.hotel_id);

        RAISE NOTICE 'Adicionando FK fk_maintenance_templates_hotel_id...';
        ALTER TABLE maintenance_templates
        ADD CONSTRAINT fk_maintenance_templates_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
        RAISE NOTICE 'FK fk_maintenance_templates_hotel_id adicionada.';
    ELSEIF NOT table_exists('public', 'hotels') THEN
        RAISE NOTICE 'Tabela hotels não existe. Pulando FK fk_maintenance_templates_hotel_id.';
    ELSE
        RAISE NOTICE 'FK fk_maintenance_templates_hotel_id já existe. Pulando.';
    END IF;
END $$;

-- 2. Corrigir e adicionar FK para room_id
DO $$
BEGIN
    IF table_exists('public', 'rooms') AND NOT constraint_exists('fk_maintenance_templates_room_id') THEN
        RAISE NOTICE 'Verificando e corrigindo room_id em maintenance_templates...';
        -- Atualiza room_id para NULL onde não há correspondência em rooms
        UPDATE maintenance_templates
        SET room_id = NULL
        WHERE room_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.id = maintenance_templates.room_id);

        RAISE NOTICE 'Adicionando FK fk_maintenance_templates_room_id...';
        ALTER TABLE maintenance_templates
        ADD CONSTRAINT fk_maintenance_templates_room_id FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_maintenance_templates_room_id adicionada.';
    ELSEIF NOT table_exists('public', 'rooms') THEN
        RAISE NOTICE 'Tabela rooms não existe. Pulando FK fk_maintenance_templates_room_id.';
    ELSE
        RAISE NOTICE 'FK fk_maintenance_templates_room_id já existe. Pulando.';
    END IF;
END $$;

-- 3. Corrigir e adicionar FK para category_id
DO $$
BEGIN
    IF table_exists('public', 'maintenance_categories') AND NOT constraint_exists('fk_maintenance_templates_category_id') THEN
        RAISE NOTICE 'Verificando e corrigindo category_id em maintenance_templates...';
        -- Atualiza category_id para NULL onde não há correspondência em maintenance_categories
        UPDATE maintenance_templates
        SET category_id = NULL
        WHERE category_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM maintenance_categories WHERE maintenance_categories.id = maintenance_templates.category_id);

        RAISE NOTICE 'Adicionando FK fk_maintenance_templates_category_id...';
        ALTER TABLE maintenance_templates
        ADD CONSTRAINT fk_maintenance_templates_category_id FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_maintenance_templates_category_id adicionada.';
    ELSEIF NOT table_exists('public', 'maintenance_categories') THEN
        RAISE NOTICE 'Tabela maintenance_categories não existe. Pulando FK fk_maintenance_templates_category_id.';
    ELSE
        RAISE NOTICE 'FK fk_maintenance_templates_category_id já existe. Pulando.';
    END IF;
END $$;

-- 4. Corrigir e adicionar FK para assigned_technician_id
DO $$
BEGIN
    IF table_exists('public', 'maintenance_technicians') AND NOT constraint_exists('fk_maintenance_templates_assigned_technician_id') THEN
        RAISE NOTICE 'Verificando e corrigindo assigned_technician_id em maintenance_templates...';
        -- Atualiza assigned_technician_id para NULL onde não há correspondência em maintenance_technicians
        UPDATE maintenance_templates
        SET assigned_technician_id = NULL
        WHERE assigned_technician_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM maintenance_technicians WHERE maintenance_technicians.id = maintenance_templates.assigned_technician_id);

        RAISE NOTICE 'Adicionando FK fk_maintenance_templates_assigned_technician_id...';
        ALTER TABLE maintenance_templates
        ADD CONSTRAINT fk_maintenance_templates_assigned_technician_id FOREIGN KEY (assigned_technician_id) REFERENCES maintenance_technicians(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_maintenance_templates_assigned_technician_id adicionada.';
    ELSEIF NOT table_exists('public', 'maintenance_technicians') THEN
        RAISE NOTICE 'Tabela maintenance_technicians não existe. Pulando FK fk_maintenance_templates_assigned_technician_id.';
    ELSE
        RAISE NOTICE 'FK fk_maintenance_templates_assigned_technician_id já existe. Pulando.';
    END IF;
END $$;

SELECT 'Verificação e correção de chaves estrangeiras para maintenance_templates concluídas.' AS status;
