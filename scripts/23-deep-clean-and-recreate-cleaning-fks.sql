-- Script para limpeza profunda e recriação segura de chaves estrangeiras para o módulo de limpeza.
-- Este script lida com dados corrompidos (não-UUID em colunas UUID) alterando o tipo da coluna temporariamente.

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

-- PASSO 2: LIMPEZA PROFUNDA E CONVERSÃO DE TIPOS PARA UUID
DO $$
DECLARE
    col_name TEXT;
    tbl_name TEXT;
    is_not_null BOOLEAN;
BEGIN
    -- Processar cleaning_personnel.hotel_id
    tbl_name := 'cleaning_personnel';
    col_name := 'hotel_id';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl_name AND column_name = col_name) THEN
        is_not_null := column_is_not_null(tbl_name, col_name);

        -- 2.1: Alterar para TEXT temporariamente
        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE TEXT USING %I::TEXT', tbl_name, col_name, col_name);

        -- 2.2: Limpar dados inválidos (definir como NULL o que não é UUID válido)
        EXECUTE FORMAT('UPDATE %I SET %I = NULL WHERE %I IS NOT NULL AND %I !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''', tbl_name, col_name, col_name, col_name);

        -- 2.3: Alterar de volta para UUID
        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE UUID USING %I::UUID', tbl_name, col_name, col_name);

        -- 2.4: Re-adicionar NOT NULL se era originalmente
        IF is_not_null THEN
            EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', tbl_name, col_name);
        END IF;
    END IF;

    -- Processar cleaning_tasks.hotel_id
    tbl_name := 'cleaning_tasks';
    col_name := 'hotel_id';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl_name AND column_name = col_name) THEN
        is_not_null := column_is_not_null(tbl_name, col_name);

        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE TEXT USING %I::TEXT', tbl_name, col_name, col_name);
        EXECUTE FORMAT('UPDATE %I SET %I = NULL WHERE %I IS NOT NULL AND %I !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''', tbl_name, col_name, col_name, col_name);
        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE UUID USING %I::UUID', tbl_name, col_name, col_name);

        IF is_not_null THEN
            EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', tbl_name, col_name);
        END IF;
    END IF;

    -- Processar cleaning_tasks.room_id
    tbl_name := 'cleaning_tasks';
    col_name := 'room_id';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl_name AND column_name = col_name) THEN
        is_not_null := column_is_not_null(tbl_name, col_name);

        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE TEXT USING %I::TEXT', tbl_name, col_name, col_name);
        EXECUTE FORMAT('UPDATE %I SET %I = NULL WHERE %I IS NOT NULL AND %I !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''', tbl_name, col_name, col_name, col_name);
        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE UUID USING %I::UUID', tbl_name, col_name, col_name);

        IF is_not_null THEN
            EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', tbl_name, col_name);
        END IF;
    END IF;

    -- Processar cleaning_tasks.assigned_personnel_id
    tbl_name := 'cleaning_tasks';
    col_name := 'assigned_personnel_id';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl_name AND column_name = col_name) THEN
        is_not_null := column_is_not_null(tbl_name, col_name);

        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE TEXT USING %I::TEXT', tbl_name, col_name, col_name);
        EXECUTE FORMAT('UPDATE %I SET %I = NULL WHERE %I IS NOT NULL AND %I !~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$''', tbl_name, col_name, col_name, col_name);
        EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I TYPE UUID USING %I::UUID', tbl_name, col_name, col_name);

        IF is_not_null THEN
            EXECUTE FORMAT('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL', tbl_name, col_name);
        END IF;
    END IF;
END $$;

-- PASSO 3: RE-ADICIONAR CHAVES ESTRANGEIRAS
DO $$
DECLARE
    v_first_hotel_id UUID;
BEGIN
    -- Obter um hotel_id válido para usar como fallback
    SELECT id INTO v_first_hotel_id FROM hotels LIMIT 1;

    -- cleaning_personnel.hotel_id
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_personnel_hotel_id') THEN
        -- Se a coluna hotel_id em cleaning_personnel é NOT NULL e tem valores NULL após a limpeza, preencher com um hotel_id válido
        IF column_is_not_null('cleaning_personnel', 'hotel_id') AND EXISTS (SELECT 1 FROM cleaning_personnel WHERE hotel_id IS NULL) THEN
            IF v_first_hotel_id IS NOT NULL THEN
                UPDATE cleaning_personnel SET hotel_id = v_first_hotel_id WHERE hotel_id IS NULL;
            ELSE
                -- Se não há hotéis, não podemos adicionar NOT NULL ou FK.
                -- Isso deve ser tratado em um script de setup inicial para garantir que 'hotels' tenha dados.
                RAISE EXCEPTION 'Nenhum hotel encontrado na tabela hotels para preencher valores NULL em cleaning_personnel.hotel_id.';
            END IF;
        END IF;
        ALTER TABLE cleaning_personnel ADD CONSTRAINT fk_cleaning_personnel_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;

    -- cleaning_tasks.hotel_id
    IF table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_tasks_hotel_id') THEN
        IF column_is_not_null('cleaning_tasks', 'hotel_id') AND EXISTS (SELECT 1 FROM cleaning_tasks WHERE hotel_id IS NULL) THEN
            IF v_first_hotel_id IS NOT NULL THEN
                UPDATE cleaning_tasks SET hotel_id = v_first_hotel_id WHERE hotel_id IS NULL;
            ELSE
                RAISE EXCEPTION 'Nenhum hotel encontrado na tabela hotels para preencher valores NULL em cleaning_tasks.hotel_id.';
            END IF;
        END IF;
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
