-- Script simples para criar as tabelas básicas primeiro
-- Execute este script ANTES de qualquer outro

-- Remover tabelas se existirem (para recomeçar limpo)
DROP TABLE IF EXISTS master_admins CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;

-- Remover funções se existirem
DROP FUNCTION IF EXISTS has_master_admin() CASCADE;
DROP FUNCTION IF EXISTS create_first_master_admin(VARCHAR, VARCHAR, VARCHAR) CASCADE;

-- 1. CRIAR TABELA MASTER_ADMINS
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

-- 2. CRIAR TABELA HOTELS
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

-- 3. CRIAR ÍNDICES
CREATE INDEX idx_master_admins_email ON master_admins(email);
CREATE INDEX idx_master_admins_active ON master_admins(is_active);
CREATE INDEX idx_hotels_email ON hotels(email);
CREATE INDEX idx_hotels_active ON hotels(is_active);

-- 4. DESABILITAR RLS (para desenvolvimento)
ALTER TABLE master_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;

-- 5. CONCEDER PERMISSÕES
GRANT ALL ON master_admins TO anon, authenticated, service_role;
GRANT ALL ON hotels TO anon, authenticated, service_role;

-- 6. INSERIR PRIMEIRO MASTER ADMIN
INSERT INTO master_admins (email, full_name, password_hash) 
VALUES (
    'admin@baitahotel.com',
    'Master Administrator',
    'MasterAdmin2024!'
);

-- 7. VERIFICAÇÃO
SELECT 
    'master_admins' as table_name,
    COUNT(*) as record_count,
    string_agg(email, ', ') as emails
FROM master_admins
UNION ALL
SELECT 
    'hotels' as table_name,
    COUNT(*) as record_count,
    string_agg(email, ', ') as emails
FROM hotels;

-- Mostrar o resultado
SELECT 
    id,
    email,
    full_name,
    is_active,
    created_at
FROM master_admins;
