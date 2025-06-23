-- Corrigir colunas da tabela maintenance_orders
BEGIN;

SELECT 'CORRIGINDO COLUNAS DA TABELA MAINTENANCE_ORDERS' as title;

-- Verificar e adicionar coluna assigned_to se necessário
DO $$
BEGIN
    -- Se a coluna assigned_to não existir, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'assigned_to') THEN
        ALTER TABLE maintenance_orders ADD COLUMN assigned_to UUID;
        RAISE NOTICE 'Coluna assigned_to adicionada';
    ELSE
        RAISE NOTICE 'Coluna assigned_to já existe';
    END IF;

    -- Se a coluna assigned_technician_id existir, copiar dados para assigned_to
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'maintenance_orders' AND column_name = 'assigned_technician_id') THEN
        UPDATE maintenance_orders SET assigned_to = assigned_technician_id WHERE assigned_technician_id IS NOT NULL;
        RAISE NOTICE 'Dados copiados de assigned_technician_id para assigned_to';
    END IF;

    -- Adicionar outras colunas que podem estar faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'reported_by') THEN
        ALTER TABLE maintenance_orders ADD COLUMN reported_by VARCHAR(255);
        RAISE NOTICE 'Coluna reported_by adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'location') THEN
        ALTER TABLE maintenance_orders ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Coluna location adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'urgency_reason') THEN
        ALTER TABLE maintenance_orders ADD COLUMN urgency_reason TEXT;
        RAISE NOTICE 'Coluna urgency_reason adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'quality_rating') THEN
        ALTER TABLE maintenance_orders ADD COLUMN quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5);
        RAISE NOTICE 'Coluna quality_rating adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'quality_notes') THEN
        ALTER TABLE maintenance_orders ADD COLUMN quality_notes TEXT;
        RAISE NOTICE 'Coluna quality_notes adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'recurring') THEN
        ALTER TABLE maintenance_orders ADD COLUMN recurring BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna recurring adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'recurring_interval') THEN
        ALTER TABLE maintenance_orders ADD COLUMN recurring_interval VARCHAR(20);
        RAISE NOTICE 'Coluna recurring_interval adicionada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_orders' AND column_name = 'next_occurrence') THEN
        ALTER TABLE maintenance_orders ADD COLUMN next_occurrence TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna next_occurrence adicionada';
    END IF;
END $$;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_assigned_to ON maintenance_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_reported_by ON maintenance_orders(reported_by);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_recurring ON maintenance_orders(recurring);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_next_occurrence ON maintenance_orders(next_occurrence);

COMMIT;

SELECT 'Colunas da tabela maintenance_orders corrigidas!' as status;

-- Mostrar estrutura final
SELECT 'ESTRUTURA FINAL DA TABELA MAINTENANCE_ORDERS:' as title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'maintenance_orders' 
ORDER BY ordinal_position;
