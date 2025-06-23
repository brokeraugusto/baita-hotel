-- Verificar se as tabelas existem e criar se não existirem
DO $$
BEGIN
    -- Criar tabela cleaning_personnel se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cleaning_personnel') THEN
        CREATE TABLE cleaning_personnel (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            hotel_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            specialties TEXT[],
            is_active BOOLEAN DEFAULT TRUE,
            hourly_rate NUMERIC(10, 2),
            notes TEXT
        );
        
        CREATE INDEX idx_cleaning_personnel_hotel_id ON cleaning_personnel(hotel_id);
        
        RAISE NOTICE 'Tabela cleaning_personnel criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela cleaning_personnel já existe';
    END IF;

    -- Criar tabela cleaning_tasks se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cleaning_tasks') THEN
        CREATE TABLE cleaning_tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            hotel_id UUID NOT NULL,
            room_id UUID,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            priority VARCHAR(50) DEFAULT 'medium',
            assigned_personnel_id UUID,
            scheduled_date TIMESTAMP WITH TIME ZONE,
            completed_date TIMESTAMP WITH TIME ZONE,
            checklist_progress JSONB,
            estimated_duration INTEGER,
            actual_duration INTEGER,
            reported_by VARCHAR(255),
            is_recurring BOOLEAN DEFAULT FALSE,
            recurrence_interval VARCHAR(50),
            next_occurrence TIMESTAMP WITH TIME ZONE,
            location VARCHAR(255)
        );
        
        CREATE INDEX idx_cleaning_tasks_hotel_id ON cleaning_tasks(hotel_id);
        CREATE INDEX idx_cleaning_tasks_room_id ON cleaning_tasks(room_id);
        CREATE INDEX idx_cleaning_tasks_assigned_personnel_id ON cleaning_tasks(assigned_personnel_id);
        CREATE INDEX idx_cleaning_tasks_status ON cleaning_tasks(status);
        CREATE INDEX idx_cleaning_tasks_scheduled_date ON cleaning_tasks(scheduled_date);
        
        RAISE NOTICE 'Tabela cleaning_tasks criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela cleaning_tasks já existe';
    END IF;

    -- Adicionar foreign keys se não existirem
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cleaning_personnel_hotel_id' 
        AND table_name = 'cleaning_personnel'
    ) THEN
        ALTER TABLE cleaning_personnel
        ADD CONSTRAINT fk_cleaning_personnel_hotel_id
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key fk_cleaning_personnel_hotel_id adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cleaning_tasks_hotel_id' 
        AND table_name = 'cleaning_tasks'
    ) THEN
        ALTER TABLE cleaning_tasks
        ADD CONSTRAINT fk_cleaning_tasks_hotel_id
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key fk_cleaning_tasks_hotel_id adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cleaning_tasks_room_id' 
        AND table_name = 'cleaning_tasks'
    ) THEN
        ALTER TABLE cleaning_tasks
        ADD CONSTRAINT fk_cleaning_tasks_room_id
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key fk_cleaning_tasks_room_id adicionada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cleaning_tasks_assigned_personnel_id' 
        AND table_name = 'cleaning_tasks'
    ) THEN
        ALTER TABLE cleaning_tasks
        ADD CONSTRAINT fk_cleaning_tasks_assigned_personnel_id
        FOREIGN KEY (assigned_personnel_id) REFERENCES cleaning_personnel(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key fk_cleaning_tasks_assigned_personnel_id adicionada';
    END IF;

END $$;

-- Verificar se as colunas necessárias existem e adicionar se não existirem
DO $$
BEGIN
    -- Verificar e adicionar colunas na tabela cleaning_tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'checklist_items') THEN
        ALTER TABLE cleaning_tasks ADD COLUMN checklist_items JSONB;
        RAISE NOTICE 'Coluna checklist_items adicionada à tabela cleaning_tasks';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'notes') THEN
        ALTER TABLE cleaning_tasks ADD COLUMN notes TEXT;
        RAISE NOTICE 'Coluna notes adicionada à tabela cleaning_tasks';
    END IF;

    -- Verificar e adicionar colunas na tabela cleaning_personnel
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'avatar_url') THEN
        ALTER TABLE cleaning_personnel ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Coluna avatar_url adicionada à tabela cleaning_personnel';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_personnel' AND column_name = 'availability') THEN
        ALTER TABLE cleaning_personnel ADD COLUMN availability JSONB;
        RAISE NOTICE 'Coluna availability adicionada à tabela cleaning_personnel';
    END IF;
END $$;

-- Habilitar RLS nas tabelas
ALTER TABLE cleaning_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
DO $$
BEGIN
    -- Políticas para cleaning_personnel
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cleaning_personnel' AND policyname = 'cleaning_personnel_hotel_isolation') THEN
        CREATE POLICY cleaning_personnel_hotel_isolation ON cleaning_personnel
            USING (hotel_id = auth.jwt() ->> 'hotel_id'::text);
        RAISE NOTICE 'Política RLS cleaning_personnel_hotel_isolation criada';
    END IF;

    -- Políticas para cleaning_tasks
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cleaning_tasks' AND policyname = 'cleaning_tasks_hotel_isolation') THEN
        CREATE POLICY cleaning_tasks_hotel_isolation ON cleaning_tasks
            USING (hotel_id = auth.jwt() ->> 'hotel_id'::text);
        RAISE NOTICE 'Política RLS cleaning_tasks_hotel_isolation criada';
    END IF;
END $$;

SELECT 'Estrutura do módulo de limpeza verificada e atualizada com sucesso' as resultado;
