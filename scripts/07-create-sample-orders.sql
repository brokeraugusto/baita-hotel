-- Criar ordens de manutenção de exemplo
BEGIN;

SELECT 'CRIANDO ORDENS DE MANUTENÇÃO DE EXEMPLO' as title;

-- Função para gerar número de ordem único
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'OS' || TO_CHAR(NOW(), 'YYYYMM') || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (SELECT 1 FROM maintenance_orders WHERE order_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Não foi possível gerar número de ordem único';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 1. Ordem corretiva - Ar-condicionado com problema
INSERT INTO maintenance_orders (
    hotel_id, order_number, room_id, category_id, assigned_technician_id,
    title, description, priority, status, maintenance_type,
    estimated_cost, estimated_duration, scheduled_date
)
SELECT 
    'hotel-1',
    generate_order_number(),
    r.id,
    c.id,
    t.id,
    'Ar-condicionado não resfria adequadamente',
    'O ar-condicionado do quarto ' || r.room_number || ' não está resfriando adequadamente. Cliente relatou que mesmo no máximo, a temperatura não baixa.',
    'high',
    'pending',
    'corrective',
    250.00,
    120,
    NOW() + INTERVAL '2 hours'
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '201' 
AND c.name = 'Ar-condicionado'
AND t.name = 'Maria Santos'
LIMIT 1;

-- 2. Emergência - Vazamento urgente
INSERT INTO maintenance_orders (
    hotel_id, order_number, room_id, category_id, assigned_technician_id,
    title, description, priority, status, maintenance_type,
    is_emergency, emergency_level, estimated_cost, estimated_duration
)
SELECT 
    'hotel-1',
    generate_order_number(),
    r.id,
    c.id,
    t.id,
    'Vazamento de água no banheiro',
    'Vazamento significativo de água no banheiro do quarto ' || r.room_number || '. Água está se espalhando pelo piso e pode causar danos estruturais.',
    'urgent',
    'in_progress',
    'emergency',
    true,
    'high',
    180.00,
    90
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '102' 
AND c.name = 'Hidráulica'
AND t.name = 'Pedro Costa'
LIMIT 1;

-- 3. Manutenção preventiva - Limpeza de filtros
INSERT INTO maintenance_orders (
    hotel_id, order_number, room_id, category_id, assigned_technician_id,
    title, description, priority, status, maintenance_type,
    estimated_cost, estimated_duration, scheduled_date, recurrence_type, next_occurrence
)
SELECT 
    'hotel-1',
    generate_order_number(),
    r.id,
    c.id,
    t.id,
    'Limpeza preventiva de filtros - Ar-condicionado',
    'Limpeza mensal dos filtros do ar-condicionado do quarto ' || r.room_number || ' conforme cronograma de manutenção preventiva.',
    'medium',
    'pending',
    'preventive',
    50.00,
    30,
    NOW() + INTERVAL '1 day',
    'monthly',
    NOW() + INTERVAL '1 month'
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '301' 
AND c.name = 'Ar-condicionado'
AND t.name = 'Ana Lima'
LIMIT 1;

-- 4. Inspeção - Verificação elétrica
INSERT INTO maintenance_orders (
    hotel_id, order_number, room_id, category_id, assigned_technician_id,
    title, description, priority, status, maintenance_type,
    estimated_cost, estimated_duration, scheduled_date,
    inspection_checklist
)
SELECT 
    'hotel-1',
    generate_order_number(),
    r.id,
    c.id,
    t.id,
    'Inspeção elétrica mensal',
    'Inspeção de rotina do sistema elétrico do quarto ' || r.room_number || ' incluindo tomadas, interruptores e iluminação.',
    'low',
    'pending',
    'inspection',
    80.00,
    60,
    NOW() + INTERVAL '3 days',
    '["Verificar quadro elétrico", "Testar disjuntores", "Verificar tomadas", "Testar iluminação", "Verificar fios expostos", "Medir voltagem"]'::jsonb
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '103' 
AND c.name = 'Elétrica'
AND t.name = 'João Silva'
LIMIT 1;

-- 5. Ordem concluída - Para demonstrar histórico
INSERT INTO maintenance_orders (
    hotel_id, order_number, room_id, category_id, assigned_technician_id,
    title, description, priority, status, maintenance_type,
    estimated_cost, actual_cost, estimated_duration, actual_duration,
    started_at, completed_at, completed_by, completion_notes, quality_rating
)
SELECT 
    'hotel-1',
    generate_order_number(),
    r.id,
    c.id,
    t.id,
    'Troca de lâmpadas queimadas',
    'Substituição de 3 lâmpadas queimadas no quarto ' || r.room_number || '.',
    'medium',
    'completed',
    'corrective',
    45.00,
    47.70,
    45,
    40,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '40 minutes',
    'João Silva',
    'Lâmpadas substituídas com sucesso. Testado funcionamento de todos os pontos de luz. Cliente satisfeito.',
    5
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '101' 
AND c.name = 'Elétrica'
AND t.name = 'João Silva'
LIMIT 1;

-- 6. Ordem de mobiliário
INSERT INTO maintenance_orders (
    hotel_id, order_number, room_id, category_id, assigned_technician_id,
    title, description, priority, status, maintenance_type,
    estimated_cost, estimated_duration, scheduled_date
)
SELECT 
    'hotel-1',
    generate_order_number(),
    r.id,
    c.id,
    t.id,
    'Reparo em gaveta da cômoda',
    'Gaveta da cômoda do quarto ' || r.room_number || ' está com dificuldade para abrir e fechar. Necessário ajuste dos trilhos.',
    'low',
    'pending',
    'corrective',
    35.00,
    60,
    NOW() + INTERVAL '1 week'
FROM rooms r
CROSS JOIN maintenance_categories c
CROSS JOIN maintenance_technicians t
WHERE r.room_number = '202' 
AND c.name = 'Mobiliário'
AND t.name = 'Carlos Oliveira'
LIMIT 1;

-- Remover função temporária
DROP FUNCTION IF EXISTS generate_order_number();

COMMIT;

SELECT 'Ordens de manutenção de exemplo criadas com sucesso!' as status;
