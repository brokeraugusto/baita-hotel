-- Corrigir tipos de dados incompatíveis
BEGIN;

SELECT 'CORRIGINDO TIPOS DE DADOS INCOMPATÍVEIS' as title;

-- 1. Remover todas as foreign keys temporariamente
DO $$
DECLARE
    fk_record RECORD;
BEGIN
    FOR fk_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc 
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'maintenance_orders'
    LOOP
        EXECUTE 'ALTER TABLE ' || fk_record.table_name || ' DROP CONSTRAINT IF EXISTS ' || fk_record.constraint_name;
        RAISE NOTICE 'Removida FK: %', fk_record.constraint_name;
    END LOOP;
END $$;

-- 2. Corrigir tipos de dados na tabela maintenance_orders
SELECT 'Corrigindo tipos de dados na maintenance_orders...' as status;

-- Garantir que hotel_id seja VARCHAR(50)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'maintenance_orders' AND column_name = 'hotel_id' AND data_type != 'character varying') THEN
        ALTER TABLE maintenance_orders ALTER COLUMN hotel_id TYPE VARCHAR(50);
        RAISE NOTICE 'hotel_id convertido para VARCHAR(50)';
    END IF;
END $$;

-- Garantir que room_id seja UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'maintenance_orders' AND column_name = 'room_id' AND data_type != 'uuid') THEN
        -- Primeiro, limpar valores inválidos
        UPDATE maintenance_orders SET room_id = NULL WHERE room_id IS NOT NULL AND room_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';
        ALTER TABLE maintenance_orders ALTER COLUMN room_id TYPE UUID USING room_id::UUID;
        RAISE NOTICE 'room_id convertido para UUID';
    END IF;
END $$;

-- Garantir que category_id seja UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'maintenance_orders' AND column_name = 'category_id' AND data_type != 'uuid') THEN
        -- Primeiro, limpar valores inválidos
        UPDATE maintenance_orders SET category_id = NULL WHERE category_id IS NOT NULL AND category_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';
        ALTER TABLE maintenance_orders ALTER COLUMN category_id TYPE UUID USING category_id::UUID;
        RAISE NOTICE 'category_id convertido para UUID';
    END IF;
END $$;

-- Garantir que assigned_technician_id seja UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'maintenance_orders' AND column_name = 'assigned_technician_id' AND data_type != 'uuid') THEN
        -- Primeiro, limpar valores inválidos
        UPDATE maintenance_orders SET assigned_technician_id = NULL WHERE assigned_technician_id IS NOT NULL AND assigned_technician_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';
        ALTER TABLE maintenance_orders ALTER COLUMN assigned_technician_id TYPE UUID USING assigned_technician_id::UUID;
        RAISE NOTICE 'assigned_technician_id convertido para UUID';
    END IF;
END $$;

-- 3. Corrigir tipos de dados nas tabelas relacionadas
SELECT 'Corrigindo tipos de dados nas tabelas relacionadas...' as status;

-- Corrigir rooms.id para UUID se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'rooms' AND column_name = 'id' AND data_type != 'uuid') THEN
        ALTER TABLE rooms ALTER COLUMN id TYPE UUID USING id::UUID;
        RAISE NOTICE 'rooms.id convertido para UUID';
    END IF;
END $$;

-- Corrigir rooms.hotel_id para VARCHAR(50)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'rooms' AND column_name = 'hotel_id' AND data_type != 'character varying') THEN
        ALTER TABLE rooms ALTER COLUMN hotel_id TYPE VARCHAR(50);
        RAISE NOTICE 'rooms.hotel_id convertido para VARCHAR(50)';
    END IF;
END $$;

-- Corrigir maintenance_categories.id para UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'maintenance_categories' AND column_name = 'id' AND data_type != 'uuid') THEN
        ALTER TABLE maintenance_categories ALTER COLUMN id TYPE UUID USING id::UUID;
        RAISE NOTICE 'maintenance_categories.id convertido para UUID';
    END IF;
END $$;

-- Corrigir maintenance_technicians.id para UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'maintenance_technicians' AND column_name = 'id' AND data_type != 'uuid') THEN
        ALTER TABLE maintenance_technicians ALTER COLUMN id TYPE UUID USING id::UUID;
        RAISE NOTICE 'maintenance_technicians.id convertido para UUID';
    END IF;
END $$;

COMMIT;

SELECT 'Tipos de dados corrigidos!' as status;
