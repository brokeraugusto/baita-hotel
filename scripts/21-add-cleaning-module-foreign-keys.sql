-- Script para adicionar chaves estrangeiras para o módulo de limpeza

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

-- DIAGNÓSTICO: Verifica os tipos de dados atuais antes de prosseguir
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('cleaning_personnel', 'cleaning_tasks') AND column_name = 'hotel_id';

-- GARANTIR TIPO UUID PARA cleaning_personnel.hotel_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'hotel_id' AND data_type = 'character varying') THEN
        RAISE NOTICE 'Convertendo cleaning_personnel.hotel_id para tipo UUID...';
        EXECUTE 'ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id TYPE UUID USING NULL'; -- Define como NULL se não for UUID válido
        RAISE NOTICE 'cleaning_personnel.hotel_id convertido para UUID.';
    END IF;
END $$;

-- GARANTIR TIPO UUID PARA cleaning_tasks.hotel_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id' AND data_type = 'character varying') THEN
        RAISE NOTICE 'Convertendo cleaning_tasks.hotel_id para tipo UUID...';
        EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id TYPE UUID USING NULL'; -- Define como NULL se não for UUID válido
        RAISE NOTICE 'cleaning_tasks.hotel_id convertido para UUID.';
    END IF;
END $$;

-- Adicionar FK para cleaning_personnel.hotel_id
DO $$
DECLARE
    v_first_hotel_id UUID;
BEGIN
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_personnel_hotel_id') THEN
        RAISE NOTICE 'Verificando e corrigindo hotel_id em cleaning_personnel...';

        -- Obter um hotel_id válido para usar como fallback
        SELECT id INTO v_first_hotel_id FROM hotels LIMIT 1;

        IF v_first_hotel_id IS NOT NULL THEN
            UPDATE cleaning_personnel
            SET hotel_id = v_first_hotel_id
            WHERE hotel_id IS NOT NULL
              AND NOT EXISTS (SELECT 1 FROM hotels WHERE hotels.id = cleaning_personnel.hotel_id);

            RAISE NOTICE 'Adicionando FK fk_cleaning_personnel_hotel_id...';
            ALTER TABLE cleaning_personnel
            ADD CONSTRAINT fk_cleaning_personnel_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
            RAISE NOTICE 'FK fk_cleaning_personnel_hotel_id adicionada.';
        ELSE
            RAISE WARNING 'Nenhum hotel encontrado na tabela hotels. Não foi possível adicionar FK fk_cleaning_personnel_hotel_id.';
        END IF;
    ELSEIF NOT table_exists('public', 'hotels') THEN
        RAISE NOTICE 'Tabela hotels não existe. Pulando FK fk_cleaning_personnel_hotel_id.';
    ELSE
        RAISE NOTICE 'FK fk_cleaning_personnel_hotel_id já existe. Pulando.';
    END IF;
END $$;

-- Adicionar FKs para cleaning_tasks
DO $$
BEGIN
    -- FK para rooms.id
    IF table_exists('public', 'rooms') AND NOT constraint_exists('fk_cleaning_tasks_room_id') THEN
        RAISE NOTICE 'Verificando e corrigindo room_id em cleaning_tasks...';
        -- Garante que room_id é UUID antes de qualquer operação
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'room_id' AND data_type = 'character varying') THEN
            RAISE NOTICE 'Convertendo cleaning_tasks.room_id para tipo UUID...';
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN room_id TYPE UUID USING NULL';
            RAISE NOTICE 'cleaning_tasks.room_id convertido para UUID.';
        END IF;

        UPDATE cleaning_tasks
        SET room_id = NULL
        WHERE room_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.id = cleaning_tasks.room_id);
        RAISE NOTICE 'Adicionando FK fk_cleaning_tasks_room_id...';
        ALTER TABLE cleaning_tasks
        ADD CONSTRAINT fk_cleaning_tasks_room_id FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_cleaning_tasks_room_id adicionada.';
    ELSEIF NOT table_exists('public', 'rooms') THEN
        RAISE NOTICE 'Tabela rooms não existe. Pulando FK fk_cleaning_tasks_room_id.';
    ELSE
        RAISE NOTICE 'FK fk_cleaning_tasks_room_id já existe. Pulando.';
    END IF;

    -- FK para cleaning_personnel.id
    IF table_exists('public', 'cleaning_personnel') AND NOT constraint_exists('fk_cleaning_tasks_assigned_personnel_id') THEN
        RAISE NOTICE 'Verificando e corrigindo assigned_personnel_id em cleaning_tasks...';
        -- Garante que assigned_personnel_id é UUID antes de qualquer operação
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_personnel_id' AND data_type = 'character varying') THEN
            RAISE NOTICE 'Convertendo cleaning_tasks.assigned_personnel_id para tipo UUID...';
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id TYPE UUID USING NULL';
            RAISE NOTICE 'cleaning_tasks.assigned_personnel_id convertido para UUID.';
        END IF;

        UPDATE cleaning_tasks
        SET assigned_personnel_id = NULL
        WHERE assigned_personnel_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM cleaning_personnel WHERE cleaning_personnel.id = cleaning_tasks.assigned_personnel_id);
        RAISE NOTICE 'Adicionando FK fk_cleaning_tasks_assigned_personnel_id...';
        ALTER TABLE cleaning_tasks
        ADD CONSTRAINT fk_cleaning_tasks_assigned_personnel_id FOREIGN KEY (assigned_personnel_id) REFERENCES cleaning_personnel(id) ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_cleaning_tasks_assigned_personnel_id adicionada.';
    ELSEIF NOT table_exists('public', 'cleaning_personnel') THEN
        RAISE NOTICE 'Tabela cleaning_personnel não existe. Pulando FK fk_cleaning_tasks_assigned_personnel_id.';
    ELSE
        RAISE NOTICE 'FK fk_cleaning_tasks_assigned_personnel_id já existe. Pulando.';
    END IF;

    -- FK para hotels.id (agora que hotel_id é UUID)
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_tasks_hotel_id') THEN
        RAISE NOTICE 'Verificando e corrigindo hotel_id em cleaning_tasks (após conversão para UUID)...';
        UPDATE cleaning_tasks
        SET hotel_id = NULL
        WHERE hotel_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM hotels WHERE hotels.id = cleaning_tasks.hotel_id);
        RAISE NOTICE 'Adicionando FK fk_cleaning_tasks_hotel_id...';
        ALTER TABLE cleaning_tasks
        ADD CONSTRAINT fk_cleaning_tasks_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
        RAISE NOTICE 'FK fk_cleaning_tasks_hotel_id adicionada.';
    ELSEIF NOT table_exists('public', 'hotels') THEN
        RAISE NOTICE 'Tabela hotels não existe. Pulando FK fk_cleaning_tasks_hotel_id.';
    ELSE
        RAISE NOTICE 'FK fk_cleaning_tasks_hotel_id já existe. Pulando.';
    END IF;
END $$;

SELECT 'Chaves estrangeiras para o módulo de limpeza adicionadas com sucesso.' AS status;
