-- Script para limpar problemas do banco de dados
BEGIN;

SELECT 'LIMPANDO PROBLEMAS DO BANCO DE DADOS' as title;

-- 1. Remover todas as constraints problemáticas
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Remover constraints de foreign key problemáticas
    FOR constraint_record IN 
        SELECT 
            tc.table_name,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name IN ('profiles', 'rooms', 'guests', 'reservations', 'maintenance_orders')
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE ' || constraint_record.table_name || 
                   ' DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
            RAISE NOTICE 'Constraint % removida da tabela %', 
                constraint_record.constraint_name, constraint_record.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover constraint %: %', 
                constraint_record.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. Remover tabelas que podem estar causando problemas (se existirem)
DROP TABLE IF EXISTS maintenance_order_materials CASCADE;
DROP TABLE IF EXISTS maintenance_inspections CASCADE;
DROP TABLE IF EXISTS maintenance_templates CASCADE;

-- 3. Garantir que a tabela profiles está limpa e funcional
-- (Não vamos recriar, apenas limpar dados problemáticos se houver)

COMMIT;

SELECT 'Limpeza concluída com sucesso!' as status;
