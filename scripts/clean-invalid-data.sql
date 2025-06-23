-- Limpar dados inválidos que podem estar causando problemas
BEGIN;

SELECT 'LIMPANDO DADOS INVÁLIDOS' as title;

-- 1. Limpar valores inválidos em maintenance_orders
SELECT 'Limpando valores inválidos em maintenance_orders...' as status;

-- Limpar hotel_id inválidos (devem ser strings)
UPDATE maintenance_orders 
SET hotel_id = 'hotel-1' 
WHERE hotel_id IS NULL OR hotel_id = '' OR hotel_id ~ '^[0-9]+$';

-- Limpar room_id inválidos (devem ser UUID válidos ou NULL)
UPDATE maintenance_orders 
SET room_id = NULL 
WHERE room_id IS NOT NULL 
AND room_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

-- Limpar category_id inválidos
UPDATE maintenance_orders 
SET category_id = NULL 
WHERE category_id IS NOT NULL 
AND category_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

-- Limpar assigned_technician_id inválidos
UPDATE maintenance_orders 
SET assigned_technician_id = NULL 
WHERE assigned_technician_id IS NOT NULL 
AND assigned_technician_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

-- 2. Limpar valores inválidos em rooms
SELECT 'Limpando valores inválidos em rooms...' as status;

-- Gerar UUIDs válidos para rooms.id se necessário
UPDATE rooms 
SET id = gen_random_uuid() 
WHERE id IS NULL OR id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

-- Corrigir hotel_id em rooms
UPDATE rooms 
SET hotel_id = 'hotel-1' 
WHERE hotel_id IS NULL OR hotel_id = '';

-- 3. Limpar valores inválidos em maintenance_categories
SELECT 'Limpando valores inválidos em maintenance_categories...' as status;

-- Gerar UUIDs válidos para categories
UPDATE maintenance_categories 
SET id = gen_random_uuid() 
WHERE id IS NULL OR id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

-- 4. Limpar valores inválidos em maintenance_technicians
SELECT 'Limpando valores inválidos em maintenance_technicians...' as status;

-- Gerar UUIDs válidos para technicians
UPDATE maintenance_technicians 
SET id = gen_random_uuid() 
WHERE id IS NULL OR id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

COMMIT;

SELECT 'Dados inválidos limpos!' as status;

-- Verificar resultado
SELECT 'VERIFICAÇÃO APÓS LIMPEZA:' as section;
SELECT 
    'maintenance_orders' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN hotel_id IS NOT NULL THEN 1 END) as hotel_id_validos,
    COUNT(CASE WHEN room_id IS NOT NULL THEN 1 END) as room_id_validos,
    COUNT(CASE WHEN category_id IS NOT NULL THEN 1 END) as category_id_validos,
    COUNT(CASE WHEN assigned_technician_id IS NOT NULL THEN 1 END) as technician_id_validos
FROM maintenance_orders;
