-- Limpar sistema de autenticação e separar completamente
-- Master Admin vs Client (Hotels)

-- 1. Remover todos os usuários master existentes
DO $$
BEGIN
    -- Desabilitar RLS temporariamente para limpeza
    ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS hotels DISABLE ROW LEVEL SECURITY;
    
    -- Remover usuários master existentes
    DELETE FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%master%';
    DELETE FROM profiles WHERE role = 'master_admin' OR email LIKE '%admin%' OR email LIKE '%master%';
    
    RAISE NOTICE 'Usuários master removidos com sucesso';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro na limpeza: %', SQLERRM;
END $$;

-- 2. Criar tabela específica para Master Admins
DROP TABLE IF EXISTS master_admins CASCADE;

CREATE TABLE master_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 3. Criar tabela específica para Hotels (Clients)
DROP TABLE IF EXISTS hotels CASCADE;

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
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 4. Criar índices
CREATE INDEX idx_master_admins_email ON master_admins(email);
CREATE INDEX idx_master_admins_active ON master_admins(is_active);
CREATE INDEX idx_hotels_email ON hotels(email);
CREATE INDEX idx_hotels_active ON hotels(is_active);

-- 5. Criar função para verificar se existe Master Admin
CREATE OR REPLACE FUNCTION has_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM master_admins 
        WHERE is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função para criar primeiro Master Admin
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

-- 7. Desabilitar RLS para desenvolvimento
ALTER TABLE master_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;

-- 8. Verificar estrutura criada
SELECT 
    'master_admins' as table_name,
    COUNT(*) as record_count
FROM master_admins
UNION ALL
SELECT 
    'hotels' as table_name,
    COUNT(*) as record_count
FROM hotels;

-- 9. Testar função
SELECT has_master_admin() as has_admin;

RAISE NOTICE 'Sistema de autenticação separado criado com sucesso!';
RAISE NOTICE 'Execute o próximo script para criar o primeiro Master Admin';
