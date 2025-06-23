-- Criar tabela de tarefas de limpeza
CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL,
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

-- Inserir dados de exemplo na tabela cleaning_personnel (usando UUID correto)
INSERT INTO cleaning_personnel (id, hotel_id, name, email, phone, is_active, specialties, hourly_rate, notes) VALUES
('d5f6e7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Maria Silva', 'maria@hotel.com', '(11) 98765-4321', true, ARRAY['Quartos Standard', 'Limpeza Geral'], 25.00, 'Turno: Manhã'),
('e6f7a8b9-c0d1-4e2f-8a3b-4c5d6e7f8a9b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'João Santos', 'joao@hotel.com', '(11) 91234-5678', true, ARRAY['Quartos Deluxe', 'Áreas Comuns'], 30.00, 'Turno: Manhã'),
('f7a8b9c0-d1e2-4f3a-8b4c-5d6e7f8a9b0c', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ana Oliveira', 'ana@hotel.com', '(11) 99876-5432', true, ARRAY['Suítes', 'Limpeza Profunda'], 35.00, 'Turno: Tarde'),
('a8b9c0d1-e2f3-4a5b-8c6d-7e8f9a0b1c2d', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos Pereira', 'carlos@hotel.com', '(11) 98765-1234', true, ARRAY['Manutenção', 'Inspeção'], 28.00, 'Turno: Integral')
ON CONFLICT (id) DO NOTHING;

-- Inserir algumas tarefas de exemplo
INSERT INTO cleaning_tasks (id, hotel_id, title, description, task_type, status, priority, location, scheduled_for, estimated_duration) VALUES
('b9c0d1e2-f3a4-4b5c-8d6e-7f8a9b0c1d2e', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Limpeza do Lobby', 'Limpeza completa do lobby principal', 'regular', 'pending', 'medium', 'Lobby Principal', NOW() + INTERVAL '2 hours', 60),
('c0d1e2f3-a4b5-4c6d-8e7f-8a9b0c1d2e3f', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Limpeza da Piscina', 'Manutenção e limpeza da área da piscina', 'deep', 'pending', 'high', 'Área da Piscina', NOW() + INTERVAL '4 hours', 120),
('d1e2f3a4-b5c6-4d7e-8f8a-9b0c1d2e3f4a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Inspeção Restaurante', 'Inspeção de limpeza do restaurante', 'inspection', 'in-progress', 'medium', 'Restaurante', NOW() - INTERVAL '1 hour', 45)
ON CONFLICT (id) DO NOTHING;

-- Verificar se a coluna price_per_night existe na tabela rooms
SELECT EXISTS (
   SELECT FROM information_schema.columns 
   WHERE table_name = 'rooms' AND column_name = 'price_per_night'
) as price_per_night_exists;
