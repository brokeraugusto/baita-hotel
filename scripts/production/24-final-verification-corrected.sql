-- Verificação final corrigida
DO $$
BEGIN
    RAISE NOTICE '🎯 VERIFICAÇÃO FINAL DO SISTEMA (CORRIGIDA)';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
END $$;

-- 1. Verificar enum user_role
DO $$
DECLARE
    enum_values text[];
BEGIN
    RAISE NOTICE '📋 ENUM USER_ROLE:';
    
    SELECT array_agg(enumlabel ORDER BY enumsortorder) INTO enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role';
    
    RAISE NOTICE '   Valores: %', array_to_string(enum_values, ', ');
    RAISE NOTICE '';
END $$;

-- 2. Verificar estrutura da tabela profiles
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '🏗️ ESTRUTURA DA TABELA PROFILES:';
    
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   - %: % (%)', col_record.column_name, col_record.data_type, 
                     CASE WHEN col_record.is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- 3. Verificar usuários criados
DO $$
DECLARE
    user_record RECORD;
    user_count integer;
BEGIN
    RAISE NOTICE '👥 USUÁRIOS NO SISTEMA:';
    
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    RAISE NOTICE '   Total de perfis: %', user_count;
    RAISE NOTICE '';
    
    FOR user_record IN 
        SELECT email, full_name, role::text as role_text, hotel_name, created_at
        FROM public.profiles
        ORDER BY created_at DESC
    LOOP
        RAISE NOTICE '   📧 %', user_record.email;
        RAISE NOTICE '      Nome: %', COALESCE(user_record.full_name, 'N/A');
        RAISE NOTICE '      Role: %', COALESCE(user_record.role_text, 'N/A');
        RAISE NOTICE '      Hotel: %', COALESCE(user_record.hotel_name, 'N/A');
        RAISE NOTICE '      Criado: %', user_record.created_at;
        RAISE NOTICE '';
    END LOOP;
END $$;

-- 4. Verificar credenciais específicas
DO $$
DECLARE
    master_exists boolean;
    client_exists boolean;
BEGIN
    RAISE NOTICE '🔑 VERIFICAÇÃO DE CREDENCIAIS:';
    
    -- Master admin
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'suporte@o2digital.com.br' 
        AND role = 'master_admin'
    ) INTO master_exists;
    
    -- Cliente
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'joao@hotelexemplo.com' 
        AND role = 'client'
    ) INTO client_exists;
    
    RAISE NOTICE '   👑 Master Admin (suporte@o2digital.com.br): %', 
                 CASE WHEN master_exists THEN '✅ OK' ELSE '❌ ERRO' END;
    RAISE NOTICE '   👤 Cliente (joao@hotelexemplo.com): %', 
                 CASE WHEN client_exists THEN '✅ OK' ELSE '❌ ERRO' END;
    RAISE NOTICE '';
END $$;

-- 5. Testar função de criação de cliente
DO $$
DECLARE
    function_exists boolean;
    test_result json;
    test_email text := 'teste@funcao.com';
BEGIN
    RAISE NOTICE '⚙️ TESTE DA FUNÇÃO CREATE_CLIENT_WITH_USER:';
    
    -- Verificar se função existe
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'create_client_with_user'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '   ✅ Função existe';
        
        -- Limpar teste anterior
        DELETE FROM auth.users WHERE email = test_email;
        DELETE FROM public.profiles WHERE email = test_email;
        
        -- Testar função
        BEGIN
            SELECT create_client_with_user(
                'Cliente Teste Função',
                test_email,
                '123456789',
                'Hotel Teste Função',
                'São Paulo',
                'SP'
            ) INTO test_result;
            
            IF (test_result->>'success')::boolean THEN
                RAISE NOTICE '   ✅ Função funcionando corretamente';
                
                -- Limpar teste
                DELETE FROM auth.users WHERE email = test_email;
                DELETE FROM public.profiles WHERE email = test_email;
            ELSE
                RAISE NOTICE '   ❌ Erro na função: %', test_result->>'error';
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '   ❌ Erro ao executar função: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE '   ❌ Função não existe';
    END IF;
    
    RAISE NOTICE '';
END $$;

DO $$
BEGIN
    RAISE NOTICE '🎉 VERIFICAÇÃO CONCLUÍDA!';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 CREDENCIAIS PARA LOGIN:';
    RAISE NOTICE '';
    RAISE NOTICE '👑 MASTER ADMIN:';
    RAISE NOTICE '   Email: suporte@o2digital.com.br';
    RAISE NOTICE '   Senha: 123456789';
    RAISE NOTICE '';
    RAISE NOTICE '👤 CLIENTE:';
    RAISE NOTICE '   Email: joao@hotelexemplo.com';
    RAISE NOTICE '   Senha: 123456789';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Sistema pronto para teste!';
    RAISE NOTICE '';
END $$;
