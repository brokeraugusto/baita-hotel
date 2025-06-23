-- Corrigir tabela de rooms adicionando colunas faltantes
BEGIN;

SELECT 'CORRIGINDO TABELA DE ROOMS' as title;

-- Verificar se a tabela existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms')
        THEN 'Tabela rooms existe'
        ELSE 'Tabela rooms NÃO existe'
    END as table_status;

-- Adicionar colunas faltantes se não existirem
DO $$
BEGIN
    -- Adicionar floor_number se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'floor_number') THEN
        ALTER TABLE rooms ADD COLUMN floor_number INTEGER;
        RAISE NOTICE 'Coluna floor_number adicionada';
    ELSE
        RAISE NOTICE 'Coluna floor_number já existe';
    END IF;

    -- Adicionar area_sqm se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'area_sqm') THEN
        ALTER TABLE rooms ADD COLUMN area_sqm DECIMAL(6,2);
        RAISE NOTICE 'Coluna area_sqm adicionada';
    ELSE
        RAISE NOTICE 'Coluna area_sqm já existe';
    END IF;

    -- Verificar se hotel_id é do tipo correto
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'rooms' AND column_name = 'hotel_id' AND data_type = 'uuid') THEN
        -- Se for UUID, alterar para VARCHAR
        ALTER TABLE rooms ALTER COLUMN hotel_id TYPE VARCHAR(50);
        RAISE NOTICE 'Tipo da coluna hotel_id alterado para VARCHAR(50)';
    END IF;
END $$;

-- Atualizar dados existentes com valores padrão
UPDATE rooms SET 
    floor_number = CASE 
        WHEN room_number ~ '^[1-9][0-9]*$' THEN 
            CASE 
                WHEN CAST(room_number AS INTEGER) BETWEEN 100 AND 199 THEN 1
                WHEN CAST(room_number AS INTEGER) BETWEEN 200 AND 299 THEN 2
                WHEN CAST(room_number AS INTEGER) BETWEEN 300 AND 399 THEN 3
                ELSE 1
            END
        ELSE 1
    END,
    area_sqm = CASE 
        WHEN room_type ILIKE '%standard%' THEN 25.0
        WHEN room_type ILIKE '%luxo%' OR room_type ILIKE '%super%' THEN 35.0
        WHEN room_type ILIKE '%master%' OR room_type ILIKE '%suite%' THEN 45.0
        ELSE 30.0
    END
WHERE floor_number IS NULL OR area_sqm IS NULL;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor_number);

COMMIT;

-- Verificar estrutura final da tabela
SELECT 'ESTRUTURA FINAL DA TABELA ROOMS:' as title;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rooms' 
ORDER BY ordinal_position;

SELECT 'Tabela rooms corrigida com sucesso!' as status;
