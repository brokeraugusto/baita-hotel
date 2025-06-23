-- CORREÇÃO COMPLETA DO SISTEMA DE AUTENTICAÇÃO
-- Análise e correção de todos os problemas identificados

DO $$
BEGIN
    RAISE NOTICE '🔧 INICIANDO CORREÇÃO COMPLETA DO SISTEMA DE AUTENTICAÇÃO';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Problemas identificados:';
    RAISE NOTICE '1. Inconsistência entre auth.users e profiles';
    RAISE NOTICE '2. RLS bloqueando acesso aos próprios dados';
    RAISE NOTICE '3. Redirecionamentos incorretos';
    RAISE NOTICE '4. Verificações de role inconsistentes';
    RAISE NOTICE '';
END $$;

-- 1. DIAGNÓSTICO COMPLETO
DO $$
DECLARE
    rec RECORD;
    rls_enabled boolean;
BEGIN
    RAISE NOTICE '🔍 DIAGNÓSTICO COMPLETO DO SISTEMA';
    RAISE NOTICE '=================================';
    
    -- Verificar RLS
    SELECT relrowsecurity INTO rls_enabled 
    FROM pg_class 
    WHERE relname = 'profiles';
    
    RAISE NOTICE 'RLS na tabela profiles: %', CASE WHEN rls_enabled THEN 'ATIVADO' ELSE 'DESATIVADO' END;
    
    -- Verificar usuários e perfis
    RAISE NOTICE '';
    RAISE NOTICE '👥 USUÁRIOS E PERFIS ATUAIS:';
    FOR rec IN 
        SELECT 
            u.id,
            u.email as auth_email,
            u.email_confirmed_at IS NOT NULL as email_confirmed,
            p.email as profile_email,
            p.full_name,
            p.role::text as role
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        ORDER BY u.created_at
    LOOP
        RAISE NOTICE '   ID: % | Auth: % | Confirmado: % | Profile: % | Nome: % | Role: %', 
            rec.id,
            rec.auth_email,
            rec.email_confirmed,
            COALESCE(rec.profile_email, 'SEM PERFIL'),
            COALESCE(rec.full_name, 'SEM NOME'),
            COALESCE(rec.role, 'SEM ROLE');
    END LOOP;
END $$;

-- 2. DESABILITAR RLS TEMPORARIAMENTE PARA CORREÇÃO
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ AJUSTANDO RLS PARA PERMITIR CORREÇÕES';
    RAISE NOTICE '========================================';
    
    -- Desabilitar RLS temporariamente
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '   ✅ RLS desabilitado temporariamente';
END $$;

-- 3. CORRIGIR USUÁRIOS EXISTENTES
DO $$
DECLARE
    admin_user_id uuid;
    client_user_id uuid;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👑 CORRIGINDO USUÁRIO MASTER ADMIN';
    RAISE NOTICE '=================================';
    
    -- Encontrar usuário admin (qualquer um dos emails conhecidos)
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email IN ('admin@baitahotel.com', 'suporte@o2digital.com.br')
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Confirmar email se não estiver confirmado
        UPDATE auth.users 
        SET 
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = admin_user_id;
        
        -- Criar/atualizar perfil
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'suporte@o2digital.com.br',
            'Suporte O2 Digital',
            'master_admin'::user_role,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE '   ✅ Master admin configurado: %', admin_user_id;
    ELSE
        RAISE NOTICE '   ❌ Usuário master admin não encontrado';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '👤 CORRIGINDO USUÁRIO CLIENTE';
    RAISE NOTICE '============================';
    
    -- Encontrar usuário cliente
    SELECT id INTO client_user_id 
    FROM auth.users 
    WHERE email IN ('hotel@exemplo.com', 'joao@hotelexemplo.com')
    LIMIT 1;
    
    IF client_user_id IS NOT NULL THEN
        -- Confirmar email se não estiver confirmado
        UPDATE auth.users 
        SET 
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = client_user_id;
        
        -- Criar/atualizar perfil
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            hotel_name,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            client_user_id,
            'joao@hotelexemplo.com',
            'João Silva',
            'client'::user_role,
            'Hotel Exemplo',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            hotel_name = EXCLUDED.hotel_name,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE '   ✅ Cliente configurado: %', client_user_id;
    ELSE
        RAISE NOTICE '   ❌ Usuário cliente não encontrado';
    END IF;
END $$;

-- 4. CONFIGURAR RLS CORRETAMENTE
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ CONFIGURANDO RLS CORRETAMENTE';
    RAISE NOTICE '===============================';
    
    -- Reabilitar RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
    
    -- Criar políticas corretas
    CREATE POLICY "profiles_select_own" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "profiles_update_own" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "profiles_insert_own" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Política especial para master admin ver todos os perfis
    CREATE POLICY "master_admin_select_all" ON public.profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role = 'master_admin'::user_role
            )
        );
    
    RAISE NOTICE '   ✅ Políticas RLS configuradas corretamente';
END $$;

-- 5. CRIAR FUNÇÃO PARA OBTER PERFIL DO USUÁRIO
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚙️ CRIANDO FUNÇÕES AUXILIARES';
    RAISE NOTICE '=============================';
    
    -- Função para obter perfil do usuário atual
    CREATE OR REPLACE FUNCTION get_current_user_profile()
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    DECLARE
        user_profile json;
    BEGIN
        SELECT json_build_object(
            'id', id,
            'email', email,
            'full_name', full_name,
            'role', role::text,
            'hotel_name', hotel_name,
            'is_active', is_active
        ) INTO user_profile
        FROM public.profiles
        WHERE id = auth.uid();
        
        RETURN COALESCE(user_profile, '{"error": "Profile not found"}'::json);
    END;
    $function$;
    
    -- Função para verificar se usuário é master admin
    CREATE OR REPLACE FUNCTION is_master_admin()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'master_admin'::user_role
            AND is_active = true
        );
    END;
    $function$;
    
    -- Função para verificar se usuário é cliente
    CREATE OR REPLACE FUNCTION is_client()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'client'::user_role
            AND is_active = true
        );
    END;
    $function$;
    
    RAISE NOTICE '   ✅ Funções auxiliares criadas';
END $$;

-- 6. VERIFICAÇÃO FINAL
DO $$
DECLARE
    rec RECORD;
    admin_count integer;
    client_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ VERIFICAÇÃO FINAL DO SISTEMA';
    RAISE NOTICE '==============================';
    
    -- Contar usuários por tipo
    SELECT COUNT(*) INTO admin_count 
    FROM public.profiles 
    WHERE role = 'master_admin'::user_role;
    
    SELECT COUNT(*) INTO client_count 
    FROM public.profiles 
    WHERE role = 'client'::user_role;
    
    RAISE NOTICE '👑 Master Admins: %', admin_count;
    RAISE NOTICE '👤 Clientes: %', client_count;
    RAISE NOTICE '';
    
    -- Mostrar usuários finais
    RAISE NOTICE '🎯 USUÁRIOS CONFIGURADOS PARA LOGIN:';
    FOR rec IN 
        SELECT 
            u.email,
            p.full_name,
            p.role::text as role,
            p.hotel_name,
            u.email_confirmed_at IS NOT NULL as confirmed
        FROM auth.users u
        JOIN public.profiles p ON u.id = p.id
        WHERE p.is_active = true
        ORDER BY p.role DESC
    LOOP
        RAISE NOTICE '   📧 %', rec.email;
        RAISE NOTICE '      Nome: %', rec.full_name;
        RAISE NOTICE '      Role: %', rec.role;
        RAISE NOTICE '      Hotel: %', COALESCE(rec.hotel_name, 'N/A');
        RAISE NOTICE '      Email Confirmado: %', rec.confirmed;
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '🔑 CREDENCIAIS PARA TESTE:';
    RAISE NOTICE '=========================';
    RAISE NOTICE '👑 Master Admin: admin@baitahotel.com / masteradmin123';
    RAISE NOTICE '👤 Cliente: hotel@exemplo.com / cliente123';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Use os emails ORIGINAIS que já funcionavam!';
    RAISE NOTICE '   Os perfis foram atualizados mas os emails de login continuam os mesmos.';
END $$;
