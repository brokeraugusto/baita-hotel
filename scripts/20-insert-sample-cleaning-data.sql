-- Inserir dados de exemplo para cleaning_personnel
INSERT INTO cleaning_personnel (id, hotel_id, name, email, phone, specialties, is_active, hourly_rate)
VALUES
    (gen_random_uuid(), (SELECT id FROM hotels LIMIT 1), 'Maria Silva', 'maria.silva@hotel.com', '5511987654321', ARRAY['room_cleaning', 'laundry'], TRUE, 25.00),
    (gen_random_uuid(), (SELECT id FROM hotels LIMIT 1), 'João Pereira', 'joao.pereira@hotel.com', '5511987654322', ARRAY['deep_cleaning', 'carpet_care'], TRUE, 30.00),
    (gen_random_uuid(), (SELECT id FROM hotels LIMIT 1), 'Ana Costa', 'ana.costa@hotel.com', '5511987654323', ARRAY['room_inspection', 'minibar_restock'], TRUE, 28.00)
ON CONFLICT (email) DO NOTHING;

-- Inserir dados de exemplo para cleaning_tasks
INSERT INTO cleaning_tasks (
    id, created_at, updated_at, hotel_id, room_id, location, task_type, status, priority,
    assigned_personnel_id, description, scheduled_for, completed_at, notes, checklist_progress,
    estimated_duration, actual_duration, reported_by, is_recurring, recurrence_interval, next_occurrence
)
VALUES
    (
        gen_random_uuid(), now(), now(), (SELECT id FROM hotels LIMIT 1),
        (SELECT id FROM rooms WHERE number = '101' LIMIT 1), NULL,
        'post_checkout', 'pending', 'high',
        (SELECT id FROM cleaning_personnel WHERE name = 'Maria Silva' LIMIT 1),
        'Limpeza completa após check-out do quarto 101, incluindo banheiro e varanda.',
        now() + INTERVAL '1 hour', NULL, 'Hóspede saiu às 10:00.',
        '{"completed": 0, "total": 15}', 90, NULL, 'Recepção', FALSE, NULL, NULL
    ),
    (
        gen_random_uuid(), now(), now(), (SELECT id FROM hotels LIMIT 1),
        (SELECT id FROM rooms WHERE number = '203' LIMIT 1), NULL,
        'daily', 'in_progress', 'medium',
        (SELECT id FROM cleaning_personnel WHERE name = 'João Pereira' LIMIT 1),
        'Limpeza diária do quarto 203. Foco na organização e reposição de itens.',
        now() - INTERVAL '30 minutes', NULL, 'Iniciada há 30 minutos.',
        '{"completed": 5, "total": 10}', 45, 30, 'Sistema', FALSE, NULL, NULL
    ),
    (
        gen_random_uuid(), now(), now(), (SELECT id FROM hotels LIMIT 1),
        NULL, 'Lobby Principal',
        'deep_clean', 'completed', 'low',
        (SELECT id FROM cleaning_personnel WHERE name = 'Ana Costa' LIMIT 1),
        'Limpeza profunda do lobby, incluindo polimento do piso e limpeza de janelas.',
        now() - INTERVAL '2 days', now() - INTERVAL '1 day 2 hours', 'Concluída com sucesso.',
        '{"completed": 10, "total": 10}', 180, 150, 'Gerência', FALSE, NULL, NULL
    ),
    (
        gen_random_uuid(), now(), now(), (SELECT id FROM hotels LIMIT 1),
        NULL, 'Corredor 3º Andar',
        'inspection', 'pending', 'low',
        (SELECT id FROM cleaning_personnel WHERE name = 'Ana Costa' LIMIT 1),
        'Inspeção de rotina do corredor do 3º andar para identificar necessidades de limpeza ou manutenção.',
        now() + INTERVAL '4 hours', NULL, NULL,
        '{"completed": 0, "total": 5}', 30, NULL, 'Sistema', TRUE, 'weekly', now() + INTERVAL '7 days'
    )
ON CONFLICT (id) DO NOTHING;

SELECT 'Dados de exemplo para o módulo de limpeza inseridos com sucesso.' AS status;
