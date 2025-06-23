-- Criar tabelas de manutenção de forma segura
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    specialties TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    hotel_id VARCHAR(50) NOT NULL,
    room_id UUID,
    category_id UUID,
    assigned_technician_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_duration INTEGER, -- em minutos
    actual_duration INTEGER, -- em minutos
    completed_by VARCHAR(255),
    completion_notes TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    -- Novos campos para diferentes tipos de manutenção
    maintenance_type VARCHAR(50) DEFAULT 'corrective' CHECK (maintenance_type IN ('corrective', 'preventive', 'emergency', 'inspection')),
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    next_occurrence TIMESTAMP,
    parent_order_id UUID,
    is_emergency BOOLEAN DEFAULT FALSE,
    emergency_level VARCHAR(20) CHECK (emergency_level IN ('low', 'medium', 'high', 'critical')),
    inspection_checklist JSONB,
    inspection_results JSONB,
    preventive_schedule JSONB,
    CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES maintenance_categories(id),
    CONSTRAINT fk_technician FOREIGN KEY (assigned_technician_id) REFERENCES maintenance_technicians(id),
    CONSTRAINT fk_parent_order FOREIGN KEY (parent_order_id) REFERENCES maintenance_orders(id)
);

-- Inserir categorias padrão
INSERT INTO maintenance_categories (name, description, color) VALUES
('Elétrica', 'Problemas relacionados ao sistema elétrico', '#F59E0B'),
('Hidráulica', 'Problemas relacionados ao sistema hidráulico', '#3B82F6'),
('Ar-condicionado', 'Manutenção de sistemas de climatização', '#10B981'),
('Mobiliário', 'Reparos em móveis e decoração', '#8B5CF6'),
('Segurança', 'Sistemas de segurança e fechaduras', '#EF4444'),
('Limpeza', 'Serviços especiais de limpeza', '#06B6D4'),
('Pintura', 'Serviços de pintura e acabamento', '#F97316'),
('Jardinagem', 'Manutenção de áreas verdes', '#22C55E')
ON CONFLICT (name) DO NOTHING;

-- Inserir técnicos padrão
INSERT INTO maintenance_technicians (name, email, phone, specialties) VALUES
('João Silva', 'joao@hotel.com', '(11) 99999-1111', ARRAY['Elétrica', 'Segurança']),
('Maria Santos', 'maria@hotel.com', '(11) 99999-2222', ARRAY['Elétrica', 'Ar-condicionado']),
('Pedro Costa', 'pedro@hotel.com', '(11) 99999-3333', ARRAY['Hidráulica', 'Limpeza']),
('Ana Lima', 'ana@hotel.com', '(11) 99999-4444', ARRAY['Ar-condicionado', 'Mobiliário']),
('Carlos Oliveira', 'carlos@hotel.com', '(11) 99999-5555', ARRAY['Mobiliário', 'Pintura'])
ON CONFLICT (email) DO NOTHING;
