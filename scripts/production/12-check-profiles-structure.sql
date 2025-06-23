-- Verificar estrutura atual da tabela profiles
-- Este script mostra todas as colunas e tipos de dados

DO $$
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO ESTRUTURA DA TABELA PROFILES';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '';
END $$;

-- Mostrar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
DO $$
DECLARE
    table_exists boolean;
    column_count integer;
BEGIN
    -- Verificar se a tabela existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ Tabela profiles existe!';
        
        -- Contar colunas
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles';
        
        RAISE NOTICE '📊 Total de colunas: %', column_count;
        RAISE NOTICE '';
        
        -- Verificar colunas específicas
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_role') THEN
            RAISE NOTICE '✅ Coluna user_role existe';
        ELSE
            RAISE NOTICE '❌ Coluna user_role NÃO existe';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
            RAISE NOTICE '✅ Coluna role existe';
        ELSE
            RAISE NOTICE '❌ Coluna role NÃO existe';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
            RAISE NOTICE '✅ Coluna full_name existe';
        ELSE
            RAISE NOTICE '❌ Coluna full_name NÃO existe';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'hotel_name') THEN
            RAISE NOTICE '✅ Coluna hotel_name existe';
        ELSE
            RAISE NOTICE '❌ Coluna hotel_name NÃO existe';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Tabela profiles NÃO existe!';
        RAISE NOTICE '🔧 Precisa executar o script de criação do schema primeiro';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMO PASSO:';
    RAISE NOTICE 'Execute o script 13-fix-profiles-table.sql para corrigir';
    
END $$;
