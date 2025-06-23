-- Criar índices para performance nas tabelas de manutenção
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_type ON maintenance_orders(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_emergency ON maintenance_orders(is_emergency);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_recurrence ON maintenance_orders(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_maintenance_templates_type ON maintenance_templates(maintenance_type);
