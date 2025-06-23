-- Correção completa do sistema de autenticação

-- 1. Garantir que a tabela user_profiles existe com estrutura correta
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

-- 2. Criar função para verificar credenciais (corrigida)
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
        up.id as user_id,
        up.email::TEXT,
        up.full_name::TEXT,
        up.phone::TEXT,
        up.avatar_url::TEXT,
        up.user_role::TEXT,
        up.is_active,
        up.preferences
    FROM user_profiles up
    WHERE up.email = LOWER(TRIM(user_email))
      AND up.simple_password = user_password
      AND up.is_active = true;
END;
$$;

-- 3. Criar função para atualizar último login
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

-- 4. Criar usuário master admin de teste se não existir
DO $$
BEGIN
    -- Verificar se já existe master admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_role = 'master_admin' AND is_active = true
    ) THEN
        -- Criar master admin de teste
        INSERT INTO user_profiles (
            id,
            email,
            full_name,
            user_role,
            simple_password,
            is_active,
            is_email_verified,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'admin@baitahotel.com',
            'Master Admin',
            'master_admin',
            'admin123',
            true,
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Master admin criado: admin@baitahotel.com / admin123';
    ELSE
        RAISE NOTICE 'Master admin já existe';
    END IF;
END;
$$;

-- 5. Criar função para obter perfil do usuário (corrigida)
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
        up.phone::TEXT,
        up.avatar_url::TEXT,
        up.user_role::TEXT,
        up.is_active,
        up.timezone::TEXT,
        up.language::TEXT,
        up.preferences,
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

-- 8. Verificar resultado
SELECT 'Sistema de autenticação corrigido' as status;
