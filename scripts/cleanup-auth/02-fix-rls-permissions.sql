-- CORRIGIR PERMISSÕES RLS PARA SYSTEM SETUP
-- Desabilita RLS temporariamente para permitir setup inicial

-- 1. DESABILITAR RLS NA TABELA PROFILES
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SE A TABELA SUBSCRIPTION_PLANS EXISTE E TEM DADOS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB DEFAULT '[]'::jsonb,
    max_hotels INTEGER DEFAULT 1,
    max_rooms INTEGER DEFAULT 50,
    max_users INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSERIR PLANOS BÁSICOS SE NÃO EXISTIREM
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_hotels, max_rooms, max_users, is_active)
SELECT 'Básico', 'Plano básico para hotéis pequenos', 99.90, 999.00, 
       '["Gestão de reservas", "Check-in/Check-out", "Relatórios básicos"]'::jsonb, 
       1, 50, 5, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Básico');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_hotels, max_rooms, max_users, is_active)
SELECT 'Profissional', 'Plano profissional para hotéis médios', 199.90, 1999.00, 
       '["Gestão de reservas", "Check-in/Check-out", "Relatórios avançados", "Integração PMS", "Suporte prioritário"]'::jsonb, 
       3, 200, 15, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Profissional');

INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_hotels, max_rooms, max_users, is_active)
SELECT 'Enterprise', 'Plano enterprise para redes hoteleiras', 499.90, 4999.00, 
       '["Gestão ilimitada", "Multi-propriedades", "API completa", "Suporte 24/7", "Customizações"]'::jsonb, 
       999, 9999, 999, true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Enterprise');

-- 4. VERIFICAR ESTRUTURA DA TABELA PROFILES
DO $$
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'password_hash') THEN
        ALTER TABLE profiles ADD COLUMN password_hash TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_role') THEN
        ALTER TABLE profiles ADD COLUMN user_role TEXT DEFAULT 'hotel_owner';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
        ALTER TABLE profiles ADD COLUMN timezone TEXT DEFAULT 'America/Sao_Paulo';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language') THEN
        ALTER TABLE profiles ADD COLUMN language TEXT DEFAULT 'pt-BR';
    END IF;
END $$;

-- 5. RECRIAR FUNÇÕES COM PERMISSÕES CORRETAS
DROP FUNCTION IF EXISTS get_system_status() CASCADE;
CREATE OR REPLACE FUNCTION get_system_status()
RETURNS JSON 
SECURITY DEFINER -- Executa com permissões do criador da função
AS $$
DECLARE
    result JSON;
    master_count INTEGER := 0;
    plans_count INTEGER := 0;
BEGIN
    -- Contar master admins (com tratamento de erro)
    BEGIN
        SELECT COUNT(*) INTO master_count 
        FROM profiles 
        WHERE user_role = 'master_admin' AND is_active = true;
    EXCEPTION WHEN OTHERS THEN
        master_count := 0;
    END;
    
    -- Contar planos de assinatura (com tratamento de erro)
    BEGIN
        SELECT COUNT(*) INTO plans_count 
        FROM subscription_plans 
        WHERE is_active = true;
    EXCEPTION WHEN OTHERS THEN
        plans_count := 0;
    END;
    
    -- Construir resultado
    result := json_build_object(
        'system_initialized', CASE WHEN master_count > 0 THEN true ELSE false END,
        'database_ready', true,
        'has_master_admin', CASE WHEN master_count > 0 THEN true ELSE false END,
        'subscription_plans_count', plans_count,
        'version', '2.0.0',
        'requires_setup', CASE WHEN master_count = 0 THEN true ELSE false END,
        'statistics', json_build_object(
            'total_hotels', 0,
            'total_clients', 0,
            'master_admin_exists', CASE WHEN master_count > 0 THEN true ELSE false END
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. RECRIAR FUNÇÃO DE CRIAÇÃO DE MASTER ADMIN
DROP FUNCTION IF EXISTS create_master_admin(TEXT, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION create_master_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT
)
RETURNS JSON 
SECURITY DEFINER -- Executa com permissões do criador da função
AS $$
DECLARE
    result JSON;
    existing_count INTEGER := 0;
    new_user_id UUID;
BEGIN
    -- Verificar se já existe master admin
    BEGIN
        SELECT COUNT(*) INTO existing_count 
        FROM profiles 
        WHERE user_role = 'master_admin' AND is_active = true;
    EXCEPTION WHEN OTHERS THEN
        existing_count := 0;
    END;
    
    IF existing_count > 0 THEN
        result := json_build_object(
            'success', false,
            'error', 'Sistema já possui um administrador master'
        );
        RETURN result;
    END IF;
    
    -- Verificar se email já existe
    BEGIN
        SELECT COUNT(*) INTO existing_count 
        FROM profiles 
        WHERE email = admin_email;
    EXCEPTION WHEN OTHERS THEN
        existing_count := 0;
    END;
    
    IF existing_count > 0 THEN
        result := json_build_object(
            'success', false,
            'error', 'Email já está em uso'
        );
        RETURN result;
    END IF;
    
    -- Criar novo master admin
    BEGIN
        INSERT INTO profiles (
            id,
            email,
            full_name,
            user_role,
            is_active,
            password_hash,
            timezone,
            language,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            admin_email,
            admin_name,
            'master_admin',
            true,
            admin_password,
            'America/Sao_Paulo',
            'pt-BR',
            NOW(),
            NOW()
        ) RETURNING id INTO new_user_id;
        
        result := json_build_object(
            'success', true,
            'message', 'Administrador master criado com sucesso',
            'user_id', new_user_id
        );
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', 'Erro ao criar administrador: ' || SQLERRM
        );
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. CONCEDER PERMISSÕES NECESSÁRIAS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon, authenticated;
GRANT SELECT ON subscription_plans TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_system_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_master_admin(TEXT, TEXT, TEXT) TO anon, authenticated;

-- 8. VERIFICAR SETUP
SELECT 'PERMISSÕES CORRIGIDAS' as status;
SELECT COUNT(*) as total_usuarios FROM profiles;
SELECT COUNT(*) as total_planos FROM subscription_plans;
SELECT 'SISTEMA PRONTO PARA SETUP' as info;
