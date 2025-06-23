-- Inserir dados de exemplo para o módulo de limpeza

-- Primeiro, vamos buscar um hotel existente para usar como referência
DO $$
DECLARE
    sample_hotel_id UUID;
    sample_room_ids UUID[];
    personnel_id_1 UUID;
    personnel_id_2 UUID;
    personnel_id_3 UUID;
BEGIN
    -- Buscar um hotel existente ou criar um de exemplo
    SELECT id INTO sample_hotel_id FROM hotels LIMIT 1;
    
    IF sample_hotel_id IS NULL THEN
        -- Criar hotel de exemplo se não existir nenhum
        INSERT INTO hotels (name, email, phone, address, city, state, country)
        VALUES ('Hotel Exemplo', 'contato@hotelexemplo.com', '(11) 99999-9999', 
                'Rua das Flores, 123', 'São Paulo', 'SP', 'Brasil')
        RETURNING id INTO sample_hotel_id;
        
        RAISE NOTICE 'Hotel de exemplo criado: %', sample_hotel_id;
    END IF;

    -- Buscar quartos existentes ou criar alguns de exemplo
    SELECT ARRAY(SELECT id FROM rooms WHERE hotel_id = sample_hotel_id LIMIT 5) INTO sample_room_ids;
    
    IF array_length(sample_room_ids, 1) IS NULL OR array_length(sample_room_ids, 1) < 3 THEN
        -- Criar alguns quartos de exemplo
        INSERT INTO rooms (hotel_id, number, type, status, capacity, floor)
        VALUES 
            (sample_hotel_id, '101', 'Standard', 'clean', 2, 1),
            (sample_hotel_id, '102', 'Standard', 'dirty', 2, 1),
            (sample_hotel_id, '103', 'Deluxe', 'cleaning', 3, 1),
            (sample_hotel_id, '201', 'Suite', 'clean', 4, 2),
            (sample_hotel_id, '202', 'Standard', 'maintenance', 2, 2)
        ON CONFLICT (hotel_id, number) DO NOTHING;
        
        -- Atualizar array com os IDs dos quartos
        SELECT ARRAY(SELECT id FROM rooms WHERE hotel_id = sample_hotel_id LIMIT 5) INTO sample_room_ids;
        
        RAISE NOTICE 'Quartos de exemplo criados para hotel: %', sample_hotel_id;
    END IF;

    -- Inserir pessoal de limpeza de exemplo
    INSERT INTO cleaning_personnel (hotel_id, name, email, phone, specialties, is_active, hourly_rate, notes)
    VALUES 
        (sample_hotel_id, 'Maria Silva', 'maria.silva@hotel.com', '(11) 98888-1111', 
         ARRAY['Limpeza de quartos', 'Lavanderia'], true, 25.00, 'Funcionária experiente, trabalha há 5 anos'),
        (sample_hotel_id, 'João Santos', 'joao.santos@hotel.com', '(11) 98888-2222', 
         ARRAY['Limpeza pesada', 'Manutenção básica'], true, 28.00, 'Especialista em limpeza pós-obra'),
        (sample_hotel_id, 'Ana Costa', 'ana.costa@hotel.com', '(11) 98888-3333', 
         ARRAY['Limpeza de suítes', 'Organização'], true, 30.00, 'Supervisora da equipe de governança')
    ON CONFLICT (hotel_id, email) DO NOTHING
    RETURNING id INTO personnel_id_1;

    -- Buscar IDs do pessoal inserido
    SELECT id INTO personnel_id_1 FROM cleaning_personnel WHERE hotel_id = sample_hotel_id AND email = 'maria.silva@hotel.com';
    SELECT id INTO personnel_id_2 FROM cleaning_personnel WHERE hotel_id = sample_hotel_id AND email = 'joao.santos@hotel.com';
    SELECT id INTO personnel_id_3 FROM cleaning_personnel WHERE hotel_id = sample_hotel_id AND email = 'ana.costa@hotel.com';

    -- Inserir tarefas de limpeza de exemplo
    INSERT INTO cleaning_tasks (
        hotel_id, room_id, title, description, status, priority, 
        assigned_personnel_id, scheduled_date, estimated_duration, 
        checklist_items, notes, location
    )
    VALUES 
        -- Tarefas pendentes
        (sample_hotel_id, sample_room_ids[1], 'Limpeza Completa', 
         'Limpeza completa do quarto 101 após check-out', 'pending', 'high',
         personnel_id_1, NOW() + INTERVAL '1 hour', 60,
         '{"trocar_roupas_cama": false, "limpar_banheiro": false, "aspirar_carpete": false, "repor_amenities": false}',
         'Cliente VIP - atenção especial aos detalhes', 'Quarto 101'),
         
        (sample_hotel_id, sample_room_ids[2], 'Limpeza Diária', 
         'Limpeza de manutenção do quarto 102', 'pending', 'medium',
         personnel_id_2, NOW() + INTERVAL '2 hours', 45,
         '{"trocar_toalhas": false, "limpar_banheiro": false, "organizar_quarto": false}',
         'Hóspede ainda no quarto - limpeza rápida', 'Quarto 102'),

        -- Tarefas em andamento
        (sample_hotel_id, sample_room_ids[3], 'Limpeza Pós Check-out', 
         'Preparação do quarto 103 para próximo hóspede', 'in-progress', 'high',
         personnel_id_3, NOW() - INTERVAL '30 minutes', 90,
         '{"trocar_roupas_cama": true, "limpar_banheiro": true, "aspirar_carpete": false, "repor_amenities": false}',
         'Check-in previsto para 15h', 'Quarto 103'),

        -- Tarefas concluídas
        (sample_hotel_id, sample_room_ids[4], 'Inspeção de Qualidade', 
         'Inspeção final da suíte 201', 'completed', 'medium',
         personnel_id_3, NOW() - INTERVAL '2 hours', 30,
         '{"verificar_limpeza": true, "testar_equipamentos": true, "conferir_amenities": true}',
         'Inspeção aprovada - quarto liberado', 'Suíte 201'),

        -- Tarefas urgentes
        (sample_hotel_id, sample_room_ids[5], 'Limpeza de Emergência', 
         'Limpeza urgente - problema reportado pelo hóspede', 'pending', 'urgent',
         personnel_id_1, NOW() + INTERVAL '15 minutes', 30,
         '{"limpar_derramamento": false, "trocar_roupas_cama": false, "verificar_equipamentos": false}',
         'URGENTE: Vazamento no banheiro reportado', 'Quarto 202');

    -- Inserir alguns logs de mudança de status
    INSERT INTO room_status_logs (room_id, hotel_id, previous_status, new_status, notes)
    VALUES 
        (sample_room_ids[1], sample_hotel_id, 'dirty', 'clean', 'Limpeza concluída por Maria Silva'),
        (sample_room_ids[2], sample_hotel_id, 'clean', 'dirty', 'Check-out realizado'),
        (sample_room_ids[3], sample_hotel_id, 'dirty', 'cleaning', 'Limpeza iniciada por Ana Costa'),
        (sample_room_ids[5], sample_hotel_id, 'clean', 'maintenance', 'Problema no banheiro reportado');

    RAISE NOTICE 'Dados de exemplo inseridos com sucesso para o hotel: %', sample_hotel_id;
    RAISE NOTICE 'Pessoal de limpeza criado: %, %, %', personnel_id_1, personnel_id_2, personnel_id_3;
    RAISE NOTICE 'Quartos utilizados: %', sample_room_ids;

END $$;

-- Verificar os dados inseridos
SELECT 
    'Resumo dos dados de limpeza inseridos:' as info,
    (SELECT COUNT(*) FROM cleaning_personnel) as total_personnel,
    (SELECT COUNT(*) FROM cleaning_tasks) as total_tasks,
    (SELECT COUNT(*) FROM room_status_logs) as total_status_logs;

-- Mostrar distribuição de tarefas por status
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM cleaning_tasks), 2) as percentual
FROM cleaning_tasks 
GROUP BY status 
ORDER BY quantidade DESC;

-- Mostrar distribuição de quartos por status
SELECT 
    status,
    COUNT(*) as quantidade
FROM rooms 
GROUP BY status 
ORDER BY quantidade DESC;
