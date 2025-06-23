-- Atualizar dados para compatibilidade com o serviço
BEGIN;

SELECT 'ATUALIZANDO DADOS PARA COMPATIBILIDADE' as title;

-- Atualizar ordens existentes com dados padrão
UPDATE maintenance_orders SET
    reported_by = 'Sistema',
    location = CASE 
        WHEN room_id IS NOT NULL THEN 'Quarto'
        ELSE 'Área Comum'
    END
WHERE reported_by IS NULL;

-- Atualizar status para usar underscore (compatível com o enum)
UPDATE maintenance_orders SET status = 'in_progress' WHERE status = 'in-progress';
UPDATE maintenance_orders SET status = 'on_hold' WHERE status = 'on-hold';

-- Gerar números de ordem únicos se não existirem
UPDATE maintenance_orders 
SET order_number = 'MNT' || TO_CHAR(created_at, 'YYMMDD') || LPAD(EXTRACT(EPOCH FROM created_at)::TEXT, 6, '0')
WHERE order_number IS NULL;

-- Atualizar assigned_to com dados de assigned_technician_id
UPDATE maintenance_orders 
SET assigned_to = assigned_technician_id 
WHERE assigned_to IS NULL AND assigned_technician_id IS NOT NULL;

COMMIT;

SELECT 'Dados atualizados para compatibilidade!' as status;

-- Verificar dados atualizados
SELECT 'VERIFICAÇÃO DOS DADOS ATUALIZADOS:' as title;
SELECT 
    order_number,
    title,
    status,
    priority,
    assigned_to,
    reported_by,
    location,
    created_at
FROM maintenance_orders 
ORDER BY created_at DESC
LIMIT 10;
