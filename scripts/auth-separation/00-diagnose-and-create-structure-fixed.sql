-- Diagnóstico completo e criação da estrutura de autenticação separada (CORRIGIDO)

-- 1. DIAGNÓSTICO INICIAL
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO DO SISTEMA ===';
    
    -- Verificar se as tabelas existem
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        RAISE NOTICE '✓ Tabela master_admins existe';
    ELSE
        RAISE NOTICE '✗ Tabela master_admins NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        RAISE NOTICE '✓ Tabela hotels existe';
    ELSE
        RAISE NOTICE '✗ Tabela hotels NÃO existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '✓ Tabela profiles existe';
    ELSE
        RAISE NOTICE '✗ Tabela profiles NÃO existe';
    END IF;
END $$;

-- 2. LIMPEZA SEGURA
DO $$
BEGIN
    RAISE NOTICE '=== INICIANDO LIMPEZA ===';
    
    -- Desabilitar RLS antes de remover
    ALTER TABLE IF EXISTS master_admins DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS hotels DISABLE ROW LEVEL SECURITY;
    
    -- Remover políticas RLS se existirem
    DROP POLICY IF EXISTS "master_admins_policy" ON master_admins;
    DROP POLICY IF EXISTS "hotels_policy" ON hotels;
    
    -- Remover tabelas se existirem
    DROP TABLE IF EXISTS master_admins CASCADE;
    DROP TABLE IF EXISTS hotels CASCADE;
    
    -- Remover funções se existirem
    DROP FUNCTION IF EXISTS has_master_admin() CASCADE;
    DROP FUNCTION IF EXISTS create_first_master_admin(VARCHAR, VARCHAR, VARCHAR) CASCADE;
    
    RAISE NOTICE '✓ Limpeza concluída';
END $$;

-- 3. CRIAR ESTRUTURA COMPLETA
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

-- Criar índices
CREATE INDEX idx_master_admins_email ON master_admins(email);
CREATE INDEX idx_master_admins_active ON master_admins(is_active);
CREATE INDEX idx_hotels_email ON hotels(email);
CREATE INDEX idx_hotels_active ON hotels(is_active);

-- 4. CRIAR FUNÇÕES
CREATE OR REPLACE FUNCTION has_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM master_admins 
        WHERE is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 5. DESABILITAR RLS PARA DESENVOLVIMENTO
ALTER TABLE master_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;

-- 6. VERIFICAÇÃO FINAL
DO $$
DECLARE
    master_count INTEGER;
    hotel_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Verificar tabelas criadas
    SELECT COUNT(*) INTO master_count FROM master_admins;
    SELECT COUNT(*) INTO hotel_count FROM hotels;
    
    RAISE NOTICE 'Master Admins: % registros', master_count;
    RAISE NOTICE 'Hotels: % registros', hotel_count;
    
    -- Testar função
    RAISE NOTICE 'Has Master Admin: %', has_master_admin();
    
    RAISE NOTICE '✅ Estrutura criada com sucesso!';
END $$;
