-- Criar tabela para histórico de inspeções
CREATE TABLE IF NOT EXISTS maintenance_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_order_id UUID NOT NULL,
    inspector_id UUID,
    inspection_date TIMESTAMP DEFAULT NOW(),
    checklist_results JSONB,
    findings TEXT,
    recommendations TEXT,
    passed BOOLEAN,
    next_inspection_date TIMESTAMP,
    photos TEXT[], -- URLs das fotos
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_maintenance_order FOREIGN KEY (maintenance_order_id) REFERENCES maintenance_orders(id) ON DELETE CASCADE
);

-- Adicionar chave estrangeira se a tabela maintenance_technicians existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_technicians') THEN
        ALTER TABLE maintenance_inspections 
        ADD CONSTRAINT fk_inspector 
        FOREIGN KEY (inspector_id) 
        REFERENCES maintenance_technicians(id);
    END IF;
END
$$;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_maintenance_inspections_date ON maintenance_inspections(inspection_date);
