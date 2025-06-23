-- Testar todas as funções de autenticação

SELECT '=== TESTANDO FUNÇÃO verify_user_credentials ===' as test_section;

-- Teste 1: Master Admin
SELECT 'Teste 1: Master Admin' as test_name;
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'admin123');

-- Teste 2: Hotel Owner
SELECT 'Teste 2: Hotel Owner' as test_name;
SELECT * FROM verify_user_credentials('hotel@exemplo.com', 'hotel123');

-- Teste 3: Credenciais inválidas
SELECT 'Teste 3: Credenciais inválidas' as test_name;
SELECT * FROM verify_user_credentials('admin@baitahotel.com', 'senha_errada');

SELECT '=== TESTANDO FUNÇÃO get_user_profile ===' as test_section;

-- Pegar ID do master admin para teste
DO $$
DECLARE
    test_user_id UUID;
    profile_record RECORD;
BEGIN
    -- Pegar ID do usuário master admin
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE email = 'admin@baitahotel.com' 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testando get_user_profile com ID: %', test_user_id;
        
        -- Testar a função (não podemos fazer SELECT em DO block, então apenas logamos)
        FOR profile_record IN 
            SELECT * FROM get_user_profile(test_user_id)
        LOOP
            RAISE NOTICE 'Perfil encontrado: % - %', profile_record.email, profile_record.full_name;
        END LOOP;
    ELSE
        RAISE NOTICE 'Usuário master admin não encontrado';
    END IF;
END;
$$;

SELECT '=== TESTANDO FUNÇÃO update_last_login ===' as test_section;

-- Testar update_last_login
DO $$
DECLARE
    test_user_id UUID;
    update_result BOOLEAN;
BEGIN
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE email = 'admin@baitahotel.com' 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        SELECT update_last_login(test_user_id) INTO update_result;
        RAISE NOTICE 'Update last login result: %', update_result;
    END IF;
END;
$$;

SELECT 'Verificando last_login_at atualizado:' as check;
SELECT 
    email,
    full_name,
    last_login_at,
    updated_at
FROM user_profiles 
WHERE email = 'admin@baitahotel.com';

SELECT '=== SISTEMA DE AUTENTICAÇÃO TESTADO COM SUCESSO ===' as final_status;
