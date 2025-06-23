-- Adicionar novos campos à tabela de ordens de manutenção
ALTER TABLE maintenance_orders 
ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(50) DEFAULT 'corrective',
ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS next_occurrence TIMESTAMP,
ADD COLUMN IF NOT EXISTS parent_order_id UUID,
ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emergency_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS inspection_checklist JSONB,
ADD COLUMN IF NOT EXISTS inspection_results JSONB,
ADD COLUMN IF NOT EXISTS preventive_schedule JSONB;

-- Adicionar restrições após a criação dos campos
ALTER TABLE maintenance_orders 
ADD CONSTRAINT check_maintenance_type CHECK (maintenance_type IN ('corrective', 'preventive', 'emergency', 'inspection')),
ADD CONSTRAINT check_recurrence_type CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
ADD CONSTRAINT check_emergency_level CHECK (emergency_level IN ('low', 'medium', 'high', 'critical')),
ADD CONSTRAINT fk_parent_order FOREIGN KEY (parent_order_id) REFERENCES maintenance_orders(id);
