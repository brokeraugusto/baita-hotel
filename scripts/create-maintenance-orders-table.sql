-- Create maintenance_orders table
CREATE TABLE IF NOT EXISTS maintenance_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  room_id UUID,
  assigned_to VARCHAR(255),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  estimated_completion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_room_id ON maintenance_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_created_at ON maintenance_orders(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_orders_updated_at 
    BEFORE UPDATE ON maintenance_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_maintenance_orders_updated_at();

-- Insert sample maintenance orders
INSERT INTO maintenance_orders (hotel_id, title, description, priority, status, assigned_to, estimated_cost) VALUES
('hotel-1', 'Ar condicionado com vazamento', 'O ar condicionado está vazando água no chão do quarto', 'high', 'pending', 'Ana Lima', 150.00),
('hotel-1', 'Lâmpada queimada no banheiro', 'A lâmpada do banheiro está queimada', 'low', 'in-progress', 'Maria Santos', 25.00),
('hotel-1', 'Torneira com vazamento', 'A torneira da pia está vazando', 'medium', 'pending', 'Pedro Costa', 80.00),
('hotel-1', 'Porta do armário solta', 'A porta do armário está solta e precisa ser ajustada', 'low', 'completed', 'Carlos Oliveira', 50.00),
('hotel-1', 'TV não liga', 'A televisão não está ligando', 'medium', 'pending', 'Maria Santos', 200.00),
('hotel-1', 'Fechadura da porta com problema', 'A fechadura está travando e dificultando a entrada', 'urgent', 'in-progress', 'João Silva', 120.00),
('hotel-1', 'Chuveiro com baixa pressão', 'O chuveiro está com muito pouca pressão de água', 'medium', 'pending', 'Pedro Costa', 90.00),
('hotel-1', 'Cortina blackout rasgada', 'A cortina blackout tem um rasgo grande', 'low', 'pending', 'Carlos Oliveira', 60.00);

-- Update completed orders with completion timestamp
UPDATE maintenance_orders 
SET completed_at = NOW() - INTERVAL '2 hours', actual_cost = 45.00
WHERE status = 'completed';
