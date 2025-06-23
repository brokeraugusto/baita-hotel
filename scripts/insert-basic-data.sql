-- Insert a test hotel profile
INSERT INTO profiles (id, email, full_name, user_role, hotel_name, subscription_status)
VALUES (
  uuid_generate_v4(),
  'hotel@teste.com',
  'Hotel Teste',
  'client',
  'Hotel Baita Teste',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Get the hotel ID for reference
WITH hotel AS (
  SELECT id FROM profiles WHERE email = 'hotel@teste.com' LIMIT 1
)
-- Insert test rooms
INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, status)
SELECT 
  hotel.id,
  '101',
  'Standard',
  2,
  150.00,
  'available'
FROM hotel
ON CONFLICT DO NOTHING;

-- Insert another room
WITH hotel AS (
  SELECT id FROM profiles WHERE email = 'hotel@teste.com' LIMIT 1
)
INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, status)
SELECT 
  hotel.id,
  '102',
  'Deluxe',
  4,
  250.00,
  'maintenance'
FROM hotel
ON CONFLICT DO NOTHING;

-- Insert test guest
WITH hotel AS (
  SELECT id FROM profiles WHERE email = 'hotel@teste.com' LIMIT 1
)
INSERT INTO guests (hotel_id, full_name, email, phone, document_number)
SELECT 
  hotel.id,
  'João Silva',
  'joao@teste.com',
  '(11) 99999-9999',
  '123.456.789-00'
FROM hotel
ON CONFLICT DO NOTHING;

-- Insert test maintenance orders
WITH hotel AS (
  SELECT id FROM profiles WHERE email = 'hotel@teste.com' LIMIT 1
),
room AS (
  SELECT r.id FROM rooms r 
  JOIN hotel h ON r.hotel_id = h.id 
  WHERE r.room_number = '102' LIMIT 1
)
INSERT INTO maintenance_orders (hotel_id, room_id, title, description, priority, status, assigned_to, estimated_cost)
SELECT 
  hotel.id,
  room.id,
  'Reparo no ar condicionado',
  'O ar condicionado do quarto 102 não está funcionando corretamente',
  'high',
  'pending',
  'João Técnico',
  200.00
FROM hotel, room
ON CONFLICT DO NOTHING;

-- Insert another maintenance order
WITH hotel AS (
  SELECT id FROM profiles WHERE email = 'hotel@teste.com' LIMIT 1
),
room AS (
  SELECT r.id FROM rooms r 
  JOIN hotel h ON r.hotel_id = h.id 
  WHERE r.room_number = '101' LIMIT 1
)
INSERT INTO maintenance_orders (hotel_id, room_id, title, description, priority, status, assigned_to, estimated_cost)
SELECT 
  hotel.id,
  room.id,
  'Limpeza profunda do banheiro',
  'Necessário fazer limpeza profunda e verificar vazamentos',
  'medium',
  'in-progress',
  'Maria Limpeza',
  80.00
FROM hotel, room
ON CONFLICT DO NOTHING;
