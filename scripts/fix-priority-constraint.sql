-- Corrigir constraint de priority na tabela maintenance_orders
BEGIN;

SELECT 'INVESTIGANDO CONSTRAINT DE PRIORITY' as title;

-- Verificar a constraint atual
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conname = 'maintenance_orders_priority_check';

-- Verificar valores atuais de priority
SELECT DISTINCT priority, COUNT(*) 
FROM maintenance_orders 
GROUP BY priority;

-- Remover a constraint atual
ALTER TABLE maintenance_orders DROP CONSTRAINT IF EXISTS maintenance_orders_priority_check;

-- Criar uma nova constraint mais abrangente
ALTER TABLE maintenance_orders ADD CONSTRAINT maintenance_orders_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical'));

-- Normalizar valores de priority para o padrão
UPDATE maintenance_orders SET priority = 'high' WHERE priority = 'urgent' AND priority != 'critical';
UPDATE maintenance_orders SET priority = 'urgent' WHERE priority = 'critical';

-- Verificar a nova constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conname = 'maintenance_orders_priority_check';

COMMIT;

SELECT 'Constraint de priority corrigida com sucesso!' as status;

-- Verificar valores de priority após a correção
SELECT DISTINCT priority, COUNT(*) 
FROM maintenance_orders 
GROUP BY priority;
