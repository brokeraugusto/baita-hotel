-- Diagnóstico completo e correção das funções de autenticação

-- 1. Verificar estrutura atual da tabela user_profiles
SELECT 'ESTRUTURA DA TABELA user_profiles:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Verificar funções existentes
SELECT 'FUNÇÕES EXISTENTES:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' OR routine_name LIKE '%auth%'
ORDER BY routine_name;

-- 3. Remover TODAS as funções relacionadas
DROP FUNCTION IF EXISTS verify_user_credentials(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_profile(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_last_login(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_user_profile CASCADE;
DROP FUNCTION IF EXISTS change_user_password CASCADE;

-- 4. Verificar dados existentes na tabela
SELECT 'DADOS ATUAIS NA TABELA:' as info;
SELECT 
    id,
    email,
    full_name,
    user_role,
    simple_password,
    is_active
FROM user_profiles 
ORDER BY email;

-- 5. Criar função verify_user_credentials SIMPLES
CREATE OR REPLACE FUNCTION verify_user_credentials(
    p_email TEXT,
    p_password TEXT
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
    -- Log da tentativa
    RAISE NOTICE 'Verificando credenciais para: %', p_email;
    
    RETURN QUERY
    SELECT 
        up.id::UUID,
        up.email::TEXT,
        COALESCE(up.full_name, 'Usuário')::TEXT,
        COALESCE(up.phone, '')::TEXT,
        COALESCE(up.avatar_url, '')::TEXT,
        up.user_role::TEXT,
        up.is_active::BOOLEAN,
        'America/Sao_Paulo'::TEXT,
        'pt-BR'::TEXT,
        '{}'::JSONB
    FROM user_profiles up
    WHERE LOWER(TRIM(up.email)) = LOWER(TRIM(p_email))
      AND up.simple_password = p_password
      AND up.is_active = true;
      
    -- Log do resultado
    IF NOT FOUND THEN
        RAISE NOTICE 'Nenhum usuário encontrado para: %', p_email;
    ELSE
        RAISE NOTICE 'Usuário encontrado para: %', p_email;
    END IF;
END;
$$;

-- 6. Criar função get_user_profile SIMPLES
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
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
        up.id::UUID,
        up.email::TEXT,
        COALESCE(up.full_name, 'Usuário')::TEXT,
        COALESCE(up.phone, '')::TEXT,
        COALESCE(up.avatar_url, '')::TEXT,
        up.user_role::TEXT,
        up.is_active::BOOLEAN,
        'America/Sao_Paulo'::TEXT,
        'pt-BR'::TEXT,
        '{}'::JSONB
    FROM user_profiles up
    WHERE up.id = p_user_id
      AND up.is_active = true;
END;
$$;

-- 7. Criar função update_last_login SIMPLES
CREATE OR REPLACE FUNCTION update_last_login(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- 8. Testar as funções criadas
SELECT 'TESTANDO verify_user_credentials:' as teste;

-- Teste com admin@baitahotel.com
DO $$
DECLARE
    test_result RECORD;
BEGIN
    SELECT * INTO test_result FROM verify_user_credentials('admin@baitahotel.com', 'admin123') LIMIT 1;
    
    IF test_result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ SUCESSO: admin@baitahotel.com - ID: %, Role: %', test_result.user_id, test_result.user_role;
    ELSE
        RAISE NOTICE '❌ FALHA: admin@baitahotel.com não encontrado';
    END IF;
END $$;

-- Teste com suporte@o2digital.com.br
DO $$
DECLARE
    test_result RECORD;
BEGIN
    SELECT * INTO test_result FROM verify_user_credentials('suporte@o2digital.com.br', 'LaVi121888!') LIMIT 1;
    
    IF test_result.user_id IS NOT NULL THEN
        RAISE NOTICE '✅ SUCESSO: suporte@o2digital.com.br - ID: %, Role: %', test_result.user_id, test_result.user_role;
    ELSE
        RAISE NOTICE '❌ FALHA: suporte@o2digital.com.br não encontrado';
    END IF;
END $$;

-- 9. Teste direto das credenciais
SELECT 'TESTE DIRETO DAS CREDENCIAIS:' as info;

-- Verificar se existem usuários com essas credenciais
SELECT 
    'Verificação direta' as tipo,
    email,
    simple_password,
    user_role,
    is_active
FROM user_profiles 
WHERE email IN ('admin@baitahotel.com', 'suporte@o2digital.com.br', 'hotel@exemplo.com')
ORDER BY email;

-- 10. Resultado final
SELECT 'FUNÇÕES CRIADAS COM SUCESSO!' as resultado;
SELECT 'Use as seguintes credenciais para teste:' as instrucoes;
SELECT 'admin@baitahotel.com / admin123' as credencial_1;
SELECT 'suporte@o2digital.com.br / LaVi121888!' as credencial_2;
SELECT 'hotel@exemplo.com / hotel123' as credencial_3;
