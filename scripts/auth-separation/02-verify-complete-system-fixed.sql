-- Verificação completa do sistema de autenticação separado (CORRIGIDO)

DO $$
DECLARE
    master_count INTEGER;
    hotel_count INTEGER;
    admin_record RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO COMPLETA DO SISTEMA ===';
    
    -- 1. Verificar estrutura das tabelas
    RAISE NOTICE '';
    RAISE NOTICE '1. ESTRUTURA DAS TABELAS:';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        SELECT COUNT(*) INTO master_count FROM master_admins;
        RAISE NOTICE '✓ master_admins existe - % registros', master_count;
    ELSE
        RAISE NOTICE '✗ master_admins NÃO existe';
        master_count := 0;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        SELECT COUNT(*) INTO hotel_count FROM hotels;
        RAISE NOTICE '✓ hotels existe - % registros', hotel_count;
    ELSE
        RAISE NOTICE '✗ hotels NÃO existe';
        hotel_count := 0;
    END IF;
    
    -- 2. Verificar funções
    RAISE NOTICE '';
    RAISE NOTICE '2. FUNÇÕES:';
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'has_master_admin') THEN
        RAISE NOTICE '✓ has_master_admin() existe';
        RAISE NOTICE '  Resultado: %', has_master_admin();
    ELSE
        RAISE NOTICE '✗ has_master_admin() NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_first_master_admin') THEN
        RAISE NOTICE '✓ create_first_master_admin() existe';
    ELSE
        RAISE NOTICE '✗ create_first_master_admin() NÃO existe';
    END IF;
    
    -- 3. Verificar dados
    RAISE NOTICE '';
    RAISE NOTICE '3. DADOS:';
    
    IF master_count > 0 THEN
        RAISE NOTICE '✓ % Master Admin(s) cadastrado(s)', master_count;
        
        -- Mostrar detalhes dos Master Admins (CORRIGIDO)
        FOR admin_record IN 
            SELECT email, full_name, is_active, created_at 
            FROM master_admins 
        LOOP
            RAISE NOTICE '  - %: % (ativo: %)', admin_record.email, admin_record.full_name, admin_record.is_active;
        END LOOP;
    ELSE
        RAISE NOTICE '⚠️  Nenhum Master Admin cadastrado';
    END IF;
    
    -- 4. Status geral
    RAISE NOTICE '';
    RAISE NOTICE '4. STATUS GERAL:';
    
    IF master_count > 0 THEN
        RAISE NOTICE '✅ Sistema pronto para uso!';
        RAISE NOTICE '   Acesse: /master/login';
    ELSE
        RAISE NOTICE '⚠️  Execute o script 01-create-first-master-admin.sql';
    END IF;
    
END $$;

-- Mostrar estrutura das tabelas (simplificado)
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ESTRUTURA DAS TABELAS ===';
    
    -- Verificar se as tabelas existem antes de mostrar estrutura
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'MASTER_ADMINS:';
        FOR col_record IN 
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'master_admins'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (nullable: %)', col_record.column_name, col_record.data_type, col_record.is_nullable;
        END LOOP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        RAISE NOTICE '';
        RAISE NOTICE 'HOTELS:';
        FOR col_record IN 
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'hotels'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (nullable: %)', col_record.column_name, col_record.data_type, col_record.is_nullable;
        END LOOP;
    END IF;
END $$;
