-- Adiciona colunas de recorrência à tabela maintenance_templates
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS recurrence_interval_value INTEGER;

-- Adiciona uma coluna para o checklist em templates, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS checklist JSONB;

-- Adiciona uma coluna para o tipo de manutenção no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(50) DEFAULT 'preventive';

-- Adiciona uma coluna para indicar se o template é para emergência, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;

-- Adiciona uma coluna para o nível de emergência, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS emergency_level VARCHAR(50) DEFAULT 'medium';

-- Adiciona uma coluna para o custo estimado no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10, 2);

-- Adiciona uma coluna para a duração estimada no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER;

-- Adiciona uma coluna para notas no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adiciona uma coluna para o ID do hotel no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS hotel_id UUID;

-- Adiciona uma coluna para o ID do quarto no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS room_id UUID;

-- Adiciona uma coluna para o ID da categoria no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Adiciona uma coluna para o ID do técnico atribuído no template, se não existir
ALTER TABLE maintenance_templates
ADD COLUMN IF NOT EXISTS assigned_technician_id UUID;

-- Adiciona índices para as novas colunas, se não existirem
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_recurrence_type ON maintenance_templates (recurrence_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_maintenance_type ON maintenance_templates (maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_is_emergency ON maintenance_templates (is_emergency);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_hotel_id ON maintenance_templates (hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_room_id ON maintenance_templates (room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_category_id ON maintenance_templates (category_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_assigned_technician_id ON maintenance_templates (assigned_technician_id);

SELECT 'Colunas de recorrência, checklist e tipo de manutenção adicionadas à maintenance_templates, e índices verificados/adicionados.' AS status;
