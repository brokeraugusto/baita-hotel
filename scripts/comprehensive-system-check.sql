-- COMPREHENSIVE SYSTEM CHECK
-- Verificação completa de todas as tabelas e funcionalidades

-- 1. VERIFICAR TODAS AS TABELAS EXISTENTES
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR ESTRUTURA DAS TABELAS PRINCIPAIS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles', 'hotels', 'rooms', 'guests', 'reservations',
        'maintenance_orders', 'maintenance_technicians', 'maintenance_categories'
    )
ORDER BY table_name, ordinal_position;

-- 3. VERIFICAR FOREIGN KEYS
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. VERIFICAR DADOS BÁSICOS
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'hotels', COUNT(*) FROM hotels
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'guests', COUNT(*) FROM guests
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'maintenance_orders', COUNT(*) FROM maintenance_orders
UNION ALL
SELECT 'maintenance_technicians', COUNT(*) FROM maintenance_technicians
UNION ALL
SELECT 'maintenance_categories', COUNT(*) FROM maintenance_categories;

-- 5. TESTAR INSERÇÃO DE DADOS NO MÓDULO DE MANUTENÇÃO
-- Primeiro, verificar se temos dados básicos necessários
SELECT 'Checking basic data...' as status;

-- Verificar se existem hotéis
SELECT COUNT(*) as hotel_count FROM hotels;

-- Verificar se existem quartos
SELECT COUNT(*) as room_count FROM rooms;

-- Verificar se existem técnicos
SELECT COUNT(*) as technician_count FROM maintenance_technicians;

-- Verificar se existem categorias
SELECT COUNT(*) as category_count FROM maintenance_categories;
