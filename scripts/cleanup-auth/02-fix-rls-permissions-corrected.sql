-- CORRIGIR PERMISSÕES RLS PARA SYSTEM SETUP
-- Desabilita RLS temporariamente para permitir setup inicial

-- 1. DESABILITAR RLS NA TABELA PROFILES
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR E CORRIGIR A TABELA SUBSCRIPTION_PLANS
DROP TABLE IF EXISTS subscription_plans CASCADE;
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features TEXT[] DEFAULT ARRAY[]::TEXT[], -- Corrigido para TEXT[]
    limits JSONB DEFAULT '{}'::jsonb,
    max_hotels INTEGER DEFAULT 1,
    max_rooms INTEGER DEFAULT 50,
    max_users INTEGER DEFAULT 5,
    max_integrations INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSERIR PLANOS BÁSICOS COM TIPOS CORRETOS
INSERT INTO subscription_plans (
    name, 
    slug,
    description, 
    price_monthly, 
    price_yearly, 
    features, 
    max_hotels, 
    max_rooms, 
    max_users, 
    is_active
) VALUES 
(
    'Básico', 
    'basico',
    'Plano básico para hotéis pequenos', 
    99.90, 
    999.00, 
    ARRAY['Gestão de reservas', 'Check-in/Check-out', 'Relatórios básicos'], -- Array de texto
    1, 
    50, 
    5, 
    true
),
(
    'Profissional', 
    'profissional',
    'Plano profissional para hotéis médios', 
    199.90, 
    1999.00, 
    ARRAY['Gestão de reservas', 'Check-in/Check-out', 'Relatórios avançados', 'Integração PMS', 'Suporte prioritário'], 
    3, 
    200, 
    15, 
    true
),
(
    'Enterprise', 
    'enterprise',
    'Plano enterprise para redes hoteleiras', 
    499.90, 
    4999.00, 
    ARRAY['Gestão ilimitada', 'Multi-propriedades', 'API completa', 'Suporte 24/7', 'Customizações'], 
    999, 
    9999, 
    999, 
    true
);

-- 4. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA PROFILES
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    user_role TEXT NOT NULL DEFAULT 'hotel_owner',
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    language TEXT DEFAULT 'pt-BR',
    preferences JSONB DEFAULT '{}'::jsonb,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- 6. RECRIAR FUNÇÕES COM PERMISSÕES CORRETAS
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
        'master_admin_count', master_count,
        'subscription_plans_count', plans_count,
        'version', '2.0.0',
        'requires_setup', CASE WHEN master_count = 0 THEN true ELSE false END,
        'setup_required', CASE WHEN master_count = 0 THEN true ELSE false END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. RECRIAR FUNÇÃO DE CRIAÇÃO DE MASTER ADMIN
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
            is_email_verified,
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
            'user_id', new_user_id::TEXT
        );
        
        RAISE NOTICE 'Master admin criado: % (ID: %)', admin_email, new_user_id;
        
    EXCEPTION WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', 'Erro ao criar administrador: ' || SQLERRM
        );
        RAISE NOTICE 'Erro ao criar master admin: %', SQLERRM;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. CONCEDER PERMISSÕES NECESSÁRIAS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON profiles TO anon, authenticated;
GRANT ALL PRIVILEGES ON subscription_plans TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_system_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_master_admin(TEXT, TEXT, TEXT) TO anon, authenticated;

-- 9. VERIFICAR SETUP FINAL
DO $$
BEGIN
    RAISE NOTICE '=== SISTEMA LIMPO E CONFIGURADO ===';
    RAISE NOTICE 'Tabela profiles: % registros', (SELECT COUNT(*) FROM profiles);
    RAISE NOTICE 'Tabela subscription_plans: % registros', (SELECT COUNT(*) FROM subscription_plans);
    RAISE NOTICE 'Master admins existentes: %', (SELECT COUNT(*) FROM profiles WHERE user_role = 'master_admin');
    RAISE NOTICE '=== PRONTO PARA USAR /system-setup ===';
END $$;

-- 10. TESTE RÁPIDO DAS FUNÇÕES
SELECT 'TESTANDO get_system_status()' as teste;
SELECT get_system_status() as status_resultado;

SELECT 'SISTEMA PRONTO PARA SETUP' as info;
