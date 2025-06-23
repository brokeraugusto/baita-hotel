-- Criar ordens de manutenção de exemplo
BEGIN;

SELECT 'CRIANDO ORDENS DE MANUTENÇÃO DE EXEMPLO' as title;

-- Obter IDs necessários
DO $$
DECLARE
    cat_eletrica UUID;
    cat_hidraulica UUID;
    cat_ar_condicionado UUID;
    cat_emergencia UUID;
    tec_carlos UUID;
    tec_joao UUID;
    tec_maria UUID;
    room_102 UUID;
    room_201 UUID;
    room_301 UUID;
BEGIN
    -- Buscar categorias
    SELECT id INTO cat_eletrica FROM maintenance_categories WHERE name = 'Elétrica';
    SELECT id INTO cat_hidraulica FROM maintenance_categories WHERE name = 'Hidráulica';
    SELECT id INTO cat_ar_condicionado FROM maintenance_categories WHERE name = 'Ar Condicionado';
    SELECT id INTO cat_emergencia FROM maintenance_categories WHERE name = 'Emergência';
    
    -- Buscar técnicos
    SELECT id INTO tec_carlos FROM maintenance_technicians WHERE name = 'Carlos Silva';
    SELECT id INTO tec_joao FROM maintenance_technicians WHERE name = 'João Santos';
    SELECT id INTO tec_maria FROM maintenance_technicians WHERE name = 'Maria Oliveira';
    
    -- Buscar quartos (se existirem)
    SELECT id INTO room_102 FROM rooms WHERE room_number = '102' LIMIT 1;
    SELECT id INTO room_201 FROM rooms WHERE room_number = '201' LIMIT 1;
    SELECT id INTO room_301 FROM rooms WHERE room_number = '301' LIMIT 1;
    
    -- Inserir ordens de manutenção
    INSERT INTO maintenance_orders (
        hotel_id, order_number, room_id, category_id, assigned_technician_id,
        title, description, priority, status, maintenance_type, is_emergency,
        estimated_cost, scheduled_date, created_at
    ) VALUES
    (
        'hotel-1', 
        'MNT' || TO_CHAR(NOW(), 'YYMMDD') || '001',
        room_102,
        cat_eletrica,
        tec_carlos,
        'Lâmpada queimada no banheiro',
        'A lâmpada do banheiro do quarto 102 está queimada e precisa ser substituída por uma LED.',
        'low',
        'pending',
        'corrective',
        FALSE,
        25.00,
        NOW() + INTERVAL '1 day',
        NOW() - INTERVAL '2 hours'
    ),
    (
        'hotel-1',
        'MNT' || TO_CHAR(NOW(), 'YYMMDD') || '002',
        room_201,
        cat_hidraulica,
        tec_joao,
        'Vazamento na torneira da pia',
        'A torneira da pia do quarto 201 está com vazamento constante. Necessário trocar o vedante ou a torneira.',
        'medium',
        'in_progress',
        'corrective',
        FALSE,
        80.00,
        NOW(),
        NOW() - INTERVAL '4 hours'
    ),
    (
        'hotel-1',
        'MNT' || TO_CHAR(NOW(), 'YYMMDD') || '003',
        room_301,
        cat_ar_condicionado,
        tec_joao,
        'Ar condicionado não resfria',
        'O ar condicionado do quarto 301 está ligando mas não está resfriando adequadamente. Possível problema no gás.',
        'high',
        'pending',
        'corrective',
        FALSE,
        150.00,
        NOW() + INTERVAL '2 hours',
        NOW() - INTERVAL '1 hour'
    ),
    (
        'hotel-1',
        'MNT' || TO_CHAR(NOW(), 'YYMMDD') || '004',
        NULL,
        cat_emergencia,
        tec_maria,
        'Falta de energia no 2º andar',
        'Falta de energia elétrica em todo o segundo andar. Disjuntor geral desarmado. EMERGÊNCIA!',
        'urgent',
        'completed',
        'emergency',
        TRUE,
        200.00,
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '8 hours'
    ),
    (
        'hotel-1',
        'MNT' || TO_CHAR(NOW(), 'YYMMDD') || '005',
        room_102,
        cat_ar_condicionado,
        NULL,
        'Manutenção preventiva AC - Quarto 102',
        'Limpeza preventiva mensal do ar condicionado conforme cronograma de manutenção.',
        'medium',
        'pending',
        'preventive',
        FALSE,
        80.00,
        NOW() + INTERVAL '3 days',
        NOW() - INTERVAL '30 minutes'
    ),
    (
        'hotel-1',
        'MNT' || TO_CHAR(NOW(), 'YYMMDD') || '006',
        room_201,
        cat_eletrica,
        tec_carlos,
        'Inspeção elétrica mensal',
        'Inspeção de rotina das instalações elétricas do quarto 201.',
        'low',
        'completed',
        'inspection',
        FALSE,
        50.00,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '2 days'
    );
    
    -- Atualizar ordem completada com dados de conclusão
    UPDATE maintenance_orders 
    SET 
        started_at = NOW() - INTERVAL '7 hours',
        completed_at = NOW() - INTERVAL '6 hours',
        actual_cost = 180.00,
        actual_duration = 60,
        completed_by = 'Maria Oliveira',
        completion_notes = 'Problema resolvido. Disjuntor religado após verificação da sobrecarga.'
    WHERE title = 'Falta de energia no 2º andar';
    
    UPDATE maintenance_orders 
    SET 
        started_at = NOW() - INTERVAL '25 hours',
        completed_at = NOW() - INTERVAL '24 hours',
        actual_cost = 45.00,
        actual_duration = 30,
        completed_by = 'Carlos Silva',
        completion_notes = 'Inspeção concluída. Todas as instalações elétricas estão funcionando normalmente.'
    WHERE title = 'Inspeção elétrica mensal';
    
    -- Atualizar ordem em progresso
    UPDATE maintenance_orders 
    SET started_at = NOW() - INTERVAL '2 hours'
    WHERE title = 'Vazamento na torneira da pia';
    
END $$;

COMMIT;

SELECT 'Ordens de manutenção criadas com sucesso!' as status;

-- Verificar ordens criadas
SELECT 'ORDENS DE MANUTENÇÃO CRIADAS:' as title;
SELECT 
    order_number,
    title,
    priority,
    status,
    maintenance_type,
    is_emergency,
    estimated_cost,
    created_at
FROM maintenance_orders 
ORDER BY created_at DESC;
