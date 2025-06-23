-- Insert sample maintenance orders
DO $$
DECLARE
    room_101_id UUID;
    room_102_id UUID;
    room_201_id UUID;
    room_301_id UUID;
    
    cat_eletrica_id UUID;
    cat_hidraulica_id UUID;
    cat_ar_id UUID;
    cat_mobiliario_id UUID;
    cat_seguranca_id UUID;
    
    tech_joao_id UUID;
    tech_maria_id UUID;
    tech_pedro_id UUID;
    tech_ana_id UUID;
    tech_carlos_id UUID;
BEGIN
    -- Get room IDs (assuming they exist from previous scripts)
    SELECT id INTO room_101_id FROM rooms WHERE room_number = '101' LIMIT 1;
    SELECT id INTO room_102_id FROM rooms WHERE room_number = '102' LIMIT 1;
    SELECT id INTO room_201_id FROM rooms WHERE room_number = '201' LIMIT 1;
    SELECT id INTO room_301_id FROM rooms WHERE room_number = '301' LIMIT 1;
    
    -- Get category IDs
    SELECT id INTO cat_eletrica_id FROM maintenance_categories WHERE name = 'Elétrica';
    SELECT id INTO cat_hidraulica_id FROM maintenance_categories WHERE name = 'Hidráulica';
    SELECT id INTO cat_ar_id FROM maintenance_categories WHERE name = 'Ar-condicionado';
    SELECT id INTO cat_mobiliario_id FROM maintenance_categories WHERE name = 'Mobiliário';
    SELECT id INTO cat_seguranca_id FROM maintenance_categories WHERE name = 'Segurança';
    
    -- Get technician IDs
    SELECT id INTO tech_joao_id FROM maintenance_technicians WHERE name = 'João Silva';
    SELECT id INTO tech_maria_id FROM maintenance_technicians WHERE name = 'Maria Santos';
    SELECT id INTO tech_pedro_id FROM maintenance_technicians WHERE name = 'Pedro Costa';
    SELECT id INTO tech_ana_id FROM maintenance_technicians WHERE name = 'Ana Lima';
    SELECT id INTO tech_carlos_id FROM maintenance_technicians WHERE name = 'Carlos Oliveira';
    
    -- Insert maintenance orders
    INSERT INTO maintenance_orders (
        hotel_id, room_id, category_id, assigned_technician_id,
        title, description, priority, status,
        estimated_cost, scheduled_date, estimated_duration
    ) VALUES
    (
        'hotel-1', room_101_id, cat_ar_id, tech_ana_id,
        'Ar condicionado não gela',
        'O ar condicionado do quarto 101 não está gelando adequadamente. Cliente reclamou que mesmo no máximo, o ambiente não resfria.',
        'high', 'pending',
        150.00, NOW() + INTERVAL '2 hours', 120
    ),
    (
        'hotel-1', room_102_id, cat_hidraulica_id, tech_pedro_id,
        'Vazamento na torneira do banheiro',
        'Torneira da pia do banheiro está com vazamento constante. Água pingando continuamente.',
        'medium', 'in-progress',
        80.00, NOW() + INTERVAL '1 hour', 90
    ),
    (
        'hotel-1', room_201_id, cat_eletrica_id, tech_maria_id,
        'Tomada não funciona',
        'Tomada próxima à cama não está funcionando. Hóspede não consegue carregar dispositivos.',
        'medium', 'pending',
        45.00, NOW() + INTERVAL '4 hours', 60
    ),
    (
        'hotel-1', room_301_id, cat_mobiliario_id, tech_carlos_id,
        'Porta do armário solta',
        'A porta do armário está solta e fazendo ruído. Dobradiça precisa ser ajustada.',
        'low', 'completed',
        35.00, NOW() - INTERVAL '2 days', 45
    ),
    (
        'hotel-1', NULL, cat_seguranca_id, tech_joao_id,
        'Fechadura da porta principal travando',
        'A fechadura eletrônica da entrada principal está travando ocasionalmente, dificultando o acesso.',
        'urgent', 'in-progress',
        200.00, NOW() + INTERVAL '30 minutes', 180
    ),
    (
        'hotel-1', room_102_id, cat_eletrica_id, tech_maria_id,
        'Lâmpada do banheiro queimada',
        'Lâmpada LED do banheiro queimou e precisa ser substituída.',
        'low', 'completed',
        25.00, NOW() - INTERVAL '1 day', 15
    ),
    (
        'hotel-1', room_201_id, cat_ar_id, tech_ana_id,
        'Limpeza do filtro do ar condicionado',
        'Manutenção preventiva - limpeza e troca do filtro do ar condicionado.',
        'low', 'pending',
        60.00, NOW() + INTERVAL '1 day', 30
    ),
    (
        'hotel-1', NULL, cat_hidraulica_id, tech_pedro_id,
        'Pressão baixa da água no 3º andar',
        'Hóspedes do 3º andar relataram baixa pressão da água nos chuveiros.',
        'high', 'pending',
        120.00, NOW() + INTERVAL '3 hours', 150
    );
    
    -- Update completed orders with completion data
    UPDATE maintenance_orders 
    SET 
        completed_at = NOW() - INTERVAL '1 day',
        actual_cost = 30.00,
        actual_duration = 40,
        completed_by = 'Carlos Oliveira',
        completion_notes = 'Dobradiça ajustada e parafusos apertados. Problema resolvido.',
        quality_rating = 5
    WHERE title = 'Porta do armário solta';
    
    UPDATE maintenance_orders 
    SET 
        completed_at = NOW() - INTERVAL '6 hours',
        actual_cost = 25.00,
        actual_duration = 15,
        completed_by = 'Maria Santos',
        completion_notes = 'Lâmpada LED substituída. Testado e funcionando normalmente.',
        quality_rating = 5
    WHERE title = 'Lâmpada do banheiro queimada';

    -- Inserir templates de manutenção preventiva
    INSERT INTO maintenance_templates (name, description, maintenance_type, recurrence_type, estimated_duration, estimated_cost, checklist, instructions) 
    VALUES
    ('Manutenção Preventiva AC', 'Limpeza e verificação do sistema de ar condicionado', 'preventive', 'monthly', 2, 120.00, 
     '["Limpar filtros", "Verificar gás refrigerante", "Testar termostato", "Verificar drenagem"]', 
     'Realizar limpeza completa do sistema e verificar todos os componentes'),
    ('Inspeção Elétrica Mensal', 'Verificação de sistemas elétricos', 'inspection', 'monthly', 3, 200.00,
     '["Verificar quadro elétrico", "Testar disjuntores", "Verificar tomadas", "Medir voltagem"]',
     'Inspeção completa dos sistemas elétricos do andar'),
    ('Manutenção Hidráulica Preventiva', 'Verificação de tubulações e conexões', 'preventive', 'quarterly', 4, 300.00,
     '["Verificar vazamentos", "Testar pressão", "Limpar ralos", "Verificar registros"]',
     'Manutenção preventiva completa do sistema hidráulico')
    ON CONFLICT (id) DO NOTHING;

    -- Inserir materiais comuns
    INSERT INTO maintenance_materials (name, description, category, unit_price, stock_quantity, minimum_stock) 
    VALUES
    ('Filtro de Ar Split 9000 BTUs', 'Filtro para ar condicionado split', 'Ar Condicionado', 25.00, 50, 10),
    ('Lâmpada LED 12W', 'Lâmpada LED branca fria', 'Elétrica', 15.00, 100, 20),
    ('Vedante de Silicone', 'Silicone transparente para vedação', 'Hidráulica', 8.50, 30, 5),
    ('Disjuntor 20A', 'Disjuntor bipolar 20 amperes', 'Elétrica', 35.00, 20, 5),
    ('Registro de Gaveta 1/2"', 'Registro de gaveta rosqueável', 'Hidráulica', 22.00, 15, 3)
    ON CONFLICT (id) DO NOTHING;

END $$;
