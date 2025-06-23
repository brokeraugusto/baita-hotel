-- Remover funções existentes e recriar com estrutura correta

-- 1. Remover todas as funções existentes
DROP FUNCTION IF EXISTS verify_user_credentials(TEXT, TEXT);
DROP FUNCTION IF EXISTS update_last_login(UUID);
DROP FUNCTION IF EXISTS get_user_profile(UUID);
DROP FUNCTION IF EXISTS update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS change_user_password(UUID, TEXT, TEXT);

-- 2. Garantir que a tabela user_profiles existe com estrutura correta
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    user_role VARCHAR(50) NOT NULL DEFAULT 'hotel_owner',
    simple_password VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar função para verificar credenciais
CREATE OR REPLACE FUNCTION verify_user_credentials(
    user_email TEXT,
    user_password TEXT
)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_role TEXT,
    is_active BOOLEAN,
    preferences JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email::TEXT,
        up.full_name::TEXT,
        COALESCE(up.phone, '')::TEXT,
        COALESCE(up.avatar_url, '')::TEXT,
        up.user_role::TEXT,
        up.is_active,
        COALESCE(up.preferences, '{}'::JSONB)
    FROM user_profiles up
    WHERE up.email = LOWER(TRIM(user_email))
      AND up.simple_password = user_password
      AND up.is_active = true;
END;
$$;

-- 4. Criar função para atualizar último login
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 5. Criar função para obter perfil do usuário
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE(
    id UUID,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    user_role TEXT,
    is_active BOOLEAN,
    timezone TEXT,
    language TEXT,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email::TEXT,
        up.full_name::TEXT,
        COALESCE(up.phone, '')::TEXT,
        COALESCE(up.avatar_url, '')::TEXT,
        up.user_role::TEXT,
        up.is_active,
        COALESCE(up.timezone, 'America/Sao_Paulo')::TEXT,
        COALESCE(up.language, 'pt-BR')::TEXT,
        COALESCE(up.preferences, '{}'::JSONB),
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.id = user_id AND up.is_active = true;
END;
$$;

-- 6. Criar função para atualizar perfil do usuário
CREATE OR REPLACE FUNCTION update_user_profile(
    user_id UUID,
    new_full_name TEXT DEFAULT NULL,
    new_phone TEXT DEFAULT NULL,
    new_avatar_url TEXT DEFAULT NULL,
    new_timezone TEXT DEFAULT NULL,
    new_language TEXT DEFAULT NULL,
    new_preferences JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        full_name = COALESCE(new_full_name, full_name),
        phone = COALESCE(new_phone, phone),
        avatar_url = COALESCE(new_avatar_url, avatar_url),
        timezone = COALESCE(new_timezone, timezone),
        language = COALESCE(new_language, language),
        preferences = COALESCE(new_preferences, preferences),
        updated_at = NOW()
    WHERE id = user_id AND is_active = true;
    
    RETURN FOUND;
END;
$$;

-- 7. Criar função para alterar senha
CREATE OR REPLACE FUNCTION change_user_password(
    user_id UUID,
    current_password TEXT,
    new_password TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar se a senha atual está correta
    SELECT EXISTS(
        SELECT 1 FROM user_profiles 
        WHERE id = user_id 
          AND simple_password = current_password 
          AND is_active = true
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RETURN QUERY SELECT FALSE, 'Senha atual incorreta'::TEXT;
        RETURN;
    END IF;
    
    -- Atualizar a senha
    UPDATE user_profiles 
    SET 
        simple_password = new_password,
        updated_at = NOW()
    WHERE id = user_id AND is_active = true;
    
    IF FOUND THEN
        RETURN QUERY SELECT TRUE, 'Senha alterada com sucesso'::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, 'Erro ao alterar senha'::TEXT;
    END IF;
END;
$$;

SELECT 'Funções recriadas com sucesso' as status;
