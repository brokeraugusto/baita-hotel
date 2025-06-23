-- Script final para correção completa das chaves estrangeiras do módulo de limpeza
-- Este script verifica e corrige todos os aspectos das tabelas e suas relações

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

-- PASSO 1: DIAGNÓSTICO COMPLETO
SELECT 
    'DIAGNÓSTICO INICIAL' AS step,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'hotels') AS hotels_table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'rooms') AS rooms_table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'cleaning_personnel') AS cleaning_personnel_table_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'cleaning_tasks') AS cleaning_tasks_table_exists;

-- PASSO 2: REMOVER TODAS AS CONSTRAINTS EXISTENTES
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Remover todas as constraints de FK das tabelas de limpeza
    FOR constraint_record IN 
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name IN ('cleaning_personnel', 'cleaning_tasks')
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || ' DROP CONSTRAINT ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- PASSO 3: LIMPAR COMPLETAMENTE AS TABELAS DE LIMPEZA
DO $$
BEGIN
    IF table_exists('public', 'cleaning_tasks') THEN
        TRUNCATE TABLE cleaning_tasks CASCADE;
    END IF;
    IF table_exists('public', 'cleaning_personnel') THEN
        TRUNCATE TABLE cleaning_personnel CASCADE;
    END IF;
END $$;

-- PASSO 4: VERIFICAR E CORRIGIR ESTRUTURA DAS TABELAS
DO $$
BEGIN
    -- Verificar se a tabela hotels existe e tem dados
    IF NOT table_exists('public', 'hotels') THEN
        -- Se não existe, criar uma tabela básica
        CREATE TABLE IF NOT EXISTS hotels (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Inserir um hotel padrão
        INSERT INTO hotels (name) VALUES ('Hotel Padrão') ON CONFLICT DO NOTHING;
    END IF;
    
    -- Verificar se a tabela rooms existe
    IF NOT table_exists('public', 'rooms') THEN
        CREATE TABLE IF NOT EXISTS rooms (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            hotel_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Garantir que há pelo menos um hotel
    IF (SELECT COUNT(*) FROM hotels) = 0 THEN
        INSERT INTO hotels (name) VALUES ('Hotel Padrão');
    END IF;
END $$;

-- PASSO 5: GARANTIR TIPOS CORRETOS DAS COLUNAS
DO $$
BEGIN
    -- cleaning_personnel.hotel_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'hotel_id') THEN
        ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id DROP NOT NULL;
        ALTER TABLE cleaning_personnel ALTER COLUMN hotel_id TYPE UUID USING 
            CASE 
                WHEN hotel_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN hotel_id::UUID 
                ELSE NULL 
            END;
    END IF;

    -- cleaning_tasks.hotel_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id') THEN
        ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id DROP NOT NULL;
        ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id TYPE UUID USING 
            CASE 
                WHEN hotel_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN hotel_id::UUID 
                ELSE NULL 
            END;
    END IF;

    -- cleaning_tasks.room_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'room_id') THEN
        ALTER TABLE cleaning_tasks ALTER COLUMN room_id DROP NOT NULL;
        ALTER TABLE cleaning_tasks ALTER COLUMN room_id TYPE UUID USING 
            CASE 
                WHEN room_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN room_id::UUID 
                ELSE NULL 
            END;
    END IF;

    -- cleaning_tasks.assigned_personnel_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_personnel_id') THEN
        ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id DROP NOT NULL;
        ALTER TABLE cleaning_tasks ALTER COLUMN assigned_personnel_id TYPE UUID USING 
            CASE 
                WHEN assigned_personnel_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN assigned_personnel_id::UUID 
                ELSE NULL 
            END;
    END IF;
END $$;

-- PASSO 6: ADICIONAR FKs APENAS SE APROPRIADO
DO $$
DECLARE
    hotel_count INT := 0;
    rooms_count INT := 0;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO hotel_count FROM hotels;
    SELECT COUNT(*) INTO rooms_count FROM rooms;

    -- Só adicionar FKs se as tabelas referenciadas tiverem dados
    
    -- cleaning_personnel.hotel_id -> hotels.id (apenas se há hotéis)
    IF hotel_count > 0 THEN
        ALTER TABLE cleaning_personnel ADD CONSTRAINT fk_cleaning_personnel_hotel_id 
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;

    -- cleaning_tasks.hotel_id -> hotels.id (apenas se há hotéis)
    IF hotel_count > 0 THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_hotel_id 
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
    END IF;

    -- cleaning_tasks.room_id -> rooms.id (apenas se há quartos)
    IF rooms_count > 0 THEN
        ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_room_id 
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
    END IF;

    -- cleaning_tasks.assigned_personnel_id -> cleaning_personnel.id (sempre, pois é self-referencing)
    ALTER TABLE cleaning_tasks ADD CONSTRAINT fk_cleaning_tasks_assigned_personnel_id 
    FOREIGN KEY (assigned_personnel_id) REFERENCES cleaning_personnel(id) ON DELETE SET NULL;
END $$;

-- PASSO 7: VERIFICAÇÃO FINAL
SELECT 
    'VERIFICAÇÃO FINAL' AS step,
    (SELECT COUNT(*) FROM hotels) AS hotels_count,
    (SELECT COUNT(*) FROM rooms) AS rooms_count,
    (SELECT COUNT(*) FROM cleaning_personnel) AS cleaning_personnel_count,
    (SELECT COUNT(*) FROM cleaning_tasks) AS cleaning_tasks_count,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_type = 'FOREIGN KEY' 
     AND table_name IN ('cleaning_personnel', 'cleaning_tasks')) AS fk_constraints_created;
