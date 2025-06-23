-- Verificar e criar tabelas essenciais que podem estar faltando

-- 1. Criar tabela hotels se não existir
CREATE TABLE IF NOT EXISTS hotels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'Brasil',
    website VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID UNIQUE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Criar tabela rooms se não existir
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    number VARCHAR(20) NOT NULL,
    type VARCHAR(50) DEFAULT 'Standard',
    status VARCHAR(50) DEFAULT 'clean',
    capacity INTEGER DEFAULT 2,
    floor INTEGER,
    description TEXT,
    amenities TEXT[],
    daily_rate NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(hotel_id, number)
);

-- 4. Criar tabela cleaning_personnel se não existir (já criada anteriormente, mas garantindo)
CREATE TABLE IF NOT EXISTS cleaning_personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    specialties TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate NUMERIC(10, 2),
    notes TEXT,
    avatar_url TEXT,
    availability JSONB
);

-- 5. Criar tabela cleaning_tasks se não existir (já criada anteriormente, mas garantindo)
CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    assigned_personnel_id UUID REFERENCES cleaning_personnel(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    checklist_progress JSONB,
    checklist_items JSONB,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    reported_by VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_interval VARCHAR(50),
    next_occurrence TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    notes TEXT
);

-- 6. Criar tabela room_status_logs se não existir
CREATE TABLE IF NOT EXISTS room_status_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_hotels_name ON hotels(name);
CREATE INDEX IF NOT EXISTS idx_profiles_hotel_id ON profiles(hotel_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(hotel_id, number);
CREATE INDEX IF NOT EXISTS idx_cleaning_personnel_hotel_id ON cleaning_personnel(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_personnel_active ON cleaning_personnel(hotel_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_hotel_id ON cleaning_tasks(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_room_id ON cleaning_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_status ON cleaning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_assigned ON cleaning_tasks(assigned_personnel_id);
CREATE INDEX IF NOT EXISTS idx_room_status_logs_room_id ON room_status_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_room_status_logs_hotel_id ON room_status_logs(hotel_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_status_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (temporárias para desenvolvimento)
-- NOTA: Em produção, essas políticas devem ser mais restritivas

-- Política para hotels (acesso total temporário)
DROP POLICY IF EXISTS "temp_hotels_access" ON hotels;
CREATE POLICY "temp_hotels_access" ON hotels FOR ALL USING (true);

-- Política para profiles (acesso total temporário)
DROP POLICY IF EXISTS "temp_profiles_access" ON profiles;
CREATE POLICY "temp_profiles_access" ON profiles FOR ALL USING (true);

-- Política para rooms (acesso total temporário)
DROP POLICY IF EXISTS "temp_rooms_access" ON rooms;
CREATE POLICY "temp_rooms_access" ON rooms FOR ALL USING (true);

-- Política para cleaning_personnel (acesso total temporário)
DROP POLICY IF EXISTS "temp_cleaning_personnel_access" ON cleaning_personnel;
CREATE POLICY "temp_cleaning_personnel_access" ON cleaning_personnel FOR ALL USING (true);

-- Política para cleaning_tasks (acesso total temporário)
DROP POLICY IF EXISTS "temp_cleaning_tasks_access" ON cleaning_tasks;
CREATE POLICY "temp_cleaning_tasks_access" ON cleaning_tasks FOR ALL USING (true);

-- Política para room_status_logs (acesso total temporário)
DROP POLICY IF EXISTS "temp_room_status_logs_access" ON room_status_logs;
CREATE POLICY "temp_room_status_logs_access" ON room_status_logs FOR ALL USING (true);

-- Inserir dados básicos se não existirem
DO $$
DECLARE
    sample_hotel_id UUID;
    sample_profile_id UUID;
BEGIN
    -- Inserir hotel de exemplo se não existir
    INSERT INTO hotels (name, email, phone, address, city, state, country)
    VALUES ('Hotel Baita', 'contato@hotelbaita.com', '(11) 99999-9999', 
            'Rua das Flores, 123', 'São Paulo', 'SP', 'Brasil')
    ON CONFLICT DO NOTHING
    RETURNING id INTO sample_hotel_id;
    
    -- Se não retornou ID, buscar o existente
    IF sample_hotel_id IS NULL THEN
        SELECT id INTO sample_hotel_id FROM hotels LIMIT 1;
    END IF;
    
    -- Inserir perfil de exemplo se não existir
    INSERT INTO profiles (hotel_id, email, name, role)
    VALUES (sample_hotel_id, 'admin@hotelbaita.com', 'Administrador', 'admin')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO sample_profile_id;
    
    -- Inserir quartos de exemplo se não existirem
    INSERT INTO rooms (hotel_id, number, type, status, capacity, floor)
    VALUES 
        (sample_hotel_id, '101', 'Standard', 'clean', 2, 1),
        (sample_hotel_id, '102', 'Standard', 'dirty', 2, 1),
        (sample_hotel_id, '103', 'Deluxe', 'cleaning', 3, 1),
        (sample_hotel_id, '104', 'Standard', 'clean', 2, 1),
        (sample_hotel_id, '105', 'Standard', 'maintenance', 2, 1),
        (sample_hotel_id, '201', 'Suite', 'clean', 4, 2),
        (sample_hotel_id, '202', 'Standard', 'dirty', 2, 2),
        (sample_hotel_id, '203', 'Deluxe', 'inspected', 3, 2),
        (sample_hotel_id, '204', 'Standard', 'clean', 2, 2),
        (sample_hotel_id, '205', 'Suite', 'clean', 4, 2)
    ON CONFLICT (hotel_id, number) DO NOTHING;
    
    RAISE NOTICE 'Estrutura básica criada com hotel ID: %', sample_hotel_id;
END $$;

-- Verificar se as tabelas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('hotels', 'profiles', 'rooms', 'cleaning_personnel', 'cleaning_tasks', 'room_status_logs')
ORDER BY tablename;

-- Verificar se há dados nas tabelas
SELECT 
    'hotels' as tabela, COUNT(*) as registros FROM hotels
UNION ALL
SELECT 
    'profiles' as tabela, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 
    'rooms' as tabela, COUNT(*) as registros FROM rooms
UNION ALL
SELECT 
    'cleaning_personnel' as tabela, COUNT(*) as registros FROM cleaning_personnel
UNION ALL
SELECT 
    'cleaning_tasks' as tabela, COUNT(*) as registros FROM cleaning_tasks
UNION ALL
SELECT 
    'room_status_logs' as tabela, COUNT(*) as registros FROM room_status_logs;
