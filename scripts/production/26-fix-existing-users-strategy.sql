-- ESTRATÉGIA DEFINITIVA: USAR USUÁRIOS EXISTENTES E ATUALIZAR EMAILS
DO $$
BEGIN
    RAISE NOTICE '🎯 NOVA ESTRATÉGIA: ATUALIZANDO USUÁRIOS EXISTENTES';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Vamos usar os usuários que JÁ FUNCIONAM e apenas mudar os emails';
END $$;

-- 1. Verificar usuários existentes que funcionam
DO $$
DECLARE
    admin_user_id uuid;
    client_user_id uuid;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO USUÁRIOS EXISTENTES...';
    
    -- Buscar usuário admin@baitahotel.com
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@baitahotel.com';
    
    -- Buscar usuário hotel@exemplo.com
    SELECT id INTO client_user_id 
    FROM auth.users 
    WHERE email = 'hotel@exemplo.com';
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE '   ✅ Usuário admin encontrado: %', admin_user_id;
    ELSE
        RAISE NOTICE '   ❌ Usuário admin NÃO encontrado';
    END IF;
    
    IF client_user_id IS NOT NULL THEN
        RAISE NOTICE '   ✅ Usuário cliente encontrado: %', client_user_id;
    ELSE
        RAISE NOTICE '   ❌ Usuário cliente NÃO encontrado';
    END IF;
END $$;

-- 2. Atualizar email do master admin
DO $$
DECLARE
    admin_user_id uuid;
    profile_exists boolean;
BEGIN
    RAISE NOTICE '👑 ATUALIZANDO MASTER ADMIN...';
    
    -- Buscar usuário admin@baitahotel.com
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@baitahotel.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Atualizar email na auth.users
        UPDATE auth.users 
        SET 
            email = 'suporte@o2digital.com.br',
            raw_user_meta_data = jsonb_set(
                COALESCE(raw_user_meta_data, '{}'),
                '{full_name}',
                '"Suporte O2 Digital"'
            ),
            updated_at = NOW()
        WHERE id = admin_user_id;
        
        -- Verificar se perfil existe
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = admin_user_id
        ) INTO profile_exists;
        
        IF profile_exists THEN
            -- Atualizar perfil existente
            UPDATE public.profiles 
            SET 
                email = 'suporte@o2digital.com.br',
                full_name = 'Suporte O2 Digital',
                role = 'master_admin'::user_role,
                updated_at = NOW()
            WHERE id = admin_user_id;
            
            RAISE NOTICE '   ✅ Perfil master admin atualizado';
        ELSE
            -- Criar perfil
            INSERT INTO public.profiles (
                id,
                email,
                full_name,
                role,
                created_at,
                updated_at
            ) VALUES (
                admin_user_id,
                'suporte@o2digital.com.br',
                'Suporte O2 Digital',
                'master_admin'::user_role,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '   ✅ Perfil master admin criado';
        END IF;
        
        RAISE NOTICE '   ✅ Master admin atualizado: suporte@o2digital.com.br / masteradmin123';
    ELSE
        RAISE NOTICE '   ❌ Usuário admin não encontrado para atualizar';
    END IF;
END $$;

-- 3. Atualizar email do cliente
DO $$
DECLARE
    client_user_id uuid;
    profile_exists boolean;
BEGIN
    RAISE NOTICE '👤 ATUALIZANDO CLIENTE...';
    
    -- Buscar usuário hotel@exemplo.com
    SELECT id INTO client_user_id 
    FROM auth.users 
    WHERE email = 'hotel@exemplo.com';
    
    IF client_user_id IS NOT NULL THEN
        -- Atualizar email na auth.users
        UPDATE auth.users 
        SET 
            email = 'joao@hotelexemplo.com',
            raw_user_meta_data = jsonb_set(
                COALESCE(raw_user_meta_data, '{}'),
                '{full_name}',
                '"João Silva"'
            ),
            updated_at = NOW()
        WHERE id = client_user_id;
        
        -- Verificar se perfil existe
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = client_user_id
        ) INTO profile_exists;
        
        IF profile_exists THEN
            -- Atualizar perfil existente
            UPDATE public.profiles 
            SET 
                email = 'joao@hotelexemplo.com',
                full_name = 'João Silva',
                role = 'client'::user_role,
                hotel_name = 'Hotel Exemplo',
                updated_at = NOW()
            WHERE id = client_user_id;
            
            RAISE NOTICE '   ✅ Perfil cliente atualizado';
        ELSE
            -- Criar perfil
            INSERT INTO public.profiles (
                id,
                email,
                full_name,
                role,
                hotel_name,
                created_at,
                updated_at
            ) VALUES (
                client_user_id,
                'joao@hotelexemplo.com',
                'João Silva',
                'client'::user_role,
                'Hotel Exemplo',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '   ✅ Perfil cliente criado';
        END IF;
        
        RAISE NOTICE '   ✅ Cliente atualizado: joao@hotelexemplo.com / cliente123';
    ELSE
        RAISE NOTICE '   ❌ Usuário cliente não encontrado para atualizar';
    END IF;
END $$;

-- 4. Limpar usuários duplicados/problemáticos
DO $$
DECLARE
    duplicate_count integer;
BEGIN
    RAISE NOTICE '🗑️ LIMPANDO USUÁRIOS DUPLICADOS...';
    
    -- Remover usuários que criamos manualmente (que não funcionam)
    DELETE FROM auth.users 
    WHERE email IN ('suporte@o2digital.com.br', 'joao@hotelexemplo.com')
    AND id NOT IN (
        SELECT id FROM auth.users 
        WHERE email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
    );
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    RAISE NOTICE '   ✅ % usuários duplicados removidos', duplicate_count;
END $$;

-- 5. Criar função para criar clientes (usando Supabase Auth)
DO $$
BEGIN
    RAISE NOTICE '⚙️ CRIANDO FUNÇÃO PARA CRIAR CLIENTES...';
    
    DROP FUNCTION IF EXISTS create_client_profile(uuid, text, text, text);

    CREATE OR REPLACE FUNCTION create_client_profile(
        p_user_id uuid,
        p_email text,
        p_full_name text,
        p_hotel_name text
    )
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    DECLARE
        result json;
        profile_exists boolean;
    BEGIN
        -- Verificar se perfil já existe
        SELECT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = p_user_id
        ) INTO profile_exists;
        
        IF profile_exists THEN
            -- Atualizar perfil existente
            UPDATE public.profiles 
            SET 
                email = p_email,
                full_name = p_full_name,
                role = 'client'::user_role,
                hotel_name = p_hotel_name,
                updated_at = NOW()
            WHERE id = p_user_id;
        ELSE
            -- Criar novo perfil
            INSERT INTO public.profiles (
                id,
                email,
                full_name,
                role,
                hotel_name,
                created_at,
                updated_at
            ) VALUES (
                p_user_id,
                p_email,
                p_full_name,
                'client'::user_role,
                p_hotel_name,
                NOW(),
                NOW()
            );
        END IF;
        
        result := json_build_object(
            'success', true,
            'user_id', p_user_id,
            'email', p_email,
            'message', 'Perfil de cliente criado/atualizado com sucesso'
        );
        
        RETURN result;
        
    EXCEPTION
        WHEN OTHERS THEN
            result := json_build_object(
                'success', false,
                'error', SQLERRM,
                'message', 'Erro ao criar/atualizar perfil de cliente'
            );
            RETURN result;
    END;
    $function$;

    RAISE NOTICE '   ✅ Função create_client_profile criada';
END $$;

-- 6. Verificação final
DO $$
DECLARE
    master_email text;
    client_email text;
    master_role text;
    client_role text;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ATUALIZAÇÃO CONCLUÍDA!';
    RAISE NOTICE '========================';
    
    -- Verificar master admin
    SELECT p.email, p.role::text 
    INTO master_email, master_role
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.role = 'master_admin'::user_role
    LIMIT 1;
    
    -- Verificar cliente
    SELECT p.email, p.role::text 
    INTO client_email, client_role
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.role = 'client'::user_role
    LIMIT 1;
    
    RAISE NOTICE '👑 Master Admin:';
    RAISE NOTICE '   Email: %', COALESCE(master_email, 'NÃO ENCONTRADO');
    RAISE NOTICE '   Role: %', COALESCE(master_role, 'NÃO ENCONTRADO');
    RAISE NOTICE '   Senha: masteradmin123 (mesma de antes)';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Cliente:';
    RAISE NOTICE '   Email: %', COALESCE(client_email, 'NÃO ENCONTRADO');
    RAISE NOTICE '   Role: %', COALESCE(client_role, 'NÃO ENCONTRADO');
    RAISE NOTICE '   Senha: cliente123 (mesma de antes)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ AGORA VOCÊ PODE FAZER LOGIN COM OS EMAILS ATUALIZADOS!';
    RAISE NOTICE '   As senhas continuam as mesmas que já funcionavam.';
END $$;
