-- Atualizar sistema de autenticação para reconhecer os novos emails
DO $$
BEGIN
    RAISE NOTICE '🔧 ATUALIZANDO SISTEMA DE AUTENTICAÇÃO';
    RAISE NOTICE '====================================';
END $$;

-- 1. Verificar se os emails foram atualizados corretamente
DO $$
DECLARE
    auth_admin_email text;
    auth_client_email text;
    profile_admin_email text;
    profile_client_email text;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO SINCRONIZAÇÃO AUTH <-> PROFILES...';
    
    -- Verificar emails na auth.users
    SELECT email INTO auth_admin_email 
    FROM auth.users 
    WHERE raw_user_meta_data->>'full_name' = 'Suporte O2 Digital'
    OR email LIKE '%suporte%'
    OR email LIKE '%admin%'
    LIMIT 1;
    
    SELECT email INTO auth_client_email 
    FROM auth.users 
    WHERE raw_user_meta_data->>'full_name' = 'João Silva'
    OR email LIKE '%joao%'
    OR email LIKE '%hotel%'
    LIMIT 1;
    
    -- Verificar emails nos profiles
    SELECT email INTO profile_admin_email 
    FROM public.profiles 
    WHERE role = 'master_admin'::user_role
    LIMIT 1;
    
    SELECT email INTO profile_client_email 
    FROM public.profiles 
    WHERE role = 'client'::user_role
    LIMIT 1;
    
    RAISE NOTICE '📧 AUTH.USERS:';
    RAISE NOTICE '   Admin: %', COALESCE(auth_admin_email, 'NÃO ENCONTRADO');
    RAISE NOTICE '   Cliente: %', COALESCE(auth_client_email, 'NÃO ENCONTRADO');
    RAISE NOTICE '';
    RAISE NOTICE '📧 PROFILES:';
    RAISE NOTICE '   Admin: %', COALESCE(profile_admin_email, 'NÃO ENCONTRADO');
    RAISE NOTICE '   Cliente: %', COALESCE(profile_client_email, 'NÃO ENCONTRADO');
END $$;

-- 2. Sincronizar emails se necessário
DO $$
DECLARE
    admin_user_id uuid;
    client_user_id uuid;
BEGIN
    RAISE NOTICE '🔄 SINCRONIZANDO EMAILS...';
    
    -- Encontrar IDs dos usuários pelos metadados ou emails antigos
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email IN ('admin@baitahotel.com', 'suporte@o2digital.com.br')
    OR raw_user_meta_data->>'full_name' ILIKE '%suporte%'
    OR raw_user_meta_data->>'full_name' ILIKE '%admin%'
    LIMIT 1;
    
    SELECT id INTO client_user_id 
    FROM auth.users 
    WHERE email IN ('hotel@exemplo.com', 'joao@hotelexemplo.com')
    OR raw_user_meta_data->>'full_name' ILIKE '%joão%'
    OR raw_user_meta_data->>'full_name' ILIKE '%silva%'
    LIMIT 1;
    
    -- Atualizar admin
    IF admin_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET email = 'suporte@o2digital.com.br'
        WHERE id = admin_user_id;
        
        UPDATE public.profiles 
        SET email = 'suporte@o2digital.com.br'
        WHERE id = admin_user_id;
        
        RAISE NOTICE '   ✅ Admin sincronizado: %', admin_user_id;
    END IF;
    
    -- Atualizar cliente
    IF client_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET email = 'joao@hotelexemplo.com'
        WHERE id = client_user_id;
        
        UPDATE public.profiles 
        SET email = 'joao@hotelexemplo.com'
        WHERE id = client_user_id;
        
        RAISE NOTICE '   ✅ Cliente sincronizado: %', client_user_id;
    END IF;
END $$;

-- 3. Verificação final completa
DO $$
DECLARE
    rec RECORD;
    total_users integer;
    total_profiles integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 VERIFICAÇÃO FINAL COMPLETA';
    RAISE NOTICE '============================';
    
    -- Contar totais
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM public.profiles;
    
    RAISE NOTICE '👥 Total usuários auth: %', total_users;
    RAISE NOTICE '👥 Total perfis: %', total_profiles;
    RAISE NOTICE '';
    
    -- Mostrar todos os usuários com perfis
    RAISE NOTICE '🔗 USUÁRIOS COM PERFIS:';
    FOR rec IN 
        SELECT 
            u.email as auth_email,
            p.email as profile_email,
            p.full_name,
            p.role::text as role,
            p.hotel_name
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        ORDER BY p.role DESC NULLS LAST
    LOOP
        RAISE NOTICE '   📧 Auth: % | Profile: % | Nome: % | Role: % | Hotel: %', 
            rec.auth_email, 
            COALESCE(rec.profile_email, 'SEM PERFIL'),
            COALESCE(rec.full_name, 'SEM NOME'),
            COALESCE(rec.role, 'SEM ROLE'),
            COALESCE(rec.hotel_name, 'SEM HOTEL');
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 CREDENCIAIS FINAIS PARA LOGIN:';
    RAISE NOTICE '================================';
    RAISE NOTICE '👑 Master Admin:';
    RAISE NOTICE '   Email: suporte@o2digital.com.br';
    RAISE NOTICE '   Senha: masteradmin123';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Cliente:';
    RAISE NOTICE '   Email: joao@hotelexemplo.com';
    RAISE NOTICE '   Senha: cliente123';
    RAISE NOTICE '';
    RAISE NOTICE '✅ SISTEMA PRONTO! Use essas credenciais para fazer login.';
END $$;
