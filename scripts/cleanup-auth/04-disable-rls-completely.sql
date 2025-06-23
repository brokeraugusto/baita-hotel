-- DESABILITAR COMPLETAMENTE RLS E GARANTIR ACESSO TOTAL
-- Este script remove todas as restrições de segurança para permitir o setup inicial

-- 1. DESABILITAR RLS EM TODAS AS TABELAS EXISTENTES
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Desabilitar RLS em todas as tabelas do schema public
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_record.tablename);
        RAISE NOTICE 'RLS desabilitado para tabela: %', table_record.tablename;
    END LOOP;
END $$;

-- 2. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
        RAISE NOTICE 'Política removida: % da tabela %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- 3. RECRIAR TABELA PROFILES SEM RLS
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

-- 4. RECRIAR TABELA SUBSCRIPTION_PLANS SEM RLS
DROP TABLE IF EXISTS subscription_plans CASCADE;
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
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

-- 5. INSERIR PLANOS BÁSICOS
INSERT INTO subscription_plans (
    name, slug, description, price_monthly, price_yearly, features, 
    max_hotels, max_rooms, max_users, is_active
) VALUES 
('Básico', 'basico', 'Plano básico para hotéis pequenos', 99.90, 999.00, 
 ARRAY['Gestão de reservas', 'Check-in/Check-out', 'Relatórios básicos'], 
 1, 50, 5, true),
('Profissional', 'profissional', 'Plano profissional para hotéis médios', 199.90, 1999.00, 
 ARRAY['Gestão de reservas', 'Check-in/Check-out', 'Relatórios avançados', 'Integração PMS'], 
 3, 200, 15, true),
('Enterprise', 'enterprise', 'Plano enterprise para redes hoteleiras', 499.90, 4999.00, 
 ARRAY['Gestão ilimitada', 'Multi-propriedades', 'API completa', 'Suporte 24/7'], 
 999, 9999, 999, true);

-- 6. CONCEDER PERMISSÕES TOTAIS PARA TODOS OS ROLES
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Permissões específicas para as tabelas
GRANT ALL ON profiles TO anon, authenticated, service_role;
GRANT ALL ON subscription_plans TO anon, authenticated, service_role;

-- Permissões para sequências (se existirem)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 7. RECRIAR FUNÇÕES SEM SECURITY DEFINER (mais permissivo)
DROP FUNCTION IF EXISTS get_system_status() CASCADE;
CREATE OR REPLACE FUNCTION get_system_status()
RETURNS JSON 
AS $$
DECLARE
    result JSON;
    master_count INTEGER := 0;
    plans_count INTEGER := 0;
BEGIN
    -- Contar master admins
    SELECT COUNT(*) INTO master_count 
    FROM profiles 
    WHERE user_role = 'master_admin' AND is_active = true;
    
    -- Contar planos
    SELECT COUNT(*) INTO plans_count 
    FROM subscription_plans 
    WHERE is_active = true;
    
    result := json_build_object(
        'database_ready', true,
        'subscription_plans_count', plans_count,
        'master_admin_configured', CASE WHEN master_count > 0 THEN true ELSE false END,
        'system_version', '1.0.0',
        'requires_setup', CASE WHEN master_count = 0 THEN true ELSE false END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS create_master_admin(TEXT, TEXT, TEXT) CASCADE;
CREATE OR REPLACE FUNCTION create_master_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT
)
RETURNS JSON 
AS $$
DECLARE
    result JSON;
    existing_count INTEGER := 0;
    new_user_id UUID;
BEGIN
    -- Verificar se já existe master admin
    SELECT COUNT(*) INTO existing_count 
    FROM profiles 
    WHERE user_role = 'master_admin' AND is_active = true;
    
    IF existing_count > 0 THEN
        result := json_build_object(
            'success', false,
            'error', 'Sistema já possui um administrador master'
        );
        RETURN result;
    END IF;
    
    -- Verificar se email já existe
    SELECT COUNT(*) INTO existing_count 
    FROM profiles 
    WHERE email = admin_email;
    
    IF existing_count > 0 THEN
        result := json_build_object(
            'success', false,
            'error', 'Email já está em uso'
        );
        RETURN result;
    END IF;
    
    -- Criar novo master admin
    INSERT INTO profiles (
        email, full_name, user_role, is_active, 
        is_email_verified, password_hash, created_at, updated_at
    ) VALUES (
        admin_email, admin_name, 'master_admin', true, 
        true, admin_password, NOW(), NOW()
    ) RETURNING id INTO new_user_id;
    
    result := json_build_object(
        'success', true,
        'message', 'Administrador master criado com sucesso',
        'user_id', new_user_id::TEXT
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. CONCEDER PERMISSÕES PARA AS FUNÇÕES
GRANT EXECUTE ON FUNCTION get_system_status() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_master_admin(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- 9. VERIFICAR CONFIGURAÇÃO FINAL
DO $$
BEGIN
    RAISE NOTICE '=== CONFIGURAÇÃO FINAL ===';
    RAISE NOTICE 'Tabelas criadas sem RLS';
    RAISE NOTICE 'Permissões totais concedidas';
    RAISE NOTICE 'Funções criadas e acessíveis';
    RAISE NOTICE 'Sistema pronto para /system-setup';
    RAISE NOTICE '========================';
END $$;

-- 10. TESTE FINAL
SELECT 'TESTE: get_system_status()' as teste;
SELECT get_system_status() as resultado;
