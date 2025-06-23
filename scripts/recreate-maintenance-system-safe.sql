-- Recriar sistema de manutenção de forma segura
BEGIN;

SELECT 'RECRIANDO SISTEMA DE MANUTENÇÃO DE FORMA SEGURA' as title;

-- 1. Remover tabelas de manutenção existentes (se houver)
DROP TABLE IF EXISTS maintenance_order_materials CASCADE;
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS maintenance_materials CASCADE;
DROP TABLE IF EXISTS maintenance_templates CASCADE;
DROP TABLE IF EXISTS maintenance_technicians CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;

-- 2. Criar tabela de categorias de manutenção
CREATE TABLE maintenance_categories (
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

-- 3. Criar tabela de técnicos de manutenção
CREATE TABLE maintenance_technicians (
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
    notes TEXT
);

-- 4. Criar tabela de materiais
CREATE TABLE maintenance_materials (
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
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Criar tabela principal de ordens de manutenção
CREATE TABLE maintenance_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Identificação
    hotel_id VARCHAR(50) NOT NULL,
    order_number VARCHAR(20) UNIQUE,
    
    -- Relacionamentos (sem foreign keys por enquanto)
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
    
    -- Anexos e observações
    internal_notes TEXT,
    customer_visible BOOLEAN DEFAULT TRUE
);

-- 6. Criar tabela de materiais utilizados em ordens
CREATE TABLE maintenance_order_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    maintenance_order_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity_used DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT
);

-- 7. Criar tabela de templates
CREATE TABLE maintenance_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID,
    maintenance_type VARCHAR(50) DEFAULT 'preventive',
    estimated_duration INTEGER,
    estimated_cost DECIMAL(10,2),
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 8. Criar índices
CREATE INDEX idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX idx_maintenance_orders_type ON maintenance_orders(maintenance_type);
CREATE INDEX idx_maintenance_orders_emergency ON maintenance_orders(is_emergency);
CREATE INDEX idx_maintenance_orders_created_at ON maintenance_orders(created_at);

CREATE INDEX idx_maintenance_categories_active ON maintenance_categories(is_active);
CREATE INDEX idx_maintenance_technicians_active ON maintenance_technicians(is_active);
CREATE INDEX idx_maintenance_materials_active ON maintenance_materials(is_active);
CREATE INDEX idx_maintenance_templates_active ON maintenance_templates(is_active);

COMMIT;

SELECT 'Sistema de manutenção recriado com sucesso!' as status;
