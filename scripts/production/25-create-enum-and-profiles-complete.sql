-- Criar enum e tabela profiles definitivamente
DO $$
BEGIN
    RAISE NOTICE '🔧 CRIANDO ENUM E TABELA PROFILES DEFINITIVAMENTE';
    RAISE NOTICE '================================================';
END $$;

-- 1. Verificar e criar enum user_role
DO $$
BEGIN
    RAISE NOTICE '📋 VERIFICANDO ENUM USER_ROLE...';
    
    -- Remover enum se existir (com dependências)
    DROP TYPE IF EXISTS user_role CASCADE;
    
    -- Criar enum correto
    CREATE TYPE user_role AS ENUM ('client', 'master_admin', 'hotel_staff');
    
    RAISE NOTICE '   ✅ Enum user_role criado: client, master_admin, hotel_staff';
END $$;

-- 2. Backup dos dados existentes
DO $$
DECLARE
    backup_count integer := 0;
    table_exists boolean;
BEGIN
    RAISE NOTICE '💾 FAZENDO BACKUP DOS DADOS...';
    
    -- Verificar se tabela profiles existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Criar tabela de backup
        DROP TABLE IF EXISTS profiles_backup;
        CREATE TABLE profiles_backup AS SELECT * FROM public.profiles;
        
        SELECT COUNT(*) INTO backup_count FROM profiles_backup;
        RAISE NOTICE '   ✅ % registros salvos no backup', backup_count;
    ELSE
        RAISE NOTICE '   ℹ️ Tabela profiles não existe, nenhum backup necessário';
    END IF;
END $$;

-- 3. Recriar tabela profiles com estrutura correta
DO $$
BEGIN
    RAISE NOTICE '🏗️ CRIANDO TABELA PROFILES...';
    
    -- Remover tabela se existir
    DROP TABLE IF EXISTS public.profiles CASCADE;

    -- Criar tabela com enum correto
    CREATE TABLE public.profiles (
        id uuid PRIMARY KEY,
        email text UNIQUE NOT NULL,
        full_name text,
        role user_role NOT NULL DEFAULT 'client'::user_role,
        hotel_name text,
        hotel_id uuid,
        avatar_url text,
        phone text,
        is_active boolean DEFAULT true,
        subscription_status text DEFAULT 'trial',
        subscription_plan text,
        subscription_end_date timestamptz,
        last_login_at timestamptz,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
    );

    RAISE NOTICE '   ✅ Tabela profiles criada com enum user_role';
END $$;

-- 4. Restaurar dados do backup (se existir)
DO $$
DECLARE
    backup_record RECORD;
    restored_count integer := 0;
    backup_exists boolean;
BEGIN
    RAISE NOTICE '📥 RESTAURANDO DADOS DO BACKUP...';
    
    -- Verificar se backup existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles_backup' AND table_schema = 'public'
    ) INTO backup_exists;
    
    IF backup_exists THEN
        FOR backup_record IN SELECT * FROM profiles_backup
        LOOP
            BEGIN
                INSERT INTO public.profiles (
                    id,
                    email,
                    full_name,
                    role,
                    hotel_name,
                    hotel_id,
                    avatar_url,
                    phone,
                    is_active,
                    subscription_status,
                    subscription_plan,
                    subscription_end_date,
                    created_at,
                    updated_at
                ) VALUES (
                    backup_record.id,
                    backup_record.email,
                    backup_record.full_name,
                    'client'::user_role,
                    backup_record.hotel_name,
                    backup_record.hotel_id,
                    backup_record.avatar_url,
                    backup_record.phone,
                    COALESCE(backup_record.is_active, true),
                    COALESCE(backup_record.subscription_status, 'trial'),
                    backup_record.subscription_plan,
                    backup_record.subscription_end_date,
                    COALESCE(backup_record.created_at, NOW()),
                    COALESCE(backup_record.updated_at, NOW())
                );
                
                restored_count := restored_count + 1;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '   ⚠️ Erro ao restaurar %: %', backup_record.email, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE '   ✅ % registros restaurados', restored_count;
    ELSE
        RAISE NOTICE '   ℹ️ Nenhum backup encontrado';
    END IF;
END $$;

-- 5. Criar master admin
DO $$
DECLARE
    master_admin_id uuid;
    master_exists boolean;
BEGIN
    RAISE NOTICE '👑 CRIANDO MASTER ADMIN...';
    
    -- Verificar se já existe
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'suporte@o2digital.com.br'
    ) INTO master_exists;
    
    IF NOT master_exists THEN
        master_admin_id := gen_random_uuid();
        
        -- Limpar da auth se existir
        DELETE FROM auth.users WHERE email = 'suporte@o2digital.com.br';
        
        -- Inserir na auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            master_admin_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'suporte@o2digital.com.br',
            crypt('123456789', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Suporte O2 Digital"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- Inserir perfil
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            master_admin_id,
            'suporte@o2digital.com.br',
            'Suporte O2 Digital',
            'master_admin'::user_role,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '   ✅ Master admin criado: suporte@o2digital.com.br / 123456789';
    ELSE
        RAISE NOTICE '   ✅ Master admin já existe';
    END IF;
END $$;

-- 6. Criar cliente de teste
DO $$
DECLARE
    client_id uuid;
    client_exists boolean;
BEGIN
    RAISE NOTICE '👤 CRIANDO CLIENTE DE TESTE...';
    
    -- Verificar se já existe
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'joao@hotelexemplo.com'
    ) INTO client_exists;
    
    IF NOT client_exists THEN
        client_id := gen_random_uuid();
        
        -- Limpar da auth se existir
        DELETE FROM auth.users WHERE email = 'joao@hotelexemplo.com';
        
        -- Inserir na auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            client_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'joao@hotelexemplo.com',
            crypt('123456789', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "João Silva"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- Inserir perfil
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            hotel_name,
            created_at,
            updated_at
        ) VALUES (
            client_id,
            'joao@hotelexemplo.com',
            'João Silva',
            'client'::user_role,
            'Hotel Exemplo',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '   ✅ Cliente criado: joao@hotelexemplo.com / 123456789';
    ELSE
        RAISE NOTICE '   ✅ Cliente já existe';
    END IF;
END $$;

-- 7. Configurar RLS
DO $$
BEGIN
    RAISE NOTICE '🛡️ CONFIGURANDO RLS...';
    
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Master admin can view all profiles" ON public.profiles;

    -- Criar políticas RLS
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Master admin can view all profiles" ON public.profiles
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'master_admin'::user_role
            )
        );

    RAISE NOTICE '   ✅ Políticas RLS configuradas';
END $$;

-- 8. Criar função para criar clientes
DO $$
BEGIN
    RAISE NOTICE '⚙️ CRIANDO FUNÇÃO PARA CRIAR CLIENTES...';
    
    DROP FUNCTION IF EXISTS create_client_with_user(text, text, text, text);

    CREATE OR REPLACE FUNCTION create_client_with_user(
        p_email text,
        p_password text,
        p_full_name text,
        p_hotel_name text
    )
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
    DECLARE
        new_user_id uuid;
        result json;
    BEGIN
        -- Gerar novo UUID
        new_user_id := gen_random_uuid();
        
        -- Inserir na auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            p_email,
            crypt(p_password, gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            json_build_object('full_name', p_full_name),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- Inserir perfil
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            hotel_name,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            p_email,
            p_full_name,
            'client'::user_role,
            p_hotel_name,
            NOW(),
            NOW()
        );
        
        result := json_build_object(
            'success', true,
            'user_id', new_user_id,
            'email', p_email,
            'message', 'Cliente criado com sucesso'
        );
        
        RETURN result;
        
    EXCEPTION
        WHEN OTHERS THEN
            result := json_build_object(
                'success', false,
                'error', SQLERRM,
                'message', 'Erro ao criar cliente'
            );
            RETURN result;
    END;
    $function$;

    RAISE NOTICE '   ✅ Função create_client_with_user criada';
END $$;

-- 9. Limpar backup
DO $$
BEGIN
    DROP TABLE IF EXISTS profiles_backup;
    RAISE NOTICE '🗑️ Backup removido';
END $$;

-- 10. Verificação final
DO $$
DECLARE
    enum_values text;
    profile_count integer;
    master_count integer;
    client_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA CRIADO COM SUCESSO!';
    RAISE NOTICE '================================';
    
    -- Mostrar valores do enum
    SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder) 
    INTO enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role';
    
    RAISE NOTICE '📋 Enum user_role: %', enum_values;
    
    -- Contar perfis
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO master_count FROM public.profiles WHERE role = 'master_admin'::user_role;
    SELECT COUNT(*) INTO client_count FROM public.profiles WHERE role = 'client'::user_role;
    
    RAISE NOTICE '👥 Total de perfis: %', profile_count;
    RAISE NOTICE '👑 Master admins: %', master_count;
    RAISE NOTICE '👤 Clientes: %', client_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔑 CREDENCIAIS PARA TESTE:';
    RAISE NOTICE '   Master Admin: suporte@o2digital.com.br / 123456789';
    RAISE NOTICE '   Cliente: joao@hotelexemplo.com / 123456789';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistema pronto para uso!';
END $$;
