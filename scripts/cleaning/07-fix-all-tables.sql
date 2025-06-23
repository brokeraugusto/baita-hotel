-- Criar todas as tabelas necessárias para o módulo de limpeza funcionar
-- Este script garante que todas as dependências estejam corretas

-- 1. Criar tabela hotels se não existir
CREATE TABLE IF NOT EXISTS hotels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'Brasil',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela rooms se não existir
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    number VARCHAR(10) NOT NULL,
    name VARCHAR(255),
    type VARCHAR(50) DEFAULT 'Standard',
    status VARCHAR(50) DEFAULT 'clean',
    capacity INTEGER DEFAULT 2,
    floor INTEGER,
    description TEXT,
    amenities TEXT[],
    price_per_night DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hotel_id, number)
);

-- 4. Criar tabela cleaning_personnel se não existir
CREATE TABLE IF NOT EXISTS cleaning_personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(100),
    contact VARCHAR(255),
    specialties TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10,2),
    notes TEXT,
    avatar_url TEXT,
    availability JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela cleaning_tasks se não existir
CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    assigned_personnel_id UUID REFERENCES cleaning_personnel(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    location VARCHAR(255),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    reported_by VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_interval VARCHAR(50),
    next_occurrence TIMESTAMP WITH TIME ZONE,
    checklist_items JSONB,
    checklist_progress JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_personnel_hotel_id ON cleaning_personnel(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_personnel_active ON cleaning_personnel(is_active);
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

-- Inserir dados de exemplo se não existirem
DO $$
DECLARE
    sample_hotel_id UUID;
    sample_profile_id UUID;
    sample_room_ids UUID[];
    personnel_ids UUID[];
BEGIN
    -- Verificar se já existe hotel
    SELECT id INTO sample_hotel_id FROM hotels LIMIT 1;
    
    IF sample_hotel_id IS NULL THEN
        -- Criar hotel de exemplo
        INSERT INTO hotels (name, email, phone, address, city, state)
        VALUES ('Hotel Exemplo', 'contato@hotelexemplo.com', '(11) 99999-9999', 
                'Rua das Flores, 123', 'São Paulo', 'SP')
        RETURNING id INTO sample_hotel_id;
        
        RAISE NOTICE 'Hotel criado: %', sample_hotel_id;
    END IF;

    -- Criar perfil de exemplo se não existir
    SELECT id INTO sample_profile_id FROM profiles WHERE hotel_id = sample_hotel_id LIMIT 1;
    
    IF sample_profile_id IS NULL THEN
        INSERT INTO profiles (hotel_id, name, email, role)
        VALUES (sample_hotel_id, 'Admin Hotel', 'admin@hotelexemplo.com', 'admin')
        RETURNING id INTO sample_profile_id;
        
        RAISE NOTICE 'Perfil criado: %', sample_profile_id;
    END IF;

    -- Criar quartos de exemplo se não existirem
    SELECT ARRAY(SELECT id FROM rooms WHERE hotel_id = sample_hotel_id) INTO sample_room_ids;
    
    IF array_length(sample_room_ids, 1) IS NULL OR array_length(sample_room_ids, 1) < 5 THEN
        INSERT INTO rooms (hotel_id, number, name, type, status, capacity, floor)
        VALUES 
            (sample_hotel_id, '101', 'Quarto 101', 'Standard', 'clean', 2, 1),
            (sample_hotel_id, '102', 'Quarto 102', 'Standard', 'dirty', 2, 1),
            (sample_hotel_id, '103', 'Quarto 103', 'Deluxe', 'cleaning', 3, 1),
            (sample_hotel_id, '201', 'Suíte 201', 'Suite', 'clean', 4, 2),
            (sample_hotel_id, '202', 'Quarto 202', 'Standard', 'maintenance', 2, 2),
            (sample_hotel_id, '203', 'Quarto 203', 'Standard', 'inspected', 2, 2),
            (sample_hotel_id, '301', 'Quarto 301', 'Deluxe', 'dirty', 3, 3),
            (sample_hotel_id, '302', 'Quarto 302', 'Standard', 'clean', 2, 3)
        ON CONFLICT (hotel_id, number) DO NOTHING;
        
        RAISE NOTICE 'Quartos criados para hotel: %', sample_hotel_id;
    END IF;

    -- Criar pessoal de limpeza se não existir
    SELECT ARRAY(SELECT id FROM cleaning_personnel WHERE hotel_id = sample_hotel_id) INTO personnel_ids;
    
    IF array_length(personnel_ids, 1) IS NULL OR array_length(personnel_ids, 1) < 3 THEN
        INSERT INTO cleaning_personnel (hotel_id, name, email, phone, position, contact, specialties, is_active, hourly_rate, notes)
        VALUES 
            (sample_hotel_id, 'Maria Silva', 'maria.silva@hotel.com', '(11) 98888-1111', 'Camareira', 'maria.silva@hotel.com',
             ARRAY['Limpeza de quartos', 'Lavanderia'], true, 25.00, 'Funcionária experiente, trabalha há 5 anos'),
            (sample_hotel_id, 'João Santos', 'joao.santos@hotel.com', '(11) 98888-2222', 'Auxiliar de Limpeza', 'joao.santos@hotel.com',
             ARRAY['Limpeza pesada', 'Manutenção básica'], true, 28.00, 'Especialista em limpeza pós-obra'),
            (sample_hotel_id, 'Ana Costa', 'ana.costa@hotel.com', '(11) 98888-3333', 'Supervisora', 'ana.costa@hotel.com',
             ARRAY['Limpeza de suítes', 'Organização', 'Supervisão'], true, 30.00, 'Supervisora da equipe de governança'),
            (sample_hotel_id, 'Carlos Oliveira', 'carlos.oliveira@hotel.com', '(11) 98888-4444', 'Camareiro', 'carlos.oliveira@hotel.com',
             ARRAY['Limpeza de quartos', 'Áreas comuns'], true, 24.00, 'Responsável por áreas comuns')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Pessoal de limpeza criado para hotel: %', sample_hotel_id;
    END IF;

    -- Criar tarefas de exemplo se não existirem
    IF NOT EXISTS (SELECT 1 FROM cleaning_tasks WHERE hotel_id = sample_hotel_id) THEN
        INSERT INTO cleaning_tasks (
            hotel_id, room_id, assigned_personnel_id, title, description, task_type,
            status, priority, scheduled_for, estimated_duration, checklist_items, notes
        )
        SELECT 
            sample_hotel_id,
            r.id,
            p.id,
            'Limpeza Completa - ' || r.name,
            'Limpeza completa do quarto após check-out',
            'Limpeza Completa',
            'pending',
            'high',
            NOW() + INTERVAL '1 hour',
            60,
            '{"trocar_roupas_cama": false, "limpar_banheiro": false, "aspirar_carpete": false, "repor_amenities": false, "verificar_minibar": false}',
            'Tarefa de exemplo - limpeza completa'
        FROM rooms r
        CROSS JOIN cleaning_personnel p
        WHERE r.hotel_id = sample_hotel_id 
        AND p.hotel_id = sample_hotel_id
        AND r.number = '101'
        AND p.name = 'Maria Silva'
        LIMIT 1;

        INSERT INTO cleaning_tasks (
            hotel_id, room_id, assigned_personnel_id, title, description, task_type,
            status, priority, scheduled_for, estimated_duration, checklist_items, notes
        )
        SELECT 
            sample_hotel_id,
            r.id,
            p.id,
            'Limpeza Diária - ' || r.name,
            'Limpeza de manutenção diária',
            'Limpeza Diária',
            'in-progress',
            'medium',
            NOW(),
            45,
            '{"trocar_toalhas": true, "limpar_banheiro": false, "organizar_quarto": false, "repor_amenities": false}',
            'Tarefa em andamento'
        FROM rooms r
        CROSS JOIN cleaning_personnel p
        WHERE r.hotel_id = sample_hotel_id 
        AND p.hotel_id = sample_hotel_id
        AND r.number = '102'
        AND p.name = 'João Santos'
        LIMIT 1;

        INSERT INTO cleaning_tasks (
            hotel_id, assigned_personnel_id, title, description, task_type,
            status, priority, location, scheduled_for, estimated_duration, checklist_items, notes
        )
        SELECT 
            sample_hotel_id,
            p.id,
            'Limpeza do Lobby',
            'Limpeza e organização da área do lobby',
            'Limpeza de Áreas Comuns',
            'pending',
            'low',
            'Lobby Principal',
            NOW() + INTERVAL '3 hours',
            90,
            '{"aspirar_carpetes": false, "limpar_moveis": false, "organizar_revistas": false, "limpar_vidros": false}',
            'Limpeza programada para o final da tarde'
        FROM cleaning_personnel p
        WHERE p.hotel_id = sample_hotel_id
        AND p.name = 'Ana Costa'
        LIMIT 1;

        RAISE NOTICE 'Tarefas de exemplo criadas para hotel: %', sample_hotel_id;
    END IF;

END $$;

-- Verificar se tudo foi criado corretamente
SELECT 
    'Verificação das tabelas criadas:' as info,
    (SELECT COUNT(*) FROM hotels) as hotels,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM rooms) as rooms,
    (SELECT COUNT(*) FROM cleaning_personnel) as personnel,
    (SELECT COUNT(*) FROM cleaning_tasks) as tasks,
    (SELECT COUNT(*) FROM room_status_logs) as status_logs;
