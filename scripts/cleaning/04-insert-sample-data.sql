-- Inserir dados de exemplo para o módulo de limpeza

-- Primeiro, vamos verificar se já existem dados
DO $$
BEGIN
    -- Inserir pessoal de limpeza de exemplo
    IF NOT EXISTS (SELECT 1 FROM cleaning_personnel LIMIT 1) THEN
        INSERT INTO cleaning_personnel (hotel_id, name, email, phone, specialties, is_active, hourly_rate, notes) VALUES
        (
            (SELECT id FROM hotels LIMIT 1),
            'Maria Santos',
            'maria.santos@hotel.com',
            '(11) 99999-1111',
            ARRAY['Limpeza de Quartos', 'Lavanderia'],
            true,
            25.00,
            'Funcionária experiente, trabalha há 5 anos no hotel'
        ),
        (
            (SELECT id FROM hotels LIMIT 1),
            'Ana Costa',
            'ana.costa@hotel.com',
            '(11) 99999-2222',
            ARRAY['Limpeza de Quartos', 'Áreas Comuns'],
            true,
            22.50,
            'Especialista em limpeza de áreas comuns'
        ),
        (
            (SELECT id FROM hotels LIMIT 1),
            'Carla Silva',
            'carla.silva@hotel.com',
            '(11) 99999-3333',
            ARRAY['Inspeção', 'Supervisão'],
            true,
            30.00,
            'Supervisora de limpeza, responsável pela qualidade'
        ),
        (
            (SELECT id FROM hotels LIMIT 1),
            'Lucia Oliveira',
            'lucia.oliveira@hotel.com',
            '(11) 99999-4444',
            ARRAY['Limpeza de Quartos', 'Manutenção Básica'],
            true,
            24.00,
            'Também faz pequenos reparos e manutenções'
        );
        
        RAISE NOTICE 'Pessoal de limpeza inserido com sucesso';
    ELSE
        RAISE NOTICE 'Pessoal de limpeza já existe';
    END IF;

    -- Inserir tarefas de limpeza de exemplo
    IF NOT EXISTS (SELECT 1 FROM cleaning_tasks LIMIT 1) THEN
        INSERT INTO cleaning_tasks (
            hotel_id, 
            room_id, 
            title, 
            description, 
            status, 
            priority, 
            assigned_personnel_id, 
            scheduled_date,
            estimated_duration,
            checklist_items,
            notes
        ) VALUES
        (
            (SELECT id FROM hotels LIMIT 1),
            (SELECT id FROM rooms WHERE number = '101' LIMIT 1),
            'Limpeza Pós Check-out',
            'Limpeza completa após saída do hóspede',
            'pending',
            'high',
            (SELECT id FROM cleaning_personnel WHERE name = 'Maria Santos' LIMIT 1),
            now() + interval '1 hour',
            60,
            '{"trocar_roupas_cama": false, "limpar_banheiro": false, "aspirar_carpete": false, "repor_amenities": false, "verificar_minibar": false}',
            'Hóspede fez check-out às 11:00'
        ),
        (
            (SELECT id FROM hotels LIMIT 1),
            (SELECT id FROM rooms WHERE number = '102' LIMIT 1),
            'Limpeza Diária',
            'Limpeza de manutenção diária',
            'in-progress',
            'medium',
            (SELECT id FROM cleaning_personnel WHERE name = 'Ana Costa' LIMIT 1),
            now(),
            45,
            '{"trocar_toalhas": true, "limpar_banheiro": false, "organizar_quarto": false, "repor_amenities": false}',
            'Quarto ocupado - limpeza rápida'
        ),
        (
            (SELECT id FROM hotels LIMIT 1),
            (SELECT id FROM rooms WHERE number = '103' LIMIT 1),
            'Inspeção de Qualidade',
            'Verificação da qualidade da limpeza',
            'completed',
            'medium',
            (SELECT id FROM cleaning_personnel WHERE name = 'Carla Silva' LIMIT 1),
            now() - interval '2 hours',
            15,
            '{"verificar_limpeza": true, "checar_amenities": true, "testar_equipamentos": true, "verificar_manutencao": true}',
            'Inspeção aprovada - quarto pronto para ocupação'
        ),
        (
            (SELECT id FROM hotels LIMIT 1),
            NULL,
            'Limpeza do Lobby',
            'Limpeza e organização da área do lobby',
            'pending',
            'low',
            (SELECT id FROM cleaning_personnel WHERE name = 'Ana Costa' LIMIT 1),
            now() + interval '3 hours',
            90,
            '{"aspirar_carpetes": false, "limpar_moveis": false, "organizar_revistas": false, "limpar_vidros": false}',
            'Limpeza programada para o final da tarde'
        ),
        (
            (SELECT id FROM hotels LIMIT 1),
            (SELECT id FROM rooms WHERE number = '201' LIMIT 1),
            'Manutenção Preventiva',
            'Verificação e limpeza de ar condicionado',
            'pending',
            'medium',
            (SELECT id FROM cleaning_personnel WHERE name = 'Lucia Oliveira' LIMIT 1),
            now() + interval '1 day',
            120,
            '{"limpar_filtros": false, "verificar_funcionamento": false, "limpar_serpentinas": false, "testar_controles": false}',
            'Manutenção mensal programada'
        );
        
        RAISE NOTICE 'Tarefas de limpeza inseridas com sucesso';
    ELSE
        RAISE NOTICE 'Tarefas de limpeza já existem';
    END IF;

END $$;

-- Verificar os dados inseridos
SELECT 
    'Pessoal de Limpeza' as tipo,
    COUNT(*) as total
FROM cleaning_personnel
UNION ALL
SELECT 
    'Tarefas de Limpeza' as tipo,
    COUNT(*) as total
FROM cleaning_tasks;

-- Mostrar resumo das tarefas por status
SELECT 
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM cleaning_tasks), 2) as percentual
FROM cleaning_tasks
GROUP BY status
ORDER BY quantidade DESC;
