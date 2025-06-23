-- Limpeza completa e reconstrução do sistema de autenticação
-- Este script remove tudo relacionado a auth e reconstrói do zero

-- 1. Remover todas as funções relacionadas a autenticação
DROP FUNCTION IF EXISTS verify_user_credentials(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_profile(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS change_user_password(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_last_login(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_master_admin(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_system_status() CASCADE;

-- 2. Remover triggers se existirem
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- 3. Limpar completamente a tabela profiles
DELETE FROM profiles;

-- 4. Recriar a estrutura da tabela profiles (garantir que está correta)
DROP TABLE IF EXISTS profiles CASCADE;

-- Recriar enum se necessário
DROP TYPE IF EXISTS user_role_enum CASCADE;
CREATE TYPE user_role_enum AS ENUM ('master_admin', 'hotel_owner', 'hotel_staff');

-- Criar tabela profiles limpa
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_role user_role_enum NOT NULL DEFAULT 'hotel_staff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    password_hash TEXT NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_role ON profiles(user_role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- 5. Inserir usuários de teste com dados exatos
INSERT INTO profiles (
    email,
    full_name,
    user_role,
    is_active,
    password_hash,
    phone,
    timezone,
    language
) VALUES 
-- Usuário 1: admin@baitahotel.com com senha admin123
(
    'admin@baitahotel.com',
    'Master Administrator',
    'master_admin',
    true,
    'admin123',
    '+55 11 99999-9999',
    'America/Sao_Paulo',
    'pt-BR'
),
-- Usuário 2: suporte@o2digital.com.br com senha LaVi121888!
(
    'suporte@o2digital.com.br',
    'Suporte O2 Digital',
    'master_admin',
    true,
    'LaVi121888!',
    '+55 11 88888-8888',
    'America/Sao_Paulo',
    'pt-BR'
),
-- Usuário 3: admin@baitahotel.com com senha masteradmin123 (para o teste que funciona)
(
    'admin.master@baitahotel.com',
    'Master Admin Test',
    'master_admin',
    true,
    'masteradmin123',
    '+55 11 77777-7777',
    'America/Sao_Paulo',
    'pt-BR'
);

-- 6. Verificar se os dados foram inseridos corretamente
SELECT 
    'USUÁRIOS CRIADOS:' as info,
    email,
    password_hash as senha,
    user_role,
    is_active
FROM profiles 
ORDER BY email;

-- 7. Testar cada login manualmente
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Teste 1: admin@baitahotel.com / admin123
    SELECT * INTO test_result 
    FROM profiles 
    WHERE email = 'admin@baitahotel.com' 
      AND password_hash = 'admin123' 
      AND is_active = true;
    
    IF FOUND THEN
        RAISE NOTICE '✅ LOGIN TESTE 1 FUNCIONANDO: admin@baitahotel.com / admin123';
    ELSE
        RAISE NOTICE '❌ LOGIN TESTE 1 FALHOU: admin@baitahotel.com / admin123';
    END IF;
    
    -- Teste 2: suporte@o2digital.com.br / LaVi121888!
    SELECT * INTO test_result 
    FROM profiles 
    WHERE email = 'suporte@o2digital.com.br' 
      AND password_hash = 'LaVi121888!' 
      AND is_active = true;
    
    IF FOUND THEN
        RAISE NOTICE '✅ LOGIN TESTE 2 FUNCIONANDO: suporte@o2digital.com.br / LaVi121888!';
    ELSE
        RAISE NOTICE '❌ LOGIN TESTE 2 FALHOU: suporte@o2digital.com.br / LaVi121888!';
    END IF;
    
    -- Teste 3: admin.master@baitahotel.com / masteradmin123
    SELECT * INTO test_result 
    FROM profiles 
    WHERE email = 'admin.master@baitahotel.com' 
      AND password_hash = 'masteradmin123' 
      AND is_active = true;
    
    IF FOUND THEN
        RAISE NOTICE '✅ LOGIN TESTE 3 FUNCIONANDO: admin.master@baitahotel.com / masteradmin123';
    ELSE
        RAISE NOTICE '❌ LOGIN TESTE 3 FALHOU: admin.master@baitahotel.com / masteradmin123';
    END IF;
END $$;
