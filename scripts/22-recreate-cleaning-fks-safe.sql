-- Script para remover, limpar e recriar chaves estrangeiras para o módulo de limpeza de forma segura.
-- Este script lida com possíveis dados corrompidos (não-UUID em colunas UUID).

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

-- PASSO 1: REMOVER CHAVES ESTRANGEIRAS EXISTENTES (se houver)
DO $$
BEGIN
    IF constraint_exists('fk_cleaning_personnel_hotel_id') THEN
        ALTER TABLE cleaning_personnel DROP CONSTRAINT fk_cleaning_personnel_hotel_id;
    END IF;
    IF constraint_exists('fk_cleaning_tasks_room_id') THEN
        ALTER TABLE cleaning_tasks DROP CONSTRAINT fk_cleaning_tasks_room_id;
    END IF;
    IF constraint_exists('fk_cleaning_tasks_assigned_personnel_id') THEN
        ALTER TABLE cleaning_tasks DROP CONSTRAINT fk_cleaning_tasks_assigned_personnel_id;
    END IF;
    IF constraint_exists('fk_cleaning_tasks_hotel_id') THEN
        ALTER TABLE cleaning_tasks DROP CONSTRAINT fk_cleaning_tasks_hotel_id;
    END IF;
END $$;

-- PASSO 2: REMOVER TEMPORARIAMENTE NOT NULL E LIMPAR DADOS INVÁLIDOS
-- Isso é crucial para lidar com dados não-UUID em colunas UUID
DO $$
BEGIN
    -- cleaning_personnel.hotel_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'hotel_id') THEN
        -- Se a coluna é UUID NOT NULL e contém dados inválidos, precisamos remover NOT NULL primeiro
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'hotel_id' AND is_nullable = 'NO') THEN
            ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id DROP NOT NULL;
        END IF;
        BEGIN
            EXECUTE 'UPDATE cleaning_personnel SET hotel_id = NULL WHERE hotel_id::text !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXCEPTION
            WHEN invalid_text_representation THEN
                -- Ignorar erro, mas o problema de dados inválidos pode persistir se não for UUID
                NULL;
        END;
    END IF;

    -- cleaning_tasks.hotel_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id' AND is_nullable = 'NO') THEN
            ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id DROP NOT NULL;
        END IF;
        BEGIN
            EXECUTE 'UPDATE cleaning_tasks SET hotel_id = NULL WHERE hotel_id::text !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXCEPTION
            WHEN invalid_text_representation THEN
                NULL;
        END;
    END IF;

    -- cleaning_tasks.room_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'room_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'room_id' AND is_nullable = 'NO') THEN
            ALTER TABLE cleaning_tasks ALTER COLUMN room_id DROP NOT NULL;
        END IF;
        BEGIN
            EXECUTE 'UPDATE cleaning_tasks SET room_id = NULL WHERE room_id::text !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXCEPTION
            WHEN invalid_text_representation THEN
                NULL;
        END;
    END IF;

    -- cleaning_tasks.assigned_personnel_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_personnel_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_personnel_id' AND is_nullable = 'NO') THEN
            ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id DROP NOT NULL;
        END IF;
        BEGIN
            EXECUTE 'UPDATE cleaning_tasks SET assigned_personnel_id = NULL WHERE assigned_personnel_id::text !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXCEPTION
            WHEN invalid_text_representation THEN
                NULL;
        END;
    END IF;
END $$;

-- PASSO 3: RE-ADICIONAR NOT NULL (se aplicável) e ADICIONAR CHAVES ESTRANGEIRAS
DO $$
DECLARE
    v_first_hotel_id UUID;
BEGIN
    -- Obter um hotel_id válido para usar como fallback
    SELECT id INTO v_first_hotel_id FROM hotels LIMIT 1;

    -- cleaning_personnel.hotel_id
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_personnel_hotel_id') THEN
        -- Apenas atualiza se v_first_hotel_id não for NULL
        IF v_first_hotel_id IS NOT NULL THEN
            UPDATE cleaning_personnel SET hotel_id = v_first_hotel_id WHERE hotel_id IS NULL;
            ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id SET NOT NULL;
            ALTER TABLE cleaning_personnel ADD CONSTRAINT fk_cleaning_personnel_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- cleaning_tasks.hotel_id
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_tasks_hotel_id') THEN
        IF v_first_hotel_id IS NOT NULL THEN
            UPDATE cleaning_tasks SET hotel_id = v_first_hotel_id WHERE hotel_id IS NULL;
            ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id SET NOT NULL;
            ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- cleaning_tasks.room_id
    IF table_exists('public', 'rooms') AND NOT constraint_exists('fk_cleaning_tasks_room_id') THEN
        -- room_id pode ser NULL, então não precisamos re-adicionar NOT NULL
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_room_id FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
    END IF;

    -- cleaning_tasks.assigned_personnel_id
    IF table_exists('public', 'cleaning_personnel') AND NOT constraint_exists('fk_cleaning_tasks_assigned_personnel_id') THEN
        -- assigned_personnel_id pode ser NULL
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_assigned_personnel_id FOREIGN KEY (assigned_personnel_id) REFERENCES cleaning_personnel(id) ON DELETE SET NULL;
    END IF;
END $$;
