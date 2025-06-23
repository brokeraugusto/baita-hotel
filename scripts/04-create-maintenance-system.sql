-- Criar sistema completo de manutenção
BEGIN;

SELECT 'CRIANDO SISTEMA COMPLETO DE MANUTENÇÃO' as title;

-- 1. Tabela de categorias de manutenção
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50) DEFAULT 'wrench',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- 2. Tabela de técnicos de manutenção
CREATE TABLE IF NOT EXISTS maintenance_technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    employee_id VARCHAR(50),
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    hourly_rate DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    notes TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20)
);

-- 3. Tabela principal de ordens de manutenção
CREATE TABLE IF NOT EXISTS maintenance_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Identificação
    hotel_id VARCHAR(50) NOT NULL,
    order_number VARCHAR(20) UNIQUE,
    
    -- Relacionamentos
    room_id UUID,
    category_id UUID,
    assigned_technician_id UUID,
    
    -- Informações básicas
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Status e prioridade
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    
    -- Tipo de manutenção
    maintenance_type VARCHAR(50) DEFAULT 'corrective' CHECK (maintenance_type IN ('corrective', 'preventive', 'emergency', 'inspection')),
    
    -- Emergência
    is_emergency BOOLEAN DEFAULT FALSE,
    emergency_level VARCHAR(20) CHECK (emergency_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Custos
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Tempo
    estimated_duration INTEGER, -- em minutos
    actual_duration INTEGER, -- em minutos
    scheduled_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Conclusão
    completed_by VARCHAR(255),
    completion_notes TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    
    -- Recorrência (para manutenção preventiva)
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    next_occurrence TIMESTAMP WITH TIME ZONE,
    
    -- Inspeção
    inspection_checklist JSONB,
    inspection_results JSONB,
    
    -- Anexos e observações
    attachments JSONB DEFAULT '[]'::jsonb,
    internal_notes TEXT,
    customer_visible BOOLEAN DEFAULT TRUE
);

-- 4. Tabela de materiais utilizados
CREATE TABLE IF NOT EXISTS maintenance_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'unidade',
    unit_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    supplier_name VARCHAR(255),
    supplier_contact TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Tabela de materiais utilizados em ordens
CREATE TABLE IF NOT EXISTS maintenance_order_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    maintenance_order_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity_used DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT
);

-- 6. Tabela de templates para manutenção preventiva
CREATE TABLE IF NOT EXISTS maintenance_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID,
    maintenance_type VARCHAR(50) DEFAULT 'preventive',
    estimated_duration INTEGER,
    estimated_cost DECIMAL(10,2),
    checklist JSONB DEFAULT '[]'::jsonb,
    instructions TEXT,
    required_tools TEXT[],
    safety_notes TEXT,
    recurrence_type VARCHAR(20) DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_type ON maintenance_orders(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_emergency ON maintenance_orders(is_emergency);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_created_at ON maintenance_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_scheduled ON maintenance_orders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_room ON maintenance_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_technician ON maintenance_orders(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_category ON maintenance_orders(category_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_categories_active ON maintenance_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_technicians_active ON maintenance_technicians(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_materials_active ON maintenance_materials(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_active ON maintenance_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_maintenance_order_materials_order ON maintenance_order_materials(maintenance_order_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_order_materials_material ON maintenance_order_materials(material_id);

COMMIT;

SELECT 'Sistema de manutenção criado com sucesso!' as status;
