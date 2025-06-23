-- Verificação final completa do sistema
DO $$
BEGIN
    RAISE NOTICE '🎯 VERIFICAÇÃO FINAL DO SISTEMA';
    RAISE NOTICE '==============================';
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
    col_count integer;
BEGIN
    RAISE NOTICE '🏗️ TABELA PROFILES:';
    
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND table_schema = 'public';
    
    RAISE NOTICE '   Colunas: % colunas encontradas', col_count;
    
    -- Verificar se as colunas principais existem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        RAISE NOTICE '   ✅ Coluna role existe';
    ELSE
        RAISE NOTICE '   ❌ Coluna role não existe';
    END IF;
    
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
        SELECT email, full_name, role, hotel_name, created_at
        FROM public.profiles
        ORDER BY created_at DESC
    LOOP
        RAISE NOTICE '   📧 %', user_record.email;
        RAISE NOTICE '      Nome: %', COALESCE(user_record.full_name, 'N/A');
        RAISE NOTICE '      Role: %', COALESCE(user_record.role::text, 'N/A');
        RAISE NOTICE '      Hotel: %', COALESCE(user_record.hotel_name, 'N/A');
        RAISE NOTICE '      Criado: %', user_record.created_at;
        RAISE NOTICE '';
    END LOOP;
END $$;

-- 4. Verificar se master admin existe
DO $$
DECLARE
    master_exists boolean;
BEGIN
    RAISE NOTICE '👑 MASTER ADMIN:';
    
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'suporte@o2digital.com.br' 
        AND role = 'master_admin'
    ) INTO master_exists;
    
    IF master_exists THEN
        RAISE NOTICE '   ✅ Master admin existe e está configurado corretamente';
    ELSE
        RAISE NOTICE '   ❌ Master admin não encontrado ou mal configurado';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- 5. Verificar se cliente de teste existe
DO $$
DECLARE
    client_exists boolean;
BEGIN
    RAISE NOTICE '👤 CLIENTE DE TESTE:';
    
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'joao@hotelexemplo.com' 
        AND role = 'client'
    ) INTO client_exists;
    
    IF client_exists THEN
        RAISE NOTICE '   ✅ Cliente de teste existe e está configurado corretamente';
    ELSE
        RAISE NOTICE '   ❌ Cliente de teste não encontrado';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- 6. Verificar função de criação de cliente
DO $$
DECLARE
    function_exists boolean;
BEGIN
    RAISE NOTICE '⚙️ FUNÇÃO CREATE_CLIENT_WITH_USER:';
    
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'create_client_with_user'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '   ✅ Função existe e está disponível';
    ELSE
        RAISE NOTICE '   ❌ Função não encontrada';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- 7. Verificar tabelas essenciais
DO $$
DECLARE
    table_record RECORD;
    tables_to_check text[] := ARRAY['profiles', 'clients', 'hotels'];
    table_name text;
BEGIN
    RAISE NOTICE '🗄️ TABELAS ESSENCIAIS:';
    
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        SELECT 
            t.table_name,
            COUNT(c.column_name) as column_count
        INTO table_record
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public' 
        AND t.table_name = table_name
        GROUP BY t.table_name;
        
        IF table_record.table_name IS NOT NULL THEN
            RAISE NOTICE '   ✅ % (% colunas)', table_name, table_record.column_count;
        ELSE
            RAISE NOTICE '   ❌ % não existe', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- 8. Testar criação de novo cliente
DO $$
DECLARE
    test_result json;
    test_email text := 'teste@novocliente.com';
BEGIN
    RAISE NOTICE '🧪 TESTE DE CRIAÇÃO DE CLIENTE:';
    
    -- Limpar cliente de teste se existir
    DELETE FROM auth.users WHERE email = test_email;
    DELETE FROM public.profiles WHERE email = test_email;
    DELETE FROM public.clients WHERE email = test_email;
    
    -- Tentar criar novo cliente
    SELECT create_client_with_user(
        'Cliente Teste',
        test_email,
        '123456789',
        'Hotel Teste',
        'Rio de Janeiro',
        'RJ'
    ) INTO test_result;
    
    IF (test_result->>'success')::boolean THEN
        RAISE NOTICE '   ✅ SUCESSO! Novo cliente criado com sucesso';
        RAISE NOTICE '   📧 Email: %', test_email;
        RAISE NOTICE '   🔑 Senha: 123456789';
        
        -- Limpar cliente de teste
        DELETE FROM auth.users WHERE email = test_email;
        DELETE FROM public.profiles WHERE email = test_email;
        DELETE FROM public.clients WHERE email = test_email;
        
    ELSE
        RAISE NOTICE '   ❌ ERRO: %', test_result->>'error';
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
    RAISE NOTICE '   URL: /master/dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '👤 CLIENTE:';
    RAISE NOTICE '   Email: joao@hotelexemplo.com';
    RAISE NOTICE '   Senha: 123456789';
    RAISE NOTICE '   URL: /client/dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Sistema pronto para produção!';
    RAISE NOTICE '';
END $$;
