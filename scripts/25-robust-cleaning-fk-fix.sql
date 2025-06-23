-- Script para limpeza profunda e recriação segura de chaves estrangeiras para o módulo de limpeza.
-- Este script lida com dados corrompidos (não-UUID em colunas UUID) e problemas de integridade referencial.

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

-- Função auxiliar para verificar se uma coluna existe
CREATE OR REPLACE FUNCTION column_exists(p_table_name TEXT, p_column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = p_table_name AND column_name = p_column_name
    );
END;
$$ LANGUAGE plpgsql;

-- Função auxiliar para verificar se uma coluna é NOT NULL
CREATE OR REPLACE FUNCTION column_is_not_null(p_table_name TEXT, p_column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = p_table_name
          AND column_name = p_column_name
          AND is_nullable = 'NO'
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

-- PASSO 2: LIMPEZA PROFUNDA E CONVERSÃO DE TIPOS PARA UUID (garantindo formato UUID)
DO $$
DECLARE
    col_name TEXT;
    tbl_name TEXT;
    is_nullable_val TEXT;
BEGIN
    -- Processar cleaning_personnel.hotel_id
    IF column_exists('cleaning_personnel', 'hotel_id') THEN
        SELECT is_nullable INTO is_nullable_val FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'hotel_id';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id DROP NOT NULL';
        END IF;
        EXECUTE 'ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id TYPE TEXT USING hotel_id::TEXT';
        EXECUTE 'UPDATE cleaning_personnel SET hotel_id = NULL WHERE hotel_id !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXECUTE 'ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id TYPE UUID USING hotel_id::UUID';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id SET NOT NULL';
        END IF;
    END IF;

    -- Processar cleaning_tasks.hotel_id
    IF column_exists('cleaning_tasks', 'hotel_id') THEN
        SELECT is_nullable INTO is_nullable_val FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id DROP NOT NULL';
        END IF;
        EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id TYPE TEXT USING hotel_id::TEXT';
        EXECUTE 'UPDATE cleaning_tasks SET hotel_id = NULL WHERE hotel_id !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id TYPE UUID USING hotel_id::UUID';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id SET NOT NULL';
        END IF;
    END IF;

    -- Processar cleaning_tasks.room_id
    IF column_exists('cleaning_tasks', 'room_id') THEN
        SELECT is_nullable INTO is_nullable_val FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'room_id';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN room_id DROP NOT NULL';
        END IF;
        EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN room_id TYPE TEXT USING room_id::TEXT';
        EXECUTE 'UPDATE cleaning_tasks SET room_id = NULL WHERE room_id !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN room_id TYPE UUID USING room_id::UUID';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN room_id SET NOT NULL';
        END IF;
    END IF;

    -- Processar cleaning_tasks.assigned_personnel_id
    IF column_exists('cleaning_tasks', 'assigned_personnel_id') THEN
        SELECT is_nullable INTO is_nullable_val FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_personnel_id';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id DROP NOT NULL';
        END IF;
        EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id TYPE TEXT USING assigned_personnel_id::TEXT';
        EXECUTE 'UPDATE cleaning_tasks SET assigned_personnel_id = NULL WHERE assigned_personnel_id !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''';
        EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id TYPE UUID USING assigned_personnel_id::UUID';
        IF is_nullable_val = 'NO' THEN
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id SET NOT NULL';
        END IF;
    END IF;
END $$;

-- PASSO 3: LIMPEZA DE INTEGRIDADE REFERENCIAL (definir para NULL se não houver correspondência)
DO $$
DECLARE
    v_first_hotel_id UUID;
BEGIN
    -- Obter um hotel_id válido para usar como fallback
    SELECT id INTO v_first_hotel_id FROM hotels LIMIT 1;

    -- Diagnóstico e Limpeza: cleaning_personnel.hotel_id
    IF table_exists('public', 'hotels') AND column_exists('cleaning_personnel', 'hotel_id') THEN
        -- Diagnóstico
        RAISE NOTICE 'Diagnóstico: cleaning_personnel.hotel_id com referências inválidas:';
        PERFORM id, hotel_id FROM cleaning_personnel
        WHERE hotel_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM hotels WHERE hotels.id = cleaning_personnel.hotel_id);

        -- Limpeza
        UPDATE cleaning_personnel
        SET hotel_id = NULL
        WHERE hotel_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM hotels WHERE hotels.id = cleaning_personnel.hotel_id);
    END IF;

    -- Diagnóstico e Limpeza: cleaning_tasks.hotel_id
    IF table_exists('public', 'hotels') AND column_exists('cleaning_tasks', 'hotel_id') THEN
        -- Diagnóstico
        RAISE NOTICE 'Diagnóstico: cleaning_tasks.hotel_id com referências inválidas:';
        PERFORM id, hotel_id FROM cleaning_tasks
        WHERE hotel_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM hotels WHERE hotels.id = cleaning_tasks.hotel_id);

        -- Limpeza
        UPDATE cleaning_tasks
        SET hotel_id = NULL
        WHERE hotel_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM hotels WHERE hotels.id = cleaning_tasks.hotel_id);
    END IF;

    -- Diagnóstico e Limpeza: cleaning_tasks.room_id
    IF table_exists('public', 'rooms') AND column_exists('cleaning_tasks', 'room_id') THEN
        -- Diagnóstico
        RAISE NOTICE 'Diagnóstico: cleaning_tasks.room_id com referências inválidas:';
        PERFORM id, room_id FROM cleaning_tasks
        WHERE room_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.id = cleaning_tasks.room_id);

        -- Limpeza
        UPDATE cleaning_tasks
        SET room_id = NULL
        WHERE room_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.id = cleaning_tasks.room_id);
    END IF;

    -- Diagnóstico e Limpeza: cleaning_tasks.assigned_personnel_id
    IF table_exists('public', 'cleaning_personnel') AND column_exists('cleaning_tasks', 'assigned_personnel_id') THEN
        -- Diagnóstico
        RAISE NOTICE 'Diagnóstico: cleaning_tasks.assigned_personnel_id com referências inválidas:';
        PERFORM id, assigned_personnel_id FROM cleaning_tasks
        WHERE assigned_personnel_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM cleaning_personnel WHERE cleaning_personnel.id = cleaning_tasks.assigned_personnel_id);

        -- Limpeza
        UPDATE cleaning_tasks
        SET assigned_personnel_id = NULL
        WHERE assigned_personnel_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM cleaning_personnel WHERE cleaning_personnel.id = cleaning_tasks.assigned_personnel_id);
    END IF;

    -- Se alguma coluna que era NOT NULL agora tem NULLs após a limpeza, e não há fallback, isso pode causar erro na FK.
    -- Para as colunas que eram NOT NULL e agora podem ter NULLs, preencher com v_first_hotel_id se for o caso.
    IF column_is_not_null('cleaning_personnel', 'hotel_id') AND EXISTS (SELECT 1 FROM cleaning_personnel WHERE hotel_id IS NULL) THEN
        IF v_first_hotel_id IS NOT NULL THEN
            UPDATE cleaning_personnel SET hotel_id = v_first_hotel_id WHERE hotel_id IS NULL;
        END IF;
    END IF;

    IF column_is_not_null('cleaning_tasks', 'hotel_id') AND EXISTS (SELECT 1 FROM cleaning_tasks WHERE hotel_id IS NULL) THEN
        IF v_first_hotel_id IS NOT NULL THEN
            UPDATE cleaning_tasks SET hotel_id = v_first_hotel_id WHERE hotel_id IS NULL;
        END IF;
    END IF;

END $$;

-- PASSO 4: RE-ADICIONAR CHAVES ESTRANGEIRAS
DO $$
BEGIN
    -- cleaning_personnel.hotel_id
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_personnel_hotel_id') THEN
        ALTER TABLE cleaning_personnel ADD CONSTRAINT fk_cleaning_personnel_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;

    -- cleaning_tasks.hotel_id
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_tasks_hotel_id') THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;

    -- cleaning_tasks.room_id
    IF table_exists('public', 'rooms') AND NOT constraint_exists('fk_cleaning_tasks_room_id') THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_room_id FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
    END IF;

    -- cleaning_tasks.assigned_personnel_id
    IF table_exists('public', 'cleaning_personnel') AND NOT constraint_exists('fk_cleaning_tasks_assigned_personnel_id') THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_assigned_personnel_id FOREIGN KEY (assigned_personnel_id) REFERENCES cleaning_personnel(id) ON DELETE SET NULL;
    END IF;
END $$;
