-- Criar tabelas principais do sistema
BEGIN;

SELECT 'CRIANDO TABELAS PRINCIPAIS DO SISTEMA' as title;

-- 1. Garantir que profiles existe (já existe, mas vamos verificar)
-- A tabela profiles já existe, então vamos apenas adicionar índices se necessário

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status);

-- 2. Criar tabela de quartos
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hotel_id VARCHAR(50) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
    amenities JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    floor_number INTEGER,
    area_sqm DECIMAL(6,2),
    UNIQUE(hotel_id, room_number)
);

-- 3. Criar tabela de hóspedes
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hotel_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    document_type VARCHAR(20) DEFAULT 'cpf',
    document_number VARCHAR(50),
    nationality VARCHAR(50) DEFAULT 'Brasil',
    birth_date DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'Brasil',
    notes TEXT,
    vip_status BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20)
);

-- 4. Criar tabela de reservas
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hotel_id VARCHAR(50) NOT NULL,
    room_id UUID,
    guest_id UUID,
    reservation_number VARCHAR(20) UNIQUE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show', 'checked_in')),
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
    special_requests TEXT,
    booking_source VARCHAR(50) DEFAULT 'direct',
    cancellation_reason TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);

CREATE INDEX IF NOT EXISTS idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_document ON guests(document_number);

CREATE INDEX IF NOT EXISTS idx_reservations_hotel_id ON reservations(hotel_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_number ON reservations(reservation_number);

COMMIT;

SELECT 'Tabelas principais criadas com sucesso!' as status;
