-- Criar tabela para templates de manutenção preventiva
CREATE TABLE IF NOT EXISTS maintenance_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID,
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
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_template_maintenance_type CHECK (maintenance_type IN ('corrective', 'preventive', 'emergency', 'inspection')),
    CONSTRAINT check_template_recurrence_type CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'))
);

-- Adicionar chave estrangeira se a tabela maintenance_categories existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_categories') THEN
        ALTER TABLE maintenance_templates 
        ADD CONSTRAINT fk_category 
        FOREIGN KEY (category_id) 
        REFERENCES maintenance_categories(id);
    END IF;
END
$$;
