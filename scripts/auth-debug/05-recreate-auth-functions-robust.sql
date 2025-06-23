-- Recriar funções de autenticação de forma robusta

-- 1. Remover funções existentes
DROP FUNCTION IF EXISTS verify_user_credentials(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_profile(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_last_login(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS change_user_password(UUID, TEXT, TEXT) CASCADE;

-- 2. Criar função verify_user_credentials
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
    timezone TEXT,
    language TEXT,
    preferences JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        COALESCE(up.full_name, '')::TEXT,
        COALESCE(up.phone, '')::TEXT,
        COALESCE(up.avatar_url, '')::TEXT,
        up.user_role::TEXT,
        up.is_active,
        COALESCE(up.timezone, 'America/Sao_Paulo')::TEXT,
        COALESCE(up.language, 'pt-BR')::TEXT,
        COALESCE(up.preferences, '{}'::JSONB)
    FROM user_profiles up
    WHERE up.email = user_email
      AND up.simple_password = user_password
      AND up.is_active = true;
END;
$$;

-- 3. Criar função get_user_profile
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
    preferences JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        COALESCE(up.full_name, '')::TEXT,
        COALESCE(up.phone, '')::TEXT,
        COALESCE(up.avatar_url, '')::TEXT,
        up.user_role::TEXT,
        up.is_active,
        COALESCE(up.timezone, 'America/Sao_Paulo')::TEXT,
        COALESCE(up.language, 'pt-BR')::TEXT,
        COALESCE(up.preferences, '{}'::JSONB)
    FROM user_profiles up
    WHERE up.id = user_id
      AND up.is_active = true;
END;
$$;

-- 4. Criar função update_last_login
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

-- 5. Criar função update_user_profile
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
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 6. Criar função change_user_password
CREATE OR REPLACE FUNCTION change_user_password(
    user_id UUID,
    current_password TEXT,
    new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Verificar se a senha atual está correta
    SELECT EXISTS(
        SELECT 1 FROM user_profiles 
        WHERE id = user_id 
          AND simple_password = current_password
          AND is_active = true
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Atualizar senha
    UPDATE user_profiles 
    SET 
        simple_password = new_password,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 7. Testar todas as funções
SELECT 'Testando verify_user_credentials:' as teste;
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

SELECT 'Testando get_user_profile:' as teste;
SELECT * FROM get_user_profile((SELECT id FROM user_profiles WHERE email = 'admin@baitahotel.com' LIMIT 1));

SELECT 'Testando update_last_login:' as teste;
SELECT update_last_login((SELECT id FROM user_profiles WHERE email = 'admin@baitahotel.com' LIMIT 1));

SELECT 'Funções criadas com sucesso!' as resultado;
