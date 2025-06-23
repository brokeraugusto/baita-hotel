-- Script para testar funcionalidades básicas após a criação

-- 1. Testar inserção de perfil de usuário
INSERT INTO profiles (id, email, full_name, role) 
VALUES (
    gen_random_uuid(),
    'teste@hotel.com',
    'Usuário Teste',
    'hotel_admin'
) ON CONFLICT (email) DO NOTHING;

-- 2. Testar criação de hotel
WITH new_profile AS (
    SELECT id FROM profiles WHERE email = 'teste@hotel.com' LIMIT 1
)
INSERT INTO hotels (name, description, owner_id, city, state) 
SELECT 
    'Hotel Teste',
    'Hotel para testes do sistema',
    new_profile.id,
    'São Paulo',
    'SP'
FROM new_profile
ON CONFLICT DO NOTHING;

-- 3. Testar criação de categoria de quarto
WITH test_hotel AS (
    SELECT id FROM hotels WHERE name = 'Hotel Teste' LIMIT 1
)
INSERT INTO room_categories (hotel_id, name, description, base_price, max_occupancy)
SELECT 
    test_hotel.id,
    'Standard',
    'Quarto padrão com cama de casal',
    150.00,
    2
FROM test_hotel
ON CONFLICT DO NOTHING;

-- 4. Testar criação de quarto
WITH test_hotel AS (
    SELECT h.id as hotel_id, rc.id as category_id 
    FROM hotels h
    JOIN room_categories rc ON rc.hotel_id = h.id
    WHERE h.name = 'Hotel Teste' AND rc.name = 'Standard'
    LIMIT 1
)
INSERT INTO rooms (hotel_id, category_id, number, floor, status)
SELECT 
    test_hotel.hotel_id,
    test_hotel.category_id,
    '101',
    1,
    'available'
FROM test_hotel
ON CONFLICT (hotel_id, number) DO NOTHING;

-- 5. Verificar se os dados de teste foram inseridos
SELECT 
    'Perfis: ' || COUNT(*) as profiles_count
FROM profiles WHERE email = 'teste@hotel.com';

SELECT 
    'Hotéis: ' || COUNT(*) as hotels_count
FROM hotels WHERE name = 'Hotel Teste';

SELECT 
    'Categorias: ' || COUNT(*) as categories_count
FROM room_categories rc
JOIN hotels h ON h.id = rc.hotel_id
WHERE h.name = 'Hotel Teste';

SELECT 
    'Quartos: ' || COUNT(*) as rooms_count
FROM rooms r
JOIN hotels h ON h.id = r.hotel_id
WHERE h.name = 'Hotel Teste';

-- 6. Limpar dados de teste
DELETE FROM rooms WHERE hotel_id IN (SELECT id FROM hotels WHERE name = 'Hotel Teste');
DELETE FROM room_categories WHERE hotel_id IN (SELECT id FROM hotels WHERE name = 'Hotel Teste');
DELETE FROM hotels WHERE name = 'Hotel Teste';
DELETE FROM profiles WHERE email = 'teste@hotel.com';

SELECT '✅ Teste básico concluído com sucesso!' as result;
