-- Corrigir constraint de status na tabela maintenance_orders
BEGIN;

SELECT 'INVESTIGANDO CONSTRAINT DE STATUS' as title;

-- Verificar a constraint atual
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conname = 'maintenance_orders_status_check';

-- Verificar valores atuais de status
SELECT DISTINCT status, COUNT(*) 
FROM maintenance_orders 
GROUP BY status;

-- Remover a constraint atual
ALTER TABLE maintenance_orders DROP CONSTRAINT IF EXISTS maintenance_orders_status_check;

-- Criar uma nova constraint mais abrangente
ALTER TABLE maintenance_orders ADD CONSTRAINT maintenance_orders_status_check 
CHECK (status IN ('pending', 'in_progress', 'in-progress', 'completed', 'cancelled', 'canceled', 'on_hold', 'on-hold'));

-- Normalizar valores de status para o padrão
UPDATE maintenance_orders SET status = 'in_progress' WHERE status = 'in-progress';
UPDATE maintenance_orders SET status = 'cancelled' WHERE status = 'canceled';
UPDATE maintenance_orders SET status = 'on_hold' WHERE status = 'on-hold';

-- Verificar a nova constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conname = 'maintenance_orders_status_check';

COMMIT;

SELECT 'Constraint de status corrigida com sucesso!' as status;

-- Verificar valores de status após a correção
SELECT DISTINCT status, COUNT(*) 
FROM maintenance_orders 
GROUP BY status;
