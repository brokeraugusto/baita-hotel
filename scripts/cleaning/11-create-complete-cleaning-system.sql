-- Criar tabelas do sistema de limpeza completo
CREATE TABLE IF NOT EXISTS cleaning_personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    phone VARCHAR,
    is_active BOOLEAN DEFAULT true,
    specialties TEXT[],
    hourly_rate DECIMAL(10,2),
    shift VARCHAR CHECK (shift IN ('morning', 'afternoon', 'night', 'full')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id VARCHAR NOT NULL,
    room_id UUID REFERENCES rooms(id),
    title VARCHAR NOT NULL,
    description TEXT,
    task_type VARCHAR CHECK (task_type IN ('regular', 'deep', 'checkout', 'inspection', 'maintenance')) DEFAULT 'regular',
    status VARCHAR CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled', 'paused')) DEFAULT 'pending',
    priority VARCHAR CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    assigned_personnel_id UUID REFERENCES cleaning_personnel(id),
    scheduled_for TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_duration INTEGER, -- em minutos
    actual_duration INTEGER, -- em minutos
    notes TEXT,
    checklist_items JSONB DEFAULT '{}',
    checklist_progress JSONB DEFAULT '{}',
    location VARCHAR, -- para tarefas que não são de quartos específicos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO cleaning_personnel (id, hotel_id, name, email, phone, is_active, specialties, hourly_rate, shift) VALUES
('staff-1', 'hotel-1', 'Maria Silva', 'maria@hotel.com', '(11) 98765-4321', true, ARRAY['Quartos Standard', 'Limpeza Geral'], 25.00, 'morning'),
('staff-2', 'hotel-1', 'João Santos', 'joao@hotel.com', '(11) 91234-5678', true, ARRAY['Quartos Deluxe', 'Áreas Comuns'], 30.00, 'morning'),
('staff-3', 'hotel-1', 'Ana Oliveira', 'ana@hotel.com', '(11) 99876-5432', true, ARRAY['Suítes', 'Limpeza Profunda'], 35.00, 'afternoon'),
('staff-4', 'hotel-1', 'Carlos Pereira', 'carlos@hotel.com', '(11) 98765-1234', true, ARRAY['Manutenção', 'Inspeção'], 28.00, 'full')
ON CONFLICT (id) DO NOTHING;

-- Inserir quartos de exemplo se não existirem
INSERT INTO rooms (hotel_id, room_number, room_type, floor_number, status, capacity, price_per_night, description) VALUES
('hotel-1', '101', 'Standard', 1, 'clean', 2, 150.00, 'Quarto padrão com vista para o jardim'),
('hotel-1', '102', 'Standard', 1, 'dirty', 2, 150.00, 'Quarto padrão com vista para o jardim'),
('hotel-1', '103', 'Standard', 1, 'in-progress', 2, 150.00, 'Quarto padrão com vista para o jardim'),
('hotel-1', '201', 'Deluxe', 2, 'maintenance', 4, 250.00, 'Quarto deluxe com varanda'),
('hotel-1', '202', 'Deluxe', 2, 'clean', 4, 250.00, 'Quarto deluxe com varanda'),
('hotel-1', '203', 'Deluxe', 2, 'dirty', 4, 250.00, 'Quarto deluxe com varanda'),
('hotel-1', '301', 'Suite', 3, 'inspection', 6, 400.00, 'Suíte presidencial'),
('hotel-1', '302', 'Suite', 3, 'clean', 6, 400.00, 'Suíte presidencial')
ON CONFLICT (hotel_id, room_number) DO NOTHING;

-- Inserir tarefas de exemplo
DO $$
DECLARE
    room_102_id UUID;
    room_103_id UUID;
    room_201_id UUID;
    room_301_id UUID;
BEGIN
    -- Buscar IDs dos quartos
    SELECT id INTO room_102_id FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '102' LIMIT 1;
    SELECT id INTO room_103_id FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '103' LIMIT 1;
    SELECT id INTO room_201_id FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '201' LIMIT 1;
    SELECT id INTO room_301_id FROM rooms WHERE hotel_id = 'hotel-1' AND room_number = '301' LIMIT 1;

    -- Inserir tarefas
    INSERT INTO cleaning_tasks (id, hotel_id, room_id, title, description, task_type, status, priority, assigned_personnel_id, scheduled_for, estimated_duration, notes) VALUES
    ('task-1', 'hotel-1', room_102_id, 'Limpeza Pós Check-out', 'Limpeza completa após saída do hóspede', 'checkout', 'pending', 'high', 'staff-1', NOW() + INTERVAL '1 hour', 60, 'Verificar itens esquecidos'),
    ('task-2', 'hotel-1', room_103_id, 'Limpeza em Andamento', 'Limpeza regular do quarto', 'regular', 'in-progress', 'medium', 'staff-2', NOW(), 45, NULL),
    ('task-3', 'hotel-1', room_201_id, 'Manutenção Preventiva', 'Verificação e limpeza de ar-condicionado', 'maintenance', 'pending', 'urgent', 'staff-3', NOW() + INTERVAL '2 hours', 90, 'Problema reportado pelo hóspede'),
    ('task-4', 'hotel-1', room_301_id, 'Inspeção de Qualidade', 'Inspeção final após limpeza profunda', 'inspection', 'completed', 'low', 'staff-1', NOW() - INTERVAL '1 hour', 30, 'Aprovado')
    ON CONFLICT (id) DO NOTHING;
END $$;
