-- Corrigir permissões e RLS para o sistema de autenticação separado

-- 1. DIAGNÓSTICO DE PERMISSÕES
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO DE PERMISSÕES ===';
    
    -- Verificar se as tabelas existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        RAISE NOTICE '✓ Tabela master_admins existe';
        
        -- Verificar RLS
        IF EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace 
            WHERE c.relname = 'master_admins' AND c.relrowsecurity = true
        ) THEN
            RAISE NOTICE '⚠️  RLS está HABILITADO na tabela master_admins';
        ELSE
            RAISE NOTICE '✓ RLS está DESABILITADO na tabela master_admins';
        END IF;
    ELSE
        RAISE NOTICE '✗ Tabela master_admins NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        RAISE NOTICE '✓ Tabela hotels existe';
        
        -- Verificar RLS
        IF EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace 
            WHERE c.relname = 'hotels' AND c.relrowsecurity = true
        ) THEN
            RAISE NOTICE '⚠️  RLS está HABILITADO na tabela hotels';
        ELSE
            RAISE NOTICE '✓ RLS está DESABILITADO na tabela hotels';
        END IF;
    ELSE
        RAISE NOTICE '✗ Tabela hotels NÃO existe';
    END IF;
END $$;

-- 2. DESABILITAR RLS COMPLETAMENTE
DO $$
BEGIN
    RAISE NOTICE '=== DESABILITANDO RLS ===';
    
    -- Desabilitar RLS nas tabelas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        ALTER TABLE master_admins DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ RLS desabilitado para master_admins';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ RLS desabilitado para hotels';
    END IF;
END $$;

-- 3. REMOVER TODAS AS POLÍTICAS RLS
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '=== REMOVENDO POLÍTICAS RLS ===';
    
    -- Remover políticas da tabela master_admins
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'master_admins'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON master_admins', policy_record.policyname);
        RAISE NOTICE '✓ Política % removida de master_admins', policy_record.policyname;
    END LOOP;
    
    -- Remover políticas da tabela hotels
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'hotels'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON hotels', policy_record.policyname);
        RAISE NOTICE '✓ Política % removida de hotels', policy_record.policyname;
    END LOOP;
END $$;

-- 4. CONCEDER PERMISSÕES COMPLETAS PARA DESENVOLVIMENTO
DO $$
BEGIN
    RAISE NOTICE '=== CONCEDENDO PERMISSÕES ===';
    
    -- Conceder permissões para anon (usuário anônimo do Supabase)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        GRANT ALL ON master_admins TO anon;
        GRANT ALL ON master_admins TO authenticated;
        GRANT ALL ON master_admins TO service_role;
        RAISE NOTICE '✓ Permissões concedidas para master_admins';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        GRANT ALL ON hotels TO anon;
        GRANT ALL ON hotels TO authenticated;
        GRANT ALL ON hotels TO service_role;
        RAISE NOTICE '✓ Permissões concedidas para hotels';
    END IF;
    
    -- Conceder permissões nas funções
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'has_master_admin') THEN
        GRANT EXECUTE ON FUNCTION has_master_admin() TO anon;
        GRANT EXECUTE ON FUNCTION has_master_admin() TO authenticated;
        GRANT EXECUTE ON FUNCTION has_master_admin() TO service_role;
        RAISE NOTICE '✓ Permissões concedidas para has_master_admin()';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_first_master_admin') THEN
        GRANT EXECUTE ON FUNCTION create_first_master_admin(VARCHAR, VARCHAR, VARCHAR) TO anon;
        GRANT EXECUTE ON FUNCTION create_first_master_admin(VARCHAR, VARCHAR, VARCHAR) TO authenticated;
        GRANT EXECUTE ON FUNCTION create_first_master_admin(VARCHAR, VARCHAR, VARCHAR) TO service_role;
        RAISE NOTICE '✓ Permissões concedidas para create_first_master_admin()';
    END IF;
END $$;

-- 5. VERIFICAÇÃO FINAL
DO $$
DECLARE
    master_count INTEGER := 0;
    hotel_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Testar acesso às tabelas
    BEGIN
        SELECT COUNT(*) INTO master_count FROM master_admins;
        RAISE NOTICE '✓ Acesso à master_admins: % registros', master_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Erro ao acessar master_admins: %', SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO hotel_count FROM hotels;
        RAISE NOTICE '✓ Acesso à hotels: % registros', hotel_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Erro ao acessar hotels: %', SQLERRM;
    END;
    
    -- Testar funções
    BEGIN
        RAISE NOTICE '✓ has_master_admin(): %', has_master_admin();
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Erro ao executar has_master_admin(): %', SQLERRM;
    END;
    
    RAISE NOTICE '✅ Verificação de permissões concluída!';
END $$;
