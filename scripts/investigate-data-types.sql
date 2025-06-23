-- Investigar tipos de dados incompatíveis
SELECT 'INVESTIGANDO TIPOS DE DADOS INCOMPATÍVEIS' as title;

-- 1. Verificar tipos de dados da tabela maintenance_orders
SELECT 'TIPOS DE DADOS - MAINTENANCE_ORDERS:' as section;
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'maintenance_orders' 
ORDER BY ordinal_position;

-- 2. Verificar tipos de dados das tabelas relacionadas
SELECT 'TIPOS DE DADOS - ROOMS:' as section;
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND column_name IN ('id', 'hotel_id')
ORDER BY ordinal_position;

SELECT 'TIPOS DE DADOS - MAINTENANCE_CATEGORIES:' as section;
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'maintenance_categories' 
AND column_name IN ('id', 'hotel_id')
ORDER BY ordinal_position;

SELECT 'TIPOS DE DADOS - MAINTENANCE_TECHNICIANS:' as section;
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'maintenance_technicians' 
AND column_name IN ('id', 'hotel_id')
ORDER BY ordinal_position;

-- 3. Verificar dados atuais que podem estar causando problemas
SELECT 'DADOS PROBLEMÁTICOS - MAINTENANCE_ORDERS:' as section;
SELECT 
    id,
    hotel_id,
    room_id,
    category_id,
    assigned_technician_id,
    pg_typeof(hotel_id) as hotel_id_type,
    pg_typeof(room_id) as room_id_type,
    pg_typeof(category_id) as category_id_type,
    pg_typeof(assigned_technician_id) as assigned_technician_id_type
FROM maintenance_orders 
LIMIT 5;

-- 4. Verificar se há valores numéricos em campos que deveriam ser UUID/VARCHAR
SELECT 'VERIFICANDO VALORES NUMÉRICOS EM CAMPOS UUID:' as section;
SELECT 
    'hotel_id' as campo,
    hotel_id as valor,
    CASE 
        WHEN hotel_id ~ '^[0-9]+$' THEN 'NUMÉRICO'
        WHEN hotel_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' THEN 'UUID'
        ELSE 'OUTRO'
    END as tipo_detectado
FROM maintenance_orders 
WHERE hotel_id IS NOT NULL
UNION ALL
SELECT 
    'room_id' as campo,
    room_id as valor,
    CASE 
        WHEN room_id ~ '^[0-9]+$' THEN 'NUMÉRICO'
        WHEN room_id ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' THEN 'UUID'
        ELSE 'OUTRO'
    END as tipo_detectado
FROM maintenance_orders 
WHERE room_id IS NOT NULL
LIMIT 10;

-- 5. Verificar foreign keys problemáticas
SELECT 'FOREIGN KEYS PROBLEMÁTICAS:' as section;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'maintenance_orders';
