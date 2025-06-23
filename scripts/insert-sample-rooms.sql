-- Inserir quartos de exemplo
INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, status) VALUES
('hotel-1', '101', 'Standard', 2, 150.00, 'Quarto padrão com cama de casal', 'available'),
('hotel-1', '102', 'Standard', 2, 150.00, 'Quarto padrão com cama de casal', 'available'),
('hotel-1', '103', 'Standard', 2, 150.00, 'Quarto padrão com duas camas de solteiro', 'available'),
('hotel-1', '201', 'Deluxe', 3, 220.00, 'Quarto deluxe com vista para o mar', 'available'),
('hotel-1', '202', 'Deluxe', 3, 220.00, 'Quarto deluxe com varanda', 'available'),
('hotel-1', '301', 'Suite', 4, 350.00, 'Suíte master com jacuzzi', 'available'),
('hotel-1', '302', 'Suite', 4, 350.00, 'Suíte presidencial', 'available')
ON CONFLICT (hotel_id, room_number) DO UPDATE SET
    room_type = EXCLUDED.room_type,
    capacity = EXCLUDED.capacity,
    price_per_night = EXCLUDED.price_per_night,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verificar inserção
SELECT 'Quartos inseridos com sucesso!' as status;
SELECT hotel_id, room_number, room_type, status FROM rooms ORDER BY room_number;
