-- Verificar se o UUID do hotel existe
SELECT EXISTS (
   SELECT FROM rooms 
   WHERE hotel_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
) as hotel_exists;

-- Verificar os UUIDs de hotel disponíveis
SELECT DISTINCT hotel_id FROM rooms;
