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

-- 2. Criar função para verificar credenciais
CREATE OR REPLACE FUNCTION verify_user_credentials(
    user_email TEXT,
    user_password TEXT
)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    full_name TEXT,
    user_role TEXT,
    is_active BOOLEAN,
    avatar_url TEXT,
    phone TEXT,
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
        up.full_name,
        up.user_role,
        up.is_active,
        up.avatar_url,
        up.phone,
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
    END IF;
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
        up.email,
        up.full_name,
        up.phone,
        up.avatar_url,
        up.user_role,
        up.is_active,
        up.timezone,
        up.language,
        up.preferences,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.id = user_id AND up.is_active = true;
END;
$$;

-- 6. Verificar resultado
SELECT 'Sistema de autenticação corrigido' as status;
SELECT 
    email,
    full_name,
    user_role,
    is_active,
    'Senha: ' || simple_password as credentials
FROM user_profiles 
WHERE user_role = 'master_admin';
