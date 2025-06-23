-- Corrigir tabela de guests adicionando colunas faltantes
BEGIN;

SELECT 'CORRIGINDO TABELA DE GUESTS' as title;

-- Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guests')
        THEN 'Tabela guests existe'
        ELSE 'Tabela guests NÃO existe'
    END as table_status;

-- Adicionar colunas faltantes se não existirem
DO $$
BEGIN
    -- Verificar se hotel_id é do tipo correto
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'guests' AND column_name = 'hotel_id' AND data_type = 'uuid') THEN
        -- Se for UUID, alterar para VARCHAR
        ALTER TABLE guests ALTER COLUMN hotel_id TYPE VARCHAR(50);
        RAISE NOTICE 'Tipo da coluna hotel_id alterado para VARCHAR(50)';
    END IF;

    -- Adicionar birth_date se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guests' AND column_name = 'birth_date') THEN
        ALTER TABLE guests ADD COLUMN birth_date DATE;
        RAISE NOTICE 'Coluna birth_date adicionada';
    ELSE
        RAISE NOTICE 'Coluna birth_date já existe';
    END IF;

    -- Adicionar city se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guests' AND column_name = 'city') THEN
        ALTER TABLE guests ADD COLUMN city VARCHAR(100);
        RAISE NOTICE 'Coluna city adicionada';
    ELSE
        RAISE NOTICE 'Coluna city já existe';
    END IF;

    -- Adicionar state se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guests' AND column_name = 'state') THEN
        ALTER TABLE guests ADD COLUMN state VARCHAR(50);
        RAISE NOTICE 'Coluna state adicionada';
    ELSE
        RAISE NOTICE 'Coluna state já existe';
    END IF;

    -- Adicionar country se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guests' AND column_name = 'country') THEN
        ALTER TABLE guests ADD COLUMN country VARCHAR(50) DEFAULT 'Brasil';
        RAISE NOTICE 'Coluna country adicionada';
    ELSE
        RAISE NOTICE 'Coluna country já existe';
    END IF;

    -- Adicionar emergency_contact_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guests' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE guests ADD COLUMN emergency_contact_name VARCHAR(255);
        RAISE NOTICE 'Coluna emergency_contact_name adicionada';
    ELSE
        RAISE NOTICE 'Coluna emergency_contact_name já existe';
    END IF;

    -- Adicionar emergency_contact_phone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guests' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE guests ADD COLUMN emergency_contact_phone VARCHAR(20);
        RAISE NOTICE 'Coluna emergency_contact_phone adicionada';
    ELSE
        RAISE NOTICE 'Coluna emergency_contact_phone já existe';
    END IF;
END $$;

-- Atualizar dados existentes com valores padrão
UPDATE guests SET 
    country = 'Brasil',
    city = 'São Paulo',
    state = 'SP'
WHERE country IS NULL OR city IS NULL OR state IS NULL;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_document ON guests(document_number);
CREATE INDEX IF NOT EXISTS idx_guests_vip ON guests(vip_status);

COMMIT;

-- Verificar estrutura final da tabela
SELECT 'ESTRUTURA FINAL DA TABELA GUESTS:' as title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'guests' 
ORDER BY ordinal_position;

SELECT 'Tabela guests corrigida com sucesso!' as status;
