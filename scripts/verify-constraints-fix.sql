-- Verificar se as constraints foram corrigidas
BEGIN;

SELECT 'VERIFICANDO CONSTRAINTS' as title;

-- Listar todas as constraints da tabela
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conrelid = 'maintenance_orders'::regclass;

-- Verificar valores distintos nas colunas com constraints
SELECT 'STATUS VALUES:' as column_name;
SELECT DISTINCT status FROM maintenance_orders ORDER BY status;

SELECT 'PRIORITY VALUES:' as column_name;
SELECT DISTINCT priority FROM maintenance_orders ORDER BY priority;

-- Verificar se há algum valor que violaria as constraints
SELECT 'POTENTIAL VIOLATIONS:' as title;

SELECT 'Status violations:' as check_type;
SELECT id, status FROM maintenance_orders 
WHERE status NOT IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');

SELECT 'Priority violations:' as check_type;
SELECT id, priority FROM maintenance_orders 
WHERE priority NOT IN ('low', 'medium', 'high', 'urgent', 'critical');

-- Verificar se podemos inserir valores válidos
SELECT 'TESTING VALID INSERTS:' as title;

-- Tentar inserir com rollback para não afetar os dados
SAVEPOINT sp1;

INSERT INTO maintenance_orders (
    hotel_id, title, description, priority, status, created_at, updated_at
) VALUES (
    'test-hotel', 'Test Valid Insert', 'Testing valid values', 'medium', 'pending', NOW(), NOW()
);

SELECT 'Valid insert succeeded' as result;

ROLLBACK TO SAVEPOINT sp1;

COMMIT;

SELECT 'Verificação de constraints concluída!' as status;
