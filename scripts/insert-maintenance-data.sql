-- Inserir dados de exemplo para manutenção
INSERT INTO maintenance_categories (name, description, color) VALUES
('Elétrica', 'Problemas relacionados ao sistema elétrico', '#F59E0B'),
('Hidráulica', 'Problemas relacionados ao sistema hidráulico', '#3B82F6'),
('Ar-condicionado', 'Manutenção de sistemas de climatização', '#10B981'),
('Mobiliário', 'Reparos em móveis e decoração', '#8B5CF6'),
('Segurança', 'Sistemas de segurança e fechaduras', '#EF4444'),
('Limpeza', 'Serviços especiais de limpeza', '#06B6D4'),
('Pintura', 'Serviços de pintura e acabamento', '#F97316'),
('Jardinagem', 'Manutenção de áreas verdes', '#22C55E')
ON CONFLICT (name) DO NOTHING;

INSERT INTO maintenance_technicians (name, email, phone, specialties) VALUES
('João Silva', 'joao@hotel.com', '(11) 99999-1111', ARRAY['Elétrica', 'Segurança']),
('Maria Santos', 'maria@hotel.com', '(11) 99999-2222', ARRAY['Elétrica', 'Ar-condicionado']),
('Pedro Costa', 'pedro@hotel.com', '(11) 99999-3333', ARRAY['Hidráulica', 'Limpeza']),
('Ana Lima', 'ana@hotel.com', '(11) 99999-4444', ARRAY['Ar-condicionado', 'Mobiliário']),
('Carlos Oliveira', 'carlos@hotel.com', '(11) 99999-5555', ARRAY['Mobiliário', 'Pintura']);

-- Inserir algumas ordens de exemplo
INSERT INTO maintenance_orders (
    hotel_id, room_id, category_id, assigned_technician_id, 
    title, description, priority, status, estimated_cost, maintenance_type
) 
SELECT 
    'hotel-1',
    r.id,
    c.id,
    t.id,
    'Reparo no ar-condicionado',
    'Ar-condicionado não está resfriando adequadamente no quarto ' || r.room_number,
    'high',
    'pending',
    250.00,
    'corrective'
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '101' 
AND c.name = 'Ar-condicionado'
AND t.name = 'Maria Santos'
LIMIT 1;

INSERT INTO maintenance_orders (
    hotel_id, room_id, category_id, assigned_technician_id, 
    title, description, priority, status, estimated_cost, maintenance_type, is_emergency, emergency_level
) 
SELECT 
    'hotel-1',
    r.id,
    c.id,
    t.id,
    'Vazamento urgente',
    'Vazamento de água no banheiro do quarto ' || r.room_number,
    'urgent',
    'in_progress',
    180.00,
    'emergency',
    true,
    'high'
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '201' 
AND c.name = 'Hidráulica'
AND t.name = 'Pedro Costa'
LIMIT 1;

-- Verificar inserção
SELECT 'Dados de manutenção inseridos com sucesso!' as status;
SELECT COUNT(*) as total_categories FROM maintenance_categories;
SELECT COUNT(*) as total_technicians FROM maintenance_technicians;
SELECT COUNT(*) as total_orders FROM maintenance_orders;
