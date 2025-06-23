-- Create maintenance_orders table
CREATE TABLE IF NOT EXISTS maintenance_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  assigned_to VARCHAR(255),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_room_id ON maintenance_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_created_at ON maintenance_orders(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_orders_updated_at 
    BEFORE UPDATE ON maintenance_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample maintenance orders
INSERT INTO maintenance_orders (hotel_id, title, description, priority, status, room_id, assigned_to, estimated_cost) VALUES
('hotel-1', 'Ar condicionado com vazamento', 'O ar condicionado do quarto 101 está vazando água no chão', 'high', 'pending', (SELECT id FROM rooms WHERE room_number = '101' AND hotel_id = 'hotel-1' LIMIT 1), 'tech-4', 150.00),
('hotel-1', 'Lâmpada queimada no banheiro', 'A lâmpada do banheiro do quarto 102 está queimada', 'low', 'in_progress', (SELECT id FROM rooms WHERE room_number = '102' AND hotel_id = 'hotel-1' LIMIT 1), 'tech-2', 25.00),
('hotel-1', 'Torneira com vazamento', 'A torneira da pia do quarto 201 está vazando', 'medium', 'pending', (SELECT id FROM rooms WHERE room_number = '201' AND hotel_id = 'hotel-1' LIMIT 1), 'tech-3', 80.00),
('hotel-1', 'Porta do armário solta', 'A porta do armário do quarto 301 está solta e precisa ser ajustada', 'low', 'completed', (SELECT id FROM rooms WHERE room_number = '301' AND hotel_id = 'hotel-1' LIMIT 1), 'tech-5', 50.00),
('hotel-1', 'TV não liga', 'A televisão do quarto 102 não está ligando', 'medium', 'pending', (SELECT id FROM rooms WHERE room_number = '102' AND hotel_id = 'hotel-1' LIMIT 1), 'tech-2', 200.00);

-- Update completed order with completion timestamp
UPDATE maintenance_orders 
SET completed_at = NOW() - INTERVAL '2 hours', actual_cost = 45.00
WHERE title = 'Porta do armário solta';
