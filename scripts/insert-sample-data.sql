-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_rooms, max_users) VALUES
('Básico', 'Plano ideal para pequenos hotéis', 99.90, 999.00, '["Até 10 quartos", "2 usuários", "Suporte por email"]', 10, 2),
('Profissional', 'Plano para hotéis de médio porte', 199.90, 1999.00, '["Até 50 quartos", "5 usuários", "Suporte prioritário", "Relatórios avançados"]', 50, 5),
('Enterprise', 'Plano para grandes redes hoteleiras', 399.90, 3999.00, '["Quartos ilimitados", "Usuários ilimitados", "Suporte 24/7", "API personalizada"]', 999, 999)
ON CONFLICT DO NOTHING;

-- Insert sample hotel profile (using a mock UUID for demonstration)
INSERT INTO profiles (id, email, full_name, user_role, hotel_name, hotel_address, subscription_status, subscription_plan) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@hotelbaita.com', 'João Silva', 'client', 'Hotel Baita', 'Rua das Flores, 123 - Centro, São Paulo - SP', 'active', 'Profissional')
ON CONFLICT (id) DO UPDATE SET
  hotel_name = EXCLUDED.hotel_name,
  hotel_address = EXCLUDED.hotel_address,
  subscription_status = EXCLUDED.subscription_status,
  subscription_plan = EXCLUDED.subscription_plan;

-- Insert sample room categories
INSERT INTO room_categories (hotel_id, name, description, base_price, max_occupancy, amenities) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Standard', 'Quarto padrão com cama de casal', 150.00, 2, '["Wi-Fi", "TV", "Ar-condicionado", "Frigobar"]'),
('550e8400-e29b-41d4-a716-446655440000', 'Deluxe', 'Quarto superior com vista para a cidade', 250.00, 2, '["Wi-Fi", "TV Smart", "Ar-condicionado", "Frigobar", "Varanda", "Cofre"]'),
('550e8400-e29b-41d4-a716-446655440000', 'Suíte', 'Suíte luxuosa com sala de estar', 400.00, 4, '["Wi-Fi", "TV Smart", "Ar-condicionado", "Frigobar", "Varanda", "Cofre", "Sala de estar", "Banheira"]')
ON CONFLICT (hotel_id, name) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, status, amenities) VALUES
('550e8400-e29b-41d4-a716-446655440000', '101', 'Standard', 2, 150.00, 'Quarto padrão no primeiro andar', 'available', '["Wi-Fi", "TV", "Ar-condicionado", "Frigobar"]'),
('550e8400-e29b-41d4-a716-446655440000', '102', 'Standard', 2, 150.00, 'Quarto padrão no primeiro andar', 'occupied', '["Wi-Fi", "TV", "Ar-condicionado", "Frigobar"]'),
('550e8400-e29b-41d4-a716-446655440000', '103', 'Deluxe', 2, 250.00, 'Quarto deluxe com vista para a cidade', 'available', '["Wi-Fi", "TV Smart", "Ar-condicionado", "Frigobar", "Varanda"]'),
('550e8400-e29b-41d4-a716-446655440000', '104', 'Deluxe', 2, 250.00, 'Quarto deluxe com vista para a cidade', 'maintenance', '["Wi-Fi", "TV Smart", "Ar-condicionado", "Frigobar", "Varanda"]'),
('550e8400-e29b-41d4-a716-446655440000', '201', 'Standard', 2, 150.00, 'Quarto padrão no segundo andar', 'cleaning', '["Wi-Fi", "TV", "Ar-condicionado", "Frigobar"]'),
('550e8400-e29b-41d4-a716-446655440000', '202', 'Deluxe', 2, 250.00, 'Quarto deluxe no segundo andar', 'available', '["Wi-Fi", "TV Smart", "Ar-condicionado", "Frigobar", "Varanda"]'),
('550e8400-e29b-41d4-a716-446655440000', '301', 'Suíte', 4, 400.00, 'Suíte luxuosa no terceiro andar', 'available', '["Wi-Fi", "TV Smart", "Ar-condicionado", "Frigobar", "Varanda", "Cofre", "Sala de estar"]'),
('550e8400-e29b-41d4-a716-446655440000', '302', 'Suíte', 4, 400.00, 'Suíte luxuosa no terceiro andar', 'occupied', '["Wi-Fi", "TV Smart", "Ar-condicionado", "Frigobar", "Varanda", "Cofre", "Sala de estar"]')
ON CONFLICT (hotel_id, room_number) DO NOTHING;

-- Insert sample guests
INSERT INTO guests (hotel_id, full_name, email, phone, document_type, document_number, nationality, vip_status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Maria Santos', 'maria.santos@email.com', '(11) 99999-1234', 'CPF', '123.456.789-01', 'Brasileira', false),
('550e8400-e29b-41d4-a716-446655440000', 'Carlos Oliveira', 'carlos.oliveira@email.com', '(11) 99999-5678', 'CPF', '987.654.321-09', 'Brasileira', true),
('550e8400-e29b-41d4-a716-446655440000', 'Ana Costa', 'ana.costa@email.com', '(11) 99999-9012', 'CPF', '456.789.123-45', 'Brasileira', false),
('550e8400-e29b-41d4-a716-446655440000', 'Pedro Lima', 'pedro.lima@email.com', '(11) 99999-3456', 'RG', '12.345.678-9', 'Brasileira', false),
('550e8400-e29b-41d4-a716-446655440000', 'Fernanda Silva', 'fernanda.silva@email.com', '(11) 99999-7890', 'CPF', '789.123.456-78', 'Brasileira', true);

-- Get room IDs for reservations
DO $$
DECLARE
    room_102_id UUID;
    room_302_id UUID;
    guest_maria_id UUID;
    guest_carlos_id UUID;
BEGIN
    -- Get room IDs
    SELECT id INTO room_102_id FROM rooms WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND room_number = '102';
    SELECT id INTO room_302_id FROM rooms WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND room_number = '302';
    
    -- Get guest IDs
    SELECT id INTO guest_maria_id FROM guests WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND full_name = 'Maria Santos';
    SELECT id INTO guest_carlos_id FROM guests WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND full_name = 'Carlos Oliveira';
    
    -- Insert sample reservations
    INSERT INTO reservations (hotel_id, room_id, guest_id, check_in_date, check_out_date, status, total_price, payment_status) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', room_102_id, guest_maria_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'confirmed', 450.00, 'paid'),
    ('550e8400-e29b-41d4-a716-446655440000', room_302_id, guest_carlos_id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 'confirmed', 1200.00, 'paid');
END $$;

-- Insert sample maintenance orders
DO $$
DECLARE
    room_104_id UUID;
BEGIN
    SELECT id INTO room_104_id FROM rooms WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND room_number = '104';
    
    INSERT INTO maintenance_orders (hotel_id, room_id, title, description, priority, status, assigned_to, estimated_cost) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', room_104_id, 'Ar condicionado com vazamento', 'O ar condicionado está vazando água no chão do quarto', 'high', 'pending', 'Ana Lima', 150.00),
    ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Lâmpada queimada no corredor', 'A lâmpada do corredor do 2º andar está queimada', 'low', 'in-progress', 'Maria Santos', 25.00),
    ('550e8400-e29b-41d4-a716-446655440000', room_104_id, 'Torneira com vazamento', 'A torneira da pia está vazando', 'medium', 'pending', 'Pedro Costa', 80.00),
    ('550e8400-e29b-41d4-a716-446655440000', NULL, 'Fechadura da porta principal', 'A fechadura está travando e dificultando a entrada', 'urgent', 'in-progress', 'João Silva', 120.00);
END $$;

-- Insert sample cleaning tasks
DO $$
DECLARE
    room_201_id UUID;
    room_103_id UUID;
BEGIN
    SELECT id INTO room_201_id FROM rooms WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND room_number = '201';
    SELECT id INTO room_103_id FROM rooms WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND room_number = '103';
    
    INSERT INTO cleaning_tasks (hotel_id, room_id, task_type, status, assigned_to, scheduled_for) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', room_201_id, 'checkout', 'in-progress', 'Equipe de Limpeza A', NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', room_103_id, 'daily', 'pending', 'Equipe de Limpeza B', NOW() + INTERVAL '2 hours');
END $$;

-- Insert sample expenses
INSERT INTO expenses (hotel_id, category, description, amount, expense_date, payment_method) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Manutenção', 'Reparo do ar condicionado quarto 104', 150.00, CURRENT_DATE, 'Cartão de Crédito'),
('550e8400-e29b-41d4-a716-446655440000', 'Limpeza', 'Produtos de limpeza', 85.50, CURRENT_DATE - INTERVAL '1 day', 'Dinheiro'),
('550e8400-e29b-41d4-a716-446655440000', 'Utilidades', 'Conta de energia elétrica', 450.00, CURRENT_DATE - INTERVAL '2 days', 'Débito Automático'),
('550e8400-e29b-41d4-a716-446655440000', 'Alimentação', 'Café da manhã - ingredientes', 320.00, CURRENT_DATE - INTERVAL '3 days', 'Cartão de Crédito');

-- Insert sample pricing rules
INSERT INTO pricing_rules (hotel_id, name, rule_type, start_date, end_date, adjustment_type, adjustment_value, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Final de Semana', 'weekday', NULL, NULL, 'percentage', 20.00, true),
('550e8400-e29b-41d4-a716-446655440000', 'Alta Temporada', 'seasonal', '2024-12-15', '2024-03-15', 'percentage', 30.00, true),
('550e8400-e29b-41d4-a716-446655440000', 'Estadia Longa', 'length_of_stay', NULL, NULL, 'percentage', -10.00, true);

-- Update pricing rule for weekends (Friday and Saturday)
UPDATE pricing_rules 
SET days_of_week = ARRAY[5, 6], min_nights = 1
WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Final de Semana';

-- Update pricing rule for long stays
UPDATE pricing_rules 
SET min_nights = 7
WHERE hotel_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Estadia Longa';
