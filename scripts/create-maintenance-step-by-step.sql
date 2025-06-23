-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 3: Create maintenance_categories table
CREATE TABLE IF NOT EXISTS maintenance_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true
);

-- Step 4: Create maintenance_technicians table
CREATE TABLE IF NOT EXISTS maintenance_technicians (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  notes TEXT
);

-- Step 5: Create maintenance_orders table
CREATE TABLE IF NOT EXISTS maintenance_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Relationships
  hotel_id VARCHAR(255) NOT NULL,
  room_id UUID,
  category_id UUID,
  assigned_technician_id UUID,
  
  -- Status and priority
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  
  -- Financial
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  -- Completion
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by VARCHAR(255),
  completion_notes TEXT,
  
  -- Additional fields
  urgency_reason TEXT,
  recurring BOOLEAN DEFAULT false,
  recurring_interval VARCHAR(20),
  next_occurrence TIMESTAMP WITH TIME ZONE,
  
  -- Quality control
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  quality_notes TEXT
);

-- Step 6: Create maintenance_attachments table
CREATE TABLE IF NOT EXISTS maintenance_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  maintenance_order_id UUID,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_by VARCHAR(255),
  description TEXT
);

-- Step 7: Add foreign key constraints (only if they don't exist)
DO $$
BEGIN
    -- Add foreign key for category_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'maintenance_orders_category_id_fkey'
    ) THEN
        ALTER TABLE maintenance_orders 
        ADD CONSTRAINT maintenance_orders_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key for assigned_technician_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'maintenance_orders_assigned_technician_id_fkey'
    ) THEN
        ALTER TABLE maintenance_orders 
        ADD CONSTRAINT maintenance_orders_assigned_technician_id_fkey 
        FOREIGN KEY (assigned_technician_id) REFERENCES maintenance_technicians(id) ON DELETE SET NULL;
    END IF;

    -- Add foreign key for maintenance_attachments if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'maintenance_attachments_maintenance_order_id_fkey'
    ) THEN
        ALTER TABLE maintenance_attachments 
        ADD CONSTRAINT maintenance_attachments_maintenance_order_id_fkey 
        FOREIGN KEY (maintenance_order_id) REFERENCES maintenance_orders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_room_id ON maintenance_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_assigned_technician ON maintenance_orders(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_category ON maintenance_orders(category_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_created_at ON maintenance_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_scheduled_date ON maintenance_orders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_completed_at ON maintenance_orders(completed_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_attachments_order_id ON maintenance_attachments(maintenance_order_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_technicians_active ON maintenance_technicians(is_active);
CREATE INDEX IF NOT EXISTS idx_maintenance_categories_active ON maintenance_categories(is_active);

-- Step 9: Create triggers (drop first if they exist)
DROP TRIGGER IF EXISTS update_maintenance_orders_updated_at ON maintenance_orders;
CREATE TRIGGER update_maintenance_orders_updated_at 
  BEFORE UPDATE ON maintenance_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_technicians_updated_at ON maintenance_technicians;
CREATE TRIGGER update_maintenance_technicians_updated_at 
  BEFORE UPDATE ON maintenance_technicians 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_categories_updated_at ON maintenance_categories;
CREATE TRIGGER update_maintenance_categories_updated_at 
  BEFORE UPDATE ON maintenance_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_attachments_updated_at ON maintenance_attachments;
CREATE TRIGGER update_maintenance_attachments_updated_at 
  BEFORE UPDATE ON maintenance_attachments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Insert default categories (only if table is empty)
INSERT INTO maintenance_categories (name, description, color) 
SELECT * FROM (VALUES
  ('Elétrica', 'Problemas relacionados à instalação elétrica', '#F59E0B'),
  ('Hidráulica', 'Problemas de encanamento e água', '#3B82F6'),
  ('Ar-condicionado', 'Manutenção de sistemas de climatização', '#10B981'),
  ('Mobiliário', 'Reparo e manutenção de móveis', '#8B5CF6'),
  ('Limpeza', 'Limpeza profunda e especializada', '#06B6D4'),
  ('Pintura', 'Serviços de pintura e acabamento', '#F97316'),
  ('Segurança', 'Sistemas de segurança e fechaduras', '#EF4444'),
  ('Tecnologia', 'Equipamentos eletrônicos e TV', '#6366F1'),
  ('Estrutural', 'Problemas estruturais do prédio', '#71717A'),
  ('Jardinagem', 'Manutenção de áreas verdes', '#22C55E')
) AS v(name, description, color)
WHERE NOT EXISTS (SELECT 1 FROM maintenance_categories WHERE name = v.name);

-- Step 11: Insert default technicians (only if table is empty)
INSERT INTO maintenance_technicians (name, email, phone, specialties, hourly_rate) 
SELECT * FROM (VALUES
  ('João Silva', 'joao.silva@manutencao.com', '(11) 99999-1111', ARRAY['Elétrica', 'Geral'], 45.00),
  ('Maria Santos', 'maria.santos@manutencao.com', '(11) 99999-2222', ARRAY['Elétrica', 'Tecnologia'], 50.00),
  ('Pedro Costa', 'pedro.costa@manutencao.com', '(11) 99999-3333', ARRAY['Hidráulica'], 48.00),
  ('Ana Lima', 'ana.lima@manutencao.com', '(11) 99999-4444', ARRAY['Ar-condicionado'], 55.00),
  ('Carlos Oliveira', 'carlos.oliveira@manutencao.com', '(11) 99999-5555', ARRAY['Mobiliário', 'Pintura'], 42.00),
  ('Fernanda Rocha', 'fernanda.rocha@manutencao.com', '(11) 99999-6666', ARRAY['Limpeza'], 38.00),
  ('Roberto Alves', 'roberto.alves@manutencao.com', '(11) 99999-7777', ARRAY['Segurança', 'Estrutural'], 52.00)
) AS v(name, email, phone, specialties, hourly_rate)
WHERE NOT EXISTS (SELECT 1 FROM maintenance_technicians WHERE email = v.email);

-- Success message
SELECT 'Maintenance module created successfully!' as status,
       (SELECT COUNT(*) FROM maintenance_categories) as categories_count,
       (SELECT COUNT(*) FROM maintenance_technicians) as technicians_count;
