-- Recreate maintenance module from scratch

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create maintenance_categories table
CREATE TABLE maintenance_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true
);

-- Create maintenance_technicians table
CREATE TABLE maintenance_technicians (
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

-- Create maintenance_orders table
CREATE TABLE maintenance_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Relationships
  hotel_id VARCHAR(255) NOT NULL,
  room_number VARCHAR(50),
  category_id UUID REFERENCES maintenance_categories(id) ON DELETE SET NULL,
  assigned_technician_id UUID REFERENCES maintenance_technicians(id) ON DELETE SET NULL,
  
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

-- Create maintenance_attachments table
CREATE TABLE maintenance_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  maintenance_order_id UUID REFERENCES maintenance_orders(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_by VARCHAR(255),
  description TEXT
);

-- Create indexes
CREATE INDEX idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX idx_maintenance_orders_assigned_technician ON maintenance_orders(assigned_technician_id);
CREATE INDEX idx_maintenance_orders_category ON maintenance_orders(category_id);
CREATE INDEX idx_maintenance_orders_created_at ON maintenance_orders(created_at);
CREATE INDEX idx_maintenance_orders_scheduled_date ON maintenance_orders(scheduled_date);

CREATE INDEX idx_maintenance_attachments_order_id ON maintenance_attachments(maintenance_order_id);
CREATE INDEX idx_maintenance_technicians_active ON maintenance_technicians(is_active);
CREATE INDEX idx_maintenance_categories_active ON maintenance_categories(is_active);

-- Create triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_orders_updated_at') THEN
        CREATE TRIGGER update_maintenance_orders_updated_at 
          BEFORE UPDATE ON maintenance_orders 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_technicians_updated_at') THEN
        CREATE TRIGGER update_maintenance_technicians_updated_at 
          BEFORE UPDATE ON maintenance_technicians 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_categories_updated_at') THEN
        CREATE TRIGGER update_maintenance_categories_updated_at 
          BEFORE UPDATE ON maintenance_categories 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_attachments_updated_at') THEN
        CREATE TRIGGER update_maintenance_attachments_updated_at 
          BEFORE UPDATE ON maintenance_attachments 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert default categories
INSERT INTO maintenance_categories (name, description, color) VALUES
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
ON CONFLICT (name) DO NOTHING;

-- Insert default technicians
INSERT INTO maintenance_technicians (name, email, phone, specialties, hourly_rate) VALUES
('João Silva', 'joao.silva@manutencao.com', '(11) 99999-1111', ARRAY['Elétrica', 'Geral'], 45.00),
('Maria Santos', 'maria.santos@manutencao.com', '(11) 99999-2222', ARRAY['Elétrica', 'Tecnologia'], 50.00),
('Pedro Costa', 'pedro.costa@manutencao.com', '(11) 99999-3333', ARRAY['Hidráulica'], 48.00),
('Ana Lima', 'ana.lima@manutencao.com', '(11) 99999-4444', ARRAY['Ar-condicionado'], 55.00),
('Carlos Oliveira', 'carlos.oliveira@manutencao.com', '(11) 99999-5555', ARRAY['Mobiliário', 'Pintura'], 42.00)
ON CONFLICT (email) DO NOTHING;

SELECT 'Maintenance module recreated successfully' as status;
