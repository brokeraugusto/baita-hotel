-- Adicionar novos tipos de manutenção e campos necessários
ALTER TABLE maintenance_orders 
ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(50) DEFAULT 'corrective' CHECK (maintenance_type IN ('corrective', 'preventive', 'emergency', 'inspection')),
ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
ADD COLUMN IF NOT EXISTS next_occurrence TIMESTAMP,
ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES maintenance_orders(id),
ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emergency_level VARCHAR(20) CHECK (emergency_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS inspection_checklist JSONB,
ADD COLUMN IF NOT EXISTS inspection_results JSONB,
ADD COLUMN IF NOT EXISTS preventive_schedule JSONB;

-- Criar tabela para templates de manutenção preventiva
CREATE TABLE IF NOT EXISTS maintenance_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES maintenance_categories(id),
    maintenance_type VARCHAR(50) NOT NULL,
    recurrence_type VARCHAR(20) NOT NULL,
    estimated_duration INTEGER, -- em horas
    estimated_cost DECIMAL(10,2),
    checklist JSONB,
    instructions TEXT,
    required_tools TEXT[],
    safety_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela para histórico de inspeções
CREATE TABLE IF NOT EXISTS maintenance_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_order_id UUID REFERENCES maintenance_orders(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES maintenance_technicians(id),
    inspection_date TIMESTAMP DEFAULT NOW(),
    checklist_results JSONB,
    findings TEXT,
    recommendations TEXT,
    passed BOOLEAN,
    next_inspection_date TIMESTAMP,
    photos TEXT[], -- URLs das fotos
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela para peças e materiais
CREATE TABLE IF NOT EXISTS maintenance_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    supplier_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela para materiais usados em ordens
CREATE TABLE IF NOT EXISTS maintenance_order_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_order_id UUID REFERENCES maintenance_orders(id) ON DELETE CASCADE,
    material_id UUID REFERENCES maintenance_materials(id),
    quantity_used INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir templates de manutenção preventiva
INSERT INTO maintenance_templates (name, description, maintenance_type, recurrence_type, estimated_duration, estimated_cost, checklist, instructions) VALUES
('Manutenção Preventiva AC', 'Limpeza e verificação do sistema de ar condicionado', 'preventive', 'monthly', 2, 120.00, 
 '["Limpar filtros", "Verificar gás refrigerante", "Testar termostato", "Verificar drenagem"]', 
 'Realizar limpeza completa do sistema e verificar todos os componentes'),
('Inspeção Elétrica Mensal', 'Verificação de sistemas elétricos', 'inspection', 'monthly', 3, 200.00,
 '["Verificar quadro elétrico", "Testar disjuntores", "Verificar tomadas", "Medir voltagem"]',
 'Inspeção completa dos sistemas elétricos do andar'),
('Manutenção Hidráulica Preventiva', 'Verificação de tubulações e conexões', 'preventive', 'quarterly', 4, 300.00,
 '["Verificar vazamentos", "Testar pressão", "Limpar ralos", "Verificar registros"]',
 'Manutenção preventiva completa do sistema hidráulico');

-- Inserir materiais comuns
INSERT INTO maintenance_materials (name, description, category, unit_price, stock_quantity, minimum_stock) VALUES
('Filtro de Ar Split 9000 BTUs', 'Filtro para ar condicionado split', 'Ar Condicionado', 25.00, 50, 10),
('Lâmpada LED 12W', 'Lâmpada LED branca fria', 'Elétrica', 15.00, 100, 20),
('Vedante de Silicone', 'Silicone transparente para vedação', 'Hidráulica', 8.50, 30, 5),
('Disjuntor 20A', 'Disjuntor bipolar 20 amperes', 'Elétrica', 35.00, 20, 5),
('Registro de Gaveta 1/2"', 'Registro de gaveta rosqueável', 'Hidráulica', 22.00, 15, 3);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_type ON maintenance_orders(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_emergency ON maintenance_orders(is_emergency);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_recurrence ON maintenance_orders(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_type ON maintenance_templates(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_inspections_date ON maintenance_inspections(inspection_date);

-- Atualizar trigger para novos campos
CREATE OR REPLACE FUNCTION update_maintenance_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para agendamento automático de manutenção preventiva
CREATE OR REPLACE FUNCTION schedule_next_preventive_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    -- Se é uma ordem preventiva concluída, agendar a próxima
    IF NEW.status = 'completed' AND NEW.maintenance_type = 'preventive' AND NEW.recurrence_type != 'none' THEN
        UPDATE maintenance_orders 
        SET next_occurrence = CASE 
            WHEN NEW.recurrence_type = 'daily' THEN NEW.completed_at + INTERVAL '1 day'
            WHEN NEW.recurrence_type = 'weekly' THEN NEW.completed_at + INTERVAL '1 week'
            WHEN NEW.recurrence_type = 'monthly' THEN NEW.completed_at + INTERVAL '1 month'
            WHEN NEW.recurrence_type = 'quarterly' THEN NEW.completed_at + INTERVAL '3 months'
            WHEN NEW.recurrence_type = 'yearly' THEN NEW.completed_at + INTERVAL '1 year'
        END
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_schedule_preventive_maintenance
    AFTER UPDATE ON maintenance_orders
    FOR EACH ROW
    EXECUTE FUNCTION schedule_next_preventive_maintenance();

COMMENT ON TABLE maintenance_orders IS 'Tabela principal de ordens de manutenção expandida';
COMMENT ON TABLE maintenance_templates IS 'Templates para manutenção preventiva e inspeções';
COMMENT ON TABLE maintenance_inspections IS 'Histórico de inspeções realizadas';
COMMENT ON TABLE maintenance_materials IS 'Catálogo de materiais e peças';
COMMENT ON TABLE maintenance_order_materials IS 'Materiais usados em cada ordem';
