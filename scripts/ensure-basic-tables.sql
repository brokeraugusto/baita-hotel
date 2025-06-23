-- Garantir que todas as tabelas básicas existam
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    hotel_id VARCHAR(50) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
    amenities JSONB,
    image_url TEXT,
    UNIQUE(hotel_id, room_number)
);

CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    hotel_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    document_type VARCHAR(20),
    document_number VARCHAR(50),
    nationality VARCHAR(50),
    address TEXT,
    notes TEXT,
    vip_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    hotel_id VARCHAR(50) NOT NULL,
    room_id UUID,
    guest_id UUID,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    total_price DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    special_requests TEXT,
    booking_source VARCHAR(50),
    CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_guest FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- Inserir dados de exemplo se as tabelas estiverem vazias
INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, status)
SELECT 'hotel-1', '101', 'Standard', 2, 150.00, 'Quarto padrão com cama de casal', 'available'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '101');

INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, status)
SELECT 'hotel-1', '102', 'Standard', 2, 150.00, 'Quarto padrão com cama de casal', 'available'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '102');

INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, status)
SELECT 'hotel-1', '201', 'Deluxe', 3, 220.00, 'Quarto deluxe com vista para o mar', 'available'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '201');

INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, status)
SELECT 'hotel-1', '301', 'Suite', 4, 350.00, 'Suíte master com jacuzzi', 'available'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '301');
