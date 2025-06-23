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
    maintenance_order_id UUID NOT NULL,
    material_id UUID NOT NULL,
    quantity_used INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_maintenance_order FOREIGN KEY (maintenance_order_id) REFERENCES maintenance_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_material FOREIGN KEY (material_id) REFERENCES maintenance_materials(id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_maintenance_order_materials_order ON maintenance_order_materials(maintenance_order_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_order_materials_material ON maintenance_order_materials(material_id);
