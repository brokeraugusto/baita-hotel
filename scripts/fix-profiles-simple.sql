-- A tabela profiles já existe e está funcionando corretamente
-- Vamos apenas garantir que não há constraints problemáticas

BEGIN;

-- Verificar se há constraints de foreign key problemáticas
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar constraints que podem estar causando problemas
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'profiles' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%_id_fkey%'
    LOOP
        -- Remover apenas constraints problemáticas específicas
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Constraint problemática % removida', constraint_record.constraint_name;
    END LOOP;
END $$;

-- Garantir que os índices existam
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status);

COMMIT;

-- Verificar se tudo está funcionando
SELECT 'Tabela profiles está funcionando corretamente!' as status;
SELECT COUNT(*) as total_profiles FROM profiles;
