-- Corrigir todas as constraints na tabela maintenance_orders
BEGIN;

SELECT 'CORRIGINDO TODAS AS CONSTRAINTS' as title;

-- 1. Corrigir constraint de status
ALTER TABLE maintenance_orders DROP CONSTRAINT IF EXISTS maintenance_orders_status_check;
ALTER TABLE maintenance_orders ADD CONSTRAINT maintenance_orders_status_check 
CHECK (status IN ('pending', 'in_progress', 'in-progress', 'completed', 'cancelled', 'canceled', 'on_hold', 'on-hold'));

-- 2. Corrigir constraint de priority
ALTER TABLE maintenance_orders DROP CONSTRAINT IF EXISTS maintenance_orders_priority_check;
ALTER TABLE maintenance_orders ADD CONSTRAINT maintenance_orders_priority_check 
CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical'));

-- 3. Corrigir constraint de emergency_level se existir
ALTER TABLE maintenance_orders DROP CONSTRAINT IF EXISTS maintenance_orders_emergency_level_check;
ALTER TABLE maintenance_orders ADD CONSTRAINT maintenance_orders_emergency_level_check 
CHECK (emergency_level IS NULL OR emergency_level IN ('1', '2', '3', '4', '5', 1, 2, 3, 4, 5));

-- 4. Corrigir constraint de quality_rating se existir
ALTER TABLE maintenance_orders DROP CONSTRAINT IF EXISTS maintenance_orders_quality_rating_check;
ALTER TABLE maintenance_orders ADD CONSTRAINT maintenance_orders_quality_rating_check 
CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5));

-- 5. Normalizar valores para o padrão
UPDATE maintenance_orders SET status = 'in_progress' WHERE status = 'in-progress';
UPDATE maintenance_orders SET status = 'cancelled' WHERE status = 'canceled';
UPDATE maintenance_orders SET status = 'on_hold' WHERE status = 'on-hold';

-- 6. Verificar todas as constraints
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conrelid = 'maintenance_orders'::regclass;

COMMIT;

SELECT 'Todas as constraints corrigidas com sucesso!' as status;

-- Verificar valores após a correção
SELECT 'VALORES ATUAIS:' as title;
SELECT DISTINCT status, COUNT(*) FROM maintenance_orders GROUP BY status;
SELECT DISTINCT priority, COUNT(*) FROM maintenance_orders GROUP BY priority;
