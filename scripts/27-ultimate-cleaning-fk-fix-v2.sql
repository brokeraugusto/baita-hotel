-- Script corrigido para limpeza profunda e recriação segura de chaves estrangeiras para o módulo de limpeza.
-- Este script resolve problemas de dados corrompidos limpando completamente as tabelas de limpeza.

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

-- PASSO 1: REMOVER TODAS AS CHAVES ESTRANGEIRAS EXISTENTES
DO $$
BEGIN
    -- Remover FKs se existirem
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
    
    -- Remover outras possíveis variações de nomes de constraints
    IF constraint_exists('cleaning_tasks_room_id_fkey') THEN
        ALTER TABLE cleaning_tasks DROP CONSTRAINT cleaning_tasks_room_id_fkey;
    END IF;
    IF constraint_exists('cleaning_tasks_hotel_id_fkey') THEN
        ALTER TABLE cleaning_tasks DROP CONSTRAINT cleaning_tasks_hotel_id_fkey;
    END IF;
    IF constraint_exists('cleaning_tasks_assigned_personnel_id_fkey') THEN
        ALTER TABLE cleaning_tasks DROP CONSTRAINT cleaning_tasks_assigned_personnel_id_fkey;
    END IF;
    IF constraint_exists('cleaning_personnel_hotel_id_fkey') THEN
        ALTER TABLE cleaning_personnel DROP CONSTRAINT cleaning_personnel_hotel_id_fkey;
    END IF;
END $$;

-- PASSO 2: LIMPAR COMPLETAMENTE AS TABELAS DE LIMPEZA (approach mais seguro)
DO $$
BEGIN
    -- Limpar dados das tabelas de limpeza
    IF table_exists('public', 'cleaning_tasks') THEN
        TRUNCATE TABLE cleaning_tasks CASCADE;
    END IF;
    IF table_exists('public', 'cleaning_personnel') THEN
        TRUNCATE TABLE cleaning_personnel CASCADE;
    END IF;
END $$;

-- PASSO 3: GARANTIR TIPOS CORRETOS DAS COLUNAS
DO $$
BEGIN
    -- Garantir que cleaning_personnel.hotel_id é UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'hotel_id') THEN
        ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id DROP NOT NULL;
        ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id TYPE UUID USING hotel_id::UUID;
    END IF;

    -- Garantir que cleaning_tasks.hotel_id é UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id') THEN
        ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id DROP NOT NULL;
        ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id TYPE UUID USING hotel_id::UUID;
    END IF;

    -- Garantir que cleaning_tasks.room_id é UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'room_id') THEN
        ALTER TABLE cleaning_tasks ALTER COLUMN room_id DROP NOT NULL;
        ALTER TABLE cleaning_tasks ALTER COLUMN room_id TYPE UUID USING room_id::UUID;
    END IF;

    -- Garantir que cleaning_tasks.assigned_personnel_id é UUID
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_personnel_id') THEN
        ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id DROP NOT NULL;
        ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id TYPE UUID USING assigned_personnel_id::UUID;
    END IF;
END $$;

-- PASSO 4: VERIFICAR EXISTÊNCIA DE DADOS NAS TABELAS REFERENCIADAS E ADICIONAR FKs
DO $$
DECLARE
    hotel_count INT := 0;
    rooms_count INT := 0;
BEGIN
    -- Contar registros nas tabelas referenciadas
    IF table_exists('public', 'hotels') THEN
        SELECT COUNT(*) INTO hotel_count FROM hotels;
    END IF;
    
    IF table_exists('public', 'rooms') THEN
        SELECT COUNT(*) INTO rooms_count FROM rooms;
    END IF;

    -- Adicionar FKs apenas se as tabelas referenciadas tiverem dados
    
    -- cleaning_personnel.hotel_id -> hotels.id
    IF hotel_count > 0 AND table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_personnel_hotel_id') THEN
        ALTER TABLE cleaning_personnel ADD CONSTRAINT fk_cleaning_personnel_hotel_id 
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;

    -- cleaning_tasks.hotel_id -> hotels.id
    IF hotel_count > 0 AND table_exists('public', 'hotels') AND NOT constraint_exists('fk_cleaning_tasks_hotel_id') THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_hotel_id 
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;

    -- cleaning_tasks.room_id -> rooms.id
    IF rooms_count > 0 AND table_exists('public', 'rooms') AND NOT constraint_exists('fk_cleaning_tasks_room_id') THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_room_id 
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
    END IF;

    -- cleaning_tasks.assigned_personnel_id -> cleaning_personnel.id
    IF table_exists('public', 'cleaning_personnel') AND NOT constraint_exists('fk_cleaning_tasks_assigned_personnel_id') THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_assigned_personnel_id 
        FOREIGN KEY (assigned_personnel_id) REFERENCES cleaning_personnel(id) ON DELETE SET NULL;
    END IF;
END $$;

-- PASSO 5: VERIFICAÇÃO FINAL
SELECT 
    'Limpeza e recriação de FKs do módulo de limpeza concluída.' AS status,
    (SELECT COUNT(*) FROM hotels) AS hotels_count,
    (SELECT COUNT(*) FROM rooms) AS rooms_count,
    (SELECT COUNT(*) FROM cleaning_personnel) AS cleaning_personnel_count,
    (SELECT COUNT(*) FROM cleaning_tasks) AS cleaning_tasks_count;
