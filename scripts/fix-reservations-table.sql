-- Corrigir tabela de reservations adicionando colunas faltantes
BEGIN;

SELECT 'CORRIGINDO TABELA DE RESERVATIONS' as title;

-- Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations')
        THEN 'Tabela reservations existe'
        ELSE 'Tabela reservations NÃO existe'
    END as table_status;

-- Adicionar colunas faltantes se não existirem
DO $$
BEGIN
    -- Adicionar reservation_number se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservations' AND column_name = 'reservation_number') THEN
        ALTER TABLE reservations ADD COLUMN reservation_number VARCHAR(20);
        RAISE NOTICE 'Coluna reservation_number adicionada';
    ELSE
        RAISE NOTICE 'Coluna reservation_number já existe';
    END IF;

    -- Adicionar adults se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservations' AND column_name = 'adults') THEN
        ALTER TABLE reservations ADD COLUMN adults INTEGER DEFAULT 1;
        RAISE NOTICE 'Coluna adults adicionada';
    ELSE
        RAISE NOTICE 'Coluna adults já existe';
    END IF;

    -- Adicionar children se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservations' AND column_name = 'children') THEN
        ALTER TABLE reservations ADD COLUMN children INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna children adicionada';
    ELSE
        RAISE NOTICE 'Coluna children já existe';
    END IF;

    -- Adicionar booking_source se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservations' AND column_name = 'booking_source') THEN
        ALTER TABLE reservations ADD COLUMN booking_source VARCHAR(50) DEFAULT 'direct';
        RAISE NOTICE 'Coluna booking_source adicionada';
    ELSE
        RAISE NOTICE 'Coluna booking_source já existe';
    END IF;

    -- Adicionar cancellation_reason se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservations' AND column_name = 'cancellation_reason') THEN
        ALTER TABLE reservations ADD COLUMN cancellation_reason TEXT;
        RAISE NOTICE 'Coluna cancellation_reason adicionada';
    ELSE
        RAISE NOTICE 'Coluna cancellation_reason já existe';
    END IF;

    -- Adicionar check_in_time se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservations' AND column_name = 'check_in_time') THEN
        ALTER TABLE reservations ADD COLUMN check_in_time TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna check_in_time adicionada';
    ELSE
        RAISE NOTICE 'Coluna check_in_time já existe';
    END IF;

    -- Adicionar check_out_time se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reservations' AND column_name = 'check_out_time') THEN
        ALTER TABLE reservations ADD COLUMN check_out_time TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna check_out_time adicionada';
    ELSE
        RAISE NOTICE 'Coluna check_out_time já existe';
    END IF;
END $$;

-- Gerar números de reserva para registros existentes que não têm
UPDATE reservations 
SET reservation_number = 'BR' || TO_CHAR(created_at, 'YYMMDD') || LPAD(EXTRACT(EPOCH FROM created_at)::TEXT, 6, '0')
WHERE reservation_number IS NULL;

-- Criar constraint unique para reservation_number se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'reservations' AND constraint_name = 'reservations_reservation_number_key') THEN
        ALTER TABLE reservations ADD CONSTRAINT reservations_reservation_number_key UNIQUE (reservation_number);
        RAISE NOTICE 'Constraint unique para reservation_number criada';
    ELSE
        RAISE NOTICE 'Constraint unique para reservation_number já existe';
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_reservations_number ON reservations(reservation_number);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_id ON reservations(hotel_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

COMMIT;

-- Verificar estrutura final da tabela
SELECT 'ESTRUTURA FINAL DA TABELA RESERVATIONS:' as title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reservations' 
ORDER BY ordinal_position;

SELECT 'Tabela reservations corrigida com sucesso!' as status;
