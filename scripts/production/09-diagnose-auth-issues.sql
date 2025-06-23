-- Diagnosticar problemas de autenticação
-- Este script vai mostrar o que está acontecendo

DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNÓSTICO DO SISTEMA DE AUTENTICAÇÃO';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    
    -- 1. Verificar usuários na tabela auth.users
    RAISE NOTICE '1. USUÁRIOS NA TABELA AUTH.USERS:';
    RAISE NOTICE '--------------------------------';
    
    PERFORM (
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN
                RAISE NOTICE '✅ Encontrados % usuários na tabela auth.users', COUNT(*)
            ELSE
                RAISE NOTICE '❌ Nenhum usuário encontrado na tabela auth.users'
        END
        FROM auth.users
    );
    
    -- Mostrar emails dos usuários
    FOR rec IN (
        SELECT email, created_at, email_confirmed_at
        FROM auth.users 
        ORDER BY created_at DESC 
        LIMIT 5
    ) LOOP
        RAISE NOTICE '   📧 Email: % | Criado: % | Confirmado: %', 
            rec.email, 
            rec.created_at::date, 
            CASE WHEN rec.email_confirmed_at IS NOT NULL THEN 'Sim' ELSE 'Não' END;
    END LOOP;
    
    RAISE NOTICE '';
    
    -- 2. Verificar perfis na tabela profiles
    RAISE NOTICE '2. PERFIS NA TABELA PROFILES:';
    RAISE NOTICE '-----------------------------';
    
    PERFORM (
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN
                RAISE NOTICE '✅ Encontrados % perfis na tabela profiles', COUNT(*)
            ELSE
                RAISE NOTICE '❌ Nenhum perfil encontrado na tabela profiles'
        END
        FROM public.profiles
    );
    
    -- Mostrar perfis existentes
    FOR rec IN (
        SELECT email, full_name, user_role, created_at
        FROM public.profiles 
        ORDER BY created_at DESC 
        LIMIT 5
    ) LOOP
        RAISE NOTICE '   👤 Email: % | Nome: % | Tipo: % | Criado: %', 
            rec.email, 
            COALESCE(rec.full_name, 'N/A'), 
            rec.user_role, 
            rec.created_at::date;
    END LOOP;
    
    RAISE NOTICE '';
    
    -- 3. Verificar usuários sem perfil
    RAISE NOTICE '3. USUÁRIOS SEM PERFIL:';
    RAISE NOTICE '-----------------------';
    
    FOR rec IN (
        SELECT u.id, u.email, u.created_at
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL
        ORDER BY u.created_at DESC
        LIMIT 10
    ) LOOP
        RAISE NOTICE '   ⚠️  ID: % | Email: % | Criado: %', 
            rec.id, 
            rec.email, 
            rec.created_at::date;
    END LOOP;
    
    -- Se não houver usuários sem perfil
    IF NOT EXISTS (
        SELECT 1 FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL
    ) THEN
        RAISE NOTICE '   ✅ Todos os usuários têm perfis correspondentes';
    END IF;
    
    RAISE NOTICE '';
    
    -- 4. Verificar triggers e funções
    RAISE NOTICE '4. VERIFICAR TRIGGERS:';
    RAISE NOTICE '----------------------';
    
    -- Verificar se existe trigger para criar perfil automaticamente
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE '   ✅ Trigger on_auth_user_created existe';
    ELSE
        RAISE NOTICE '   ❌ Trigger on_auth_user_created NÃO existe';
    END IF;
    
    -- Verificar função handle_new_user
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
    ) THEN
        RAISE NOTICE '   ✅ Função handle_new_user existe';
    ELSE
        RAISE NOTICE '   ❌ Função handle_new_user NÃO existe';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 DIAGNÓSTICO CONCLUÍDO!';
    RAISE NOTICE '';
    
END $$;
