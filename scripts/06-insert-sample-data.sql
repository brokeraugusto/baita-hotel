-- Inserir dados de exemplo completos
BEGIN;

SELECT 'INSERINDO DADOS DE EXEMPLO COMPLETOS' as title;

-- 1. Inserir perfis de usuário
INSERT INTO profiles (
    email, full_name, user_role, hotel_name, hotel_address, 
    subscription_status, subscription_plan, subscription_end_date
) VALUES 
(
    'admin@baitahotel.com',
    'Master Administrator',
    'master_admin',
    'Baita Hotel Platform',
    'São Paulo, SP',
    'active',
    'master',
    '2025-12-31 23:59:59'::timestamp
),
(
    'hotel@exemplo.com',
    'João Silva',
    'client',
    'Hotel Exemplo',
    'Rua das Flores, 123 - São Paulo, SP',
    'active',
    'professional',
    '2024-12-31 23:59:59'::timestamp
),
(
    'pousada@teste.com',
    'Maria Santos',
    'client',
    'Pousada Teste',
    'Av. Principal, 456 - Rio de Janeiro, RJ',
    'trial',
    'basic',
    '2024-07-31 23:59:59'::timestamp
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    hotel_name = EXCLUDED.hotel_name,
    hotel_address = EXCLUDED.hotel_address,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    subscription_end_date = EXCLUDED.subscription_end_date,
    updated_at = NOW();

-- 2. Inserir quartos
INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, status, floor_number, area_sqm) VALUES
('hotel-1', '101', 'Standard', 2, 150.00, 'Quarto padrão com cama de casal', 'available', 1, 25.0),
('hotel-1', '102', 'Standard', 2, 150.00, 'Quarto padrão com duas camas de solteiro', 'available', 1, 25.0),
('hotel-1', '103', 'Standard', 3, 170.00, 'Quarto padrão triplo', 'available', 1, 30.0),
('hotel-1', '201', 'Deluxe', 2, 220.00, 'Quarto deluxe com vista para o mar', 'available', 2, 35.0),
('hotel-1', '202', 'Deluxe', 2, 220.00, 'Quarto deluxe com varanda', 'available', 2, 35.0),
('hotel-1', '203', 'Deluxe', 4, 280.00, 'Quarto deluxe familiar', 'available', 2, 45.0),
('hotel-1', '301', 'Suite', 2, 350.00, 'Suíte master com jacuzzi', 'available', 3, 55.0),
('hotel-1', '302', 'Suite', 4, 450.00, 'Suíte presidencial', 'available', 3, 75.0)
ON CONFLICT (hotel_id, room_number) DO UPDATE SET
    room_type = EXCLUDED.room_type,
    capacity = EXCLUDED.capacity,
    price_per_night = EXCLUDED.price_per_night,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    floor_number = EXCLUDED.floor_number,
    area_sqm = EXCLUDED.area_sqm,
    updated_at = NOW();

-- 3. Inserir categorias de manutenção
INSERT INTO maintenance_categories (name, description, color, icon, sort_order) VALUES
('Elétrica', 'Problemas relacionados ao sistema elétrico', '#F59E0B', 'zap', 1),
('Hidráulica', 'Problemas relacionados ao sistema hidráulico', '#3B82F6', 'droplets', 2),
('Ar-condicionado', 'Manutenção de sistemas de climatização', '#10B981', 'wind', 3),
('Mobiliário', 'Reparos em móveis e decoração', '#8B5CF6', 'sofa', 4),
('Segurança', 'Sistemas de segurança e fechaduras', '#EF4444', 'shield', 5),
('Limpeza', 'Serviços especiais de limpeza', '#06B6D4', 'spray-can', 6),
('Pintura', 'Serviços de pintura e acabamento', '#F97316', 'paint-brush', 7),
('Jardinagem', 'Manutenção de áreas verdes', '#22C55E', 'trees', 8),
('Tecnologia', 'Equipamentos de TI e telecomunicações', '#6366F1', 'monitor', 9),
('Estrutural', 'Reparos estruturais e construção', '#78716C', 'hammer', 10)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- 4. Inserir técnicos
INSERT INTO maintenance_technicians (name, email, phone, employee_id, specialties, hourly_rate, hire_date) VALUES
('João Silva', 'joao.silva@hotel.com', '(11) 99999-1111', 'TECH001', ARRAY['Elétrica', 'Segurança'], 45.00, '2023-01-15'),
('Maria Santos', 'maria.santos@hotel.com', '(11) 99999-2222', 'TECH002', ARRAY['Elétrica', 'Ar-condicionado'], 50.00, '2023-02-01'),
('Pedro Costa', 'pedro.costa@hotel.com', '(11) 99999-3333', 'TECH003', ARRAY['Hidráulica', 'Limpeza'], 42.00, '2023-03-10'),
('Ana Lima', 'ana.lima@hotel.com', '(11) 99999-4444', 'TECH004', ARRAY['Ar-condicionado', 'Mobiliário'], 48.00, '2023-04-05'),
('Carlos Oliveira', 'carlos.oliveira@hotel.com', '(11) 99999-5555', 'TECH005', ARRAY['Mobiliário', 'Pintura'], 40.00, '2023-05-20'),
('Fernanda Rocha', 'fernanda.rocha@hotel.com', '(11) 99999-6666', 'TECH006', ARRAY['Tecnologia', 'Segurança'], 55.00, '2023-06-15'),
('Roberto Mendes', 'roberto.mendes@hotel.com', '(11) 99999-7777', 'TECH007', ARRAY['Estrutural', 'Jardinagem'], 38.00, '2023-07-01');

-- 5. Inserir materiais
INSERT INTO maintenance_materials (name, description, category, unit, unit_price, stock_quantity, minimum_stock, supplier_name) VALUES
('Lâmpada LED 9W', 'Lâmpada LED branca 9W bivolt', 'Elétrica', 'unidade', 15.90, 50, 10, 'Elétrica Total'),
('Filtro de Ar Split', 'Filtro para ar condicionado split 12000 BTUs', 'Ar-condicionado', 'unidade', 25.00, 20, 5, 'Clima Frio'),
('Torneira Monocomando', 'Torneira monocomando para pia', 'Hidráulica', 'unidade', 89.90, 8, 2, 'Hidráulica Pro'),
('Tinta Acrílica Branca', 'Tinta acrílica premium branca 18L', 'Pintura', 'galão', 120.00, 15, 3, 'Tintas & Cores'),
('Fechadura Digital', 'Fechadura digital com cartão', 'Segurança', 'unidade', 350.00, 5, 1, 'Segurança Max'),
('Cabo de Rede Cat6', 'Cabo de rede categoria 6 - metro', 'Tecnologia', 'metro', 3.50, 100, 20, 'Tech Solutions'),
('Vaso Sanitário', 'Vaso sanitário com caixa acoplada', 'Hidráulica', 'unidade', 280.00, 3, 1, 'Hidráulica Pro'),
('Interruptor Simples', 'Interruptor simples 10A', 'Elétrica', 'unidade', 8.50, 30, 5, 'Elétrica Total');

-- 6. Inserir templates de manutenção
INSERT INTO maintenance_templates (name, description, category_id, maintenance_type, estimated_duration, estimated_cost, recurrence_type, checklist, instructions) 
SELECT 
    'Limpeza de Filtros de Ar-condicionado',
    'Limpeza preventiva dos filtros de ar-condicionado',
    c.id,
    'preventive',
    30,
    50.00,
    'monthly',
    '["Desligar o equipamento", "Remover filtros", "Lavar com água e sabão neutro", "Secar completamente", "Reinstalar filtros", "Testar funcionamento"]'::jsonb,
    'Sempre desligar o equipamento antes de iniciar. Usar apenas sabão neutro para limpeza.'
FROM maintenance_categories c WHERE c.name = 'Ar-condicionado'
UNION ALL
SELECT 
    'Inspeção Elétrica Mensal',
    'Verificação geral do sistema elétrico',
    c.id,
    'inspection',
    60,
    80.00,
    'monthly',
    '["Verificar quadro elétrico", "Testar disjuntores", "Verificar tomadas", "Testar iluminação", "Verificar fios expostos", "Medir voltagem"]'::jsonb,
    'Usar equipamentos de proteção individual. Verificar se não há sobrecarga nos circuitos.'
FROM maintenance_categories c WHERE c.name = 'Elétrica'
UNION ALL
SELECT 
    'Verificação Hidráulica Trimestral',
    'Inspeção preventiva do sistema hidráulico',
    c.id,
    'preventive',
    90,
    120.00,
    'quarterly',
    '["Verificar vazamentos", "Testar pressão da água", "Verificar registros", "Limpar ralos", "Verificar aquecedor", "Testar descargas"]'::jsonb,
    'Verificar se há sinais de umidade nas paredes. Testar todos os pontos de água.'
FROM maintenance_categories c WHERE c.name = 'Hidráulica';

COMMIT;

SELECT 'Dados de exemplo inseridos com sucesso!' as status;
