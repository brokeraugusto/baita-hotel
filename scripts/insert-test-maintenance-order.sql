-- Inserir uma ordem de teste para verificar se as constraints estão funcionando
BEGIN;

SELECT 'INSERINDO ORDEM DE TESTE' as title;

-- Inserir uma ordem com status 'pending'
INSERT INTO maintenance_orders (
    hotel_id,
    title,
    description,
    priority,
    status,
    room_id,
    created_at,
    updated_at
) VALUES (
    'hotel-1',
    'Teste de Constraint - Ar condicionado com problema',
    'Teste para verificar se as constraints estão funcionando corretamente',
    'high',
    'pending',
    NULL,
    NOW(),
    NOW()
);

-- Inserir uma ordem com status 'in_progress'
INSERT INTO maintenance_orders (
    hotel_id,
    title,
    description,
    priority,
    status,
    room_id,
    created_at,
    updated_at
) VALUES (
    'hotel-1',
    'Teste de Constraint - Vazamento no banheiro',
    'Teste para verificar se as constraints estão funcionando corretamente',
    'urgent',
    'in_progress',
    NULL,
    NOW(),
    NOW()
);

-- Verificar se as inserções foram bem-sucedidas
SELECT id, title, status, priority
FROM maintenance_orders
WHERE title LIKE 'Teste de Constraint%'
ORDER BY created_at DESC
LIMIT 2;

COMMIT;

SELECT 'Ordens de teste inseridas com sucesso!' as status;
