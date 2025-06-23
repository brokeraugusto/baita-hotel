-- Criação da tabela cleaning_personnel (sem FKs iniciais)
CREATE TABLE IF NOT EXISTS cleaning_personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    hotel_id UUID NOT NULL, -- NOT NULL aqui, a FK será adicionada depois
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    specialties TEXT[], -- e.g., 'deep_cleaning', 'laundry', 'room_inspection'
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate NUMERIC(10, 2),
    notes TEXT
);

-- Adiciona colunas à tabela cleaning_tasks existente ou cria se não existir
ALTER TABLE cleaning_tasks
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS checklist_progress JSONB,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER, -- in minutes
ADD COLUMN IF NOT EXISTS actual_duration INTEGER,    -- in minutes
ADD COLUMN IF NOT EXISTS reported_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_interval VARCHAR(50), -- e.g., 'daily', 'weekly', 'monthly'
ADD COLUMN IF NOT EXISTS next_occurrence TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS location VARCHAR(255); -- For general areas like 'lobby', 'corridor'

-- Renomeia a coluna assigned_to para assigned_personnel_id e altera o tipo para UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_to') THEN
        -- Verifica se a coluna já é UUID. Se não for, tenta converter.
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'assigned_to') = 'character varying' THEN
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN assigned_to TYPE UUID USING NULL'; -- Define como NULL se não for UUID válido
        END IF;
        EXECUTE 'ALTER TABLE cleaning_tasks RENAME COLUMN assigned_to TO assigned_personnel_id';
    END IF;
END $$;

-- Garante que cleaning_tasks.hotel_id é do tipo UUID
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id') THEN
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'cleaning_tasks' AND column_name = 'hotel_id') = 'character varying' THEN
            RAISE NOTICE 'Convertendo cleaning_tasks.hotel_id para tipo UUID...';
            EXECUTE 'ALTER TABLE cleaning_tasks ALTER COLUMN hotel_id TYPE UUID USING NULL'; -- Define como NULL se não for um UUID válido
            RAISE NOTICE 'cleaning_tasks.hotel_id convertido para UUID.';
        END IF;
    END IF;
END $$;

-- Adiciona índices para as novas colunas (FKs serão adicionadas em outro script)
CREATE INDEX IF NOT EXISTS idx_cleaning_personnel_hotel_id ON cleaning_personnel (hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_personnel_email ON cleaning_personnel (email);
CREATE INDEX IF NOT EXISTS idx_cleaning_personnel_is_active ON cleaning_personnel (is_active);

CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_priority ON cleaning_tasks (priority);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_is_recurring ON cleaning_tasks (is_recurring);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_next_occurrence ON cleaning_tasks (next_occurrence);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_location ON cleaning_tasks (location);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_assigned_personnel_id ON cleaning_tasks (assigned_personnel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_hotel_id ON cleaning_tasks (hotel_id);

SELECT 'Esquema do módulo de limpeza (tabelas e colunas) atualizado com sucesso. FKs serão adicionadas no próximo script.' AS status;
