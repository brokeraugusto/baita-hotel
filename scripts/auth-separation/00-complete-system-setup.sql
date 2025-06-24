-- Setup completo do sistema de autenticação Master Admin
-- Este script cria toda a estrutura necessária do zero

-- 1. DIAGNÓSTICO INICIAL
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO INICIAL DO SISTEMA ===';
    RAISE NOTICE 'Verificando estrutura existente...';
    
    -- Verificar se as tabelas existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins' AND table_schema = 'public') THEN
        RAISE NOTICE '✓ Tabela master_admins já existe';
    ELSE
        RAISE NOTICE '✗ Tabela master_admins NÃO existe - será criada';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels' AND table_schema = 'public') THEN
        RAISE NOTICE '✓ Tabela hotels já existe';
    ELSE
        RAISE NOTICE '✗ Tabela hotels NÃO existe - será criada';
    END IF;
    
    -- Verificar funções
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'has_master_admin' AND routine_schema = 'public') THEN
        RAISE NOTICE '✓ Função has_master_admin já existe';
    ELSE
        RAISE NOTICE '✗ Função has_master_admin NÃO existe - será criada';
    END IF;
END $$;

-- 2. LIMPEZA SEGURA (apenas se necessário)
DO $$
BEGIN
    RAISE NOTICE '=== LIMPEZA SEGURA ===';
    
    -- Desabilitar RLS se as tabelas existirem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        ALTER TABLE master_admins DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ RLS desabilitado para master_admins';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✓ RLS desabilitado para hotels';
    END IF;
    
    -- Remover políticas RLS se existirem
    DROP POLICY IF EXISTS "master_admins_policy" ON master_admins;
    DROP POLICY IF EXISTS "hotels_policy" ON hotels;
    
    RAISE NOTICE '✓ Limpeza concluída';
END $$;

-- 3. CRIAR TABELA MASTER_ADMINS
DO $$
BEGIN
    RAISE NOTICE '=== CRIANDO TABELA MASTER_ADMINS ===';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins' AND table_schema = 'public') THEN
        CREATE TABLE master_admins (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login_at TIMESTAMP WITH TIME ZONE,
            
            CONSTRAINT master_admins_email_check 
            CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
        );
        
        RAISE NOTICE '✓ Tabela master_admins criada';
    ELSE
        RAISE NOTICE '✓ Tabela master_admins já existe';
    END IF;
END $$;

-- 4. CRIAR TABELA HOTELS
DO $$
BEGIN
    RAISE NOTICE '=== CRIANDO TABELA HOTELS ===';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels' AND table_schema = 'public') THEN
        CREATE TABLE hotels (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            hotel_name VARCHAR(255) NOT NULL,
            contact_name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(50),
            country VARCHAR(50) DEFAULT 'Brasil',
            subscription_plan VARCHAR(50) DEFAULT 'basic',
            subscription_status VARCHAR(20) DEFAULT 'active',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login_at TIMESTAMP WITH TIME ZONE,
            
            CONSTRAINT hotels_email_check 
            CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
        );
        
        RAISE NOTICE '✓ Tabela hotels criada';
    ELSE
        RAISE NOTICE '✓ Tabela hotels já existe';
    END IF;
END $$;

-- 5. CRIAR ÍNDICES
DO $$
BEGIN
    RAISE NOTICE '=== CRIANDO ÍNDICES ===';
    
    -- Índices para master_admins
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_master_admins_email') THEN
        CREATE INDEX idx_master_admins_email ON master_admins(email);
        RAISE NOTICE '✓ Índice idx_master_admins_email criado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_master_admins_active') THEN
        CREATE INDEX idx_master_admins_active ON master_admins(is_active);
        RAISE NOTICE '✓ Índice idx_master_admins_active criado';
    END IF;
    
    -- Índices para hotels
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hotels_email') THEN
        CREATE INDEX idx_hotels_email ON hotels(email);
        RAISE NOTICE '✓ Índice idx_hotels_email criado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_hotels_active') THEN
        CREATE INDEX idx_hotels_active ON hotels(is_active);
        RAISE NOTICE '✓ Índice idx_hotels_active criado';
    END IF;
END $$;

-- 6. CRIAR FUNÇÕES
DO $$
BEGIN
    RAISE NOTICE '=== CRIANDO FUNÇÕES ===';
END $$;

-- Função para verificar se existe Master Admin
CREATE OR REPLACE FUNCTION has_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM master_admins 
        WHERE is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar o primeiro Master Admin
CREATE OR REPLACE FUNCTION create_first_master_admin(
    p_email VARCHAR(255),
    p_full_name VARCHAR(255),
    p_password VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    new_admin master_admins%ROWTYPE;
BEGIN
    -- Verificar se já existe Master Admin
    IF has_master_admin() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Já existe um Master Admin cadastrado'
        );
    END IF;

    -- Inserir novo Master Admin
    INSERT INTO master_admins (email, full_name, password_hash)
    VALUES (LOWER(TRIM(p_email)), p_full_name, p_password)
    RETURNING * INTO new_admin;

    RETURN json_build_object(
        'success', true,
        'message', 'Master Admin criado com sucesso',
        'admin', json_build_object(
            'id', new_admin.id,
            'email', new_admin.email,
            'full_name', new_admin.full_name,
            'created_at', new_admin.created_at
        )
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Email já está em uso'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CONFIGURAR PERMISSÕES
DO $$
BEGIN
    RAISE NOTICE '=== CONFIGURANDO PERMISSÕES ===';
    
    -- Desabilitar RLS para desenvolvimento
    ALTER TABLE master_admins DISABLE ROW LEVEL SECURITY;
    ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
    
    -- Conceder permissões completas
    GRANT ALL ON master_admins TO anon, authenticated, service_role;
    GRANT ALL ON hotels TO anon, authenticated, service_role;
    
    -- Permissões nas funções
    GRANT EXECUTE ON FUNCTION has_master_admin() TO anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION create_first_master_admin(VARCHAR, VARCHAR, VARCHAR) TO anon, authenticated, service_role;
    
    RAISE NOTICE '✓ Permissões configuradas';
END $$;

-- 8. CRIAR PRIMEIRO MASTER ADMIN (se não existir)
DO $$
DECLARE
    admin_result JSON;
BEGIN
    RAISE NOTICE '=== CRIANDO PRIMEIRO MASTER ADMIN ===';
    
    -- Verificar se já existe
    IF NOT has_master_admin() THEN
        SELECT create_first_master_admin(
            'admin@baitahotel.com',
            'Master Administrator',
            'MasterAdmin2024!'
        ) INTO admin_result;
        
        RAISE NOTICE 'Resultado da criação: %', admin_result;
    ELSE
        RAISE NOTICE '✓ Master Admin já existe';
    END IF;
END $$;

-- 9. VERIFICAÇÃO FINAL
DO $$
DECLARE
    master_count INTEGER := 0;
    hotel_count INTEGER := 0;
    admin_record RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Contar registros
    SELECT COUNT(*) INTO master_count FROM master_admins;
    SELECT COUNT(*) INTO hotel_count FROM hotels;
    
    RAISE NOTICE 'Master Admins: % registros', master_count;
    RAISE NOTICE 'Hotels: % registros', hotel_count;
    
    -- Mostrar detalhes dos Master Admins
    IF master_count > 0 THEN
        RAISE NOTICE 'Detalhes dos Master Admins:';
        FOR admin_record IN 
            SELECT id, email, full_name, is_active, created_at 
            FROM master_admins 
            ORDER BY created_at
        LOOP
            RAISE NOTICE '  - ID: %, Email: %, Nome: %, Ativo: %', 
                admin_record.id, admin_record.email, admin_record.full_name, admin_record.is_active;
        END LOOP;
    END IF;
    
    -- Testar funções
    RAISE NOTICE 'Has Master Admin: %', has_master_admin();
    
    -- Testar acesso direto
    BEGIN
        PERFORM * FROM master_admins LIMIT 1;
        RAISE NOTICE '✓ Acesso à tabela master_admins: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✗ Erro ao acessar master_admins: %', SQLERRM;
    END;
    
    RAISE NOTICE '✅ SETUP COMPLETO! Sistema pronto para uso.';
    RAISE NOTICE '';
    RAISE NOTICE 'Credenciais padrão:';
    RAISE NOTICE '  Email: admin@baitahotel.com';
    RAISE NOTICE '  Senha: MasterAdmin2024!';
END $$;
