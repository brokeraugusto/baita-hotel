-- LIMPEZA COMPLETA DO SISTEMA DE AUTENTICAÇÃO
-- Remove todos os usuários admin e códigos conflitantes

-- 1. REMOVER TODOS OS USUÁRIOS EXISTENTES
DELETE FROM profiles;

-- 2. REMOVER TODAS AS FUNÇÕES DE AUTENTICAÇÃO ANTIGAS
DROP FUNCTION IF EXISTS verify_user_credentials(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_profile(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS change_user_password(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_last_login(UUID) CASCADE;

-- 3. MANTER APENAS AS FUNÇÕES NECESSÁRIAS PARA SYSTEM-SETUP
-- Função para verificar status do sistema
CREATE OR REPLACE FUNCTION get_system_status()
RETURNS JSON AS $$
DECLARE
    result JSON;
    master_count INTEGER;
    plans_count INTEGER;
BEGIN
    -- Contar master admins
    SELECT COUNT(*) INTO master_count 
    FROM profiles 
    WHERE user_role = 'master_admin' AND is_active = true;
    
    -- Contar planos de assinatura
    SELECT COUNT(*) INTO plans_count 
    FROM subscription_plans 
    WHERE is_active = true;
    
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

-- Função para criar master admin (apenas via system-setup)
CREATE OR REPLACE FUNCTION create_master_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    existing_count INTEGER;
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
        admin_email,
        admin_name,
        'master_admin',
        true,
        admin_password, -- Senha em texto simples para simplicidade
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
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICAR LIMPEZA
SELECT 'LIMPEZA CONCLUÍDA - USUÁRIOS REMOVIDOS:' as status;
SELECT COUNT(*) as total_usuarios FROM profiles;
SELECT 'SISTEMA PRONTO PARA SETUP INICIAL' as info;
