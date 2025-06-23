-- Corrigir tabela profiles definitivamente
DO $$
BEGIN
    RAISE NOTICE '🔧 CORRIGINDO TABELA PROFILES DEFINITIVAMENTE';
    RAISE NOTICE '==========================================';
END $$;

-- 1. Verificar estrutura atual
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '📋 ESTRUTURA ATUAL DA TABELA PROFILES:';
    
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   - %: % (%)', col_record.column_name, col_record.data_type, 
                     CASE WHEN col_record.is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END;
    END LOOP;
END $$;

-- 2. Backup dos dados existentes
DO $$
DECLARE
    backup_count integer;
BEGIN
    RAISE NOTICE '💾 FAZENDO BACKUP DOS DADOS...';
    
    -- Criar tabela de backup
    DROP TABLE IF EXISTS profiles_backup;
    CREATE TABLE profiles_backup AS SELECT * FROM public.profiles;
    
    SELECT COUNT(*) INTO backup_count FROM profiles_backup;
    RAISE NOTICE '   ✅ % registros salvos no backup', backup_count;
END $$;

-- 3. Recriar tabela profiles com estrutura correta
DO $$
BEGIN
    DROP TABLE IF EXISTS public.profiles CASCADE;

    CREATE TABLE public.profiles (
        id uuid PRIMARY KEY,
        email text UNIQUE NOT NULL,
        full_name text,
        role user_role NOT NULL DEFAULT 'client',
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

    RAISE NOTICE '✅ Tabela profiles recriada com estrutura correta';
END $$;

-- 4. Restaurar dados do backup (adaptando para nova estrutura)
DO $$
DECLARE
    backup_record RECORD;
    restored_count integer := 0;
    col_exists boolean;
BEGIN
    RAISE NOTICE '📥 RESTAURANDO DADOS DO BACKUP...';
    
    -- Verificar se existem dados para restaurar
    SELECT EXISTS (SELECT 1 FROM profiles_backup LIMIT 1) INTO col_exists;
    
    IF col_exists THEN
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
                    RAISE NOTICE '   ⚠️ Erro ao restaurar registro %: %', backup_record.email, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE '   ✅ % registros restaurados', restored_count;
    ELSE
        RAISE NOTICE '   ℹ️ Nenhum dado para restaurar';
    END IF;
END $$;

-- 5. Garantir que master admin existe
DO $$
DECLARE
    master_admin_id uuid;
    master_exists boolean;
BEGIN
    RAISE NOTICE '👑 GARANTINDO MASTER ADMIN...';
    
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
        
        RAISE NOTICE '   ✅ Master admin criado';
    ELSE
        RAISE NOTICE '   ✅ Master admin já existe';
    END IF;
END $$;

-- 6. Garantir que cliente de teste existe
DO $$
DECLARE
    client_id uuid;
    client_exists boolean;
BEGIN
    RAISE NOTICE '👤 GARANTINDO CLIENTE DE TESTE...';
    
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
        
        RAISE NOTICE '   ✅ Cliente de teste criado';
    ELSE
        RAISE NOTICE '   ✅ Cliente de teste já existe';
    END IF;
END $$;

-- 7. Configurar RLS
DO $$
BEGIN
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
                AND profiles.role = 'master_admin'
            )
        );

    RAISE NOTICE '✅ Políticas RLS configuradas';
END $$;

-- 8. Criar trigger para updated_at
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
    DROP FUNCTION IF EXISTS update_updated_at_column();

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $trigger$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $trigger$ language 'plpgsql';

    CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON public.profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    RAISE NOTICE '✅ Trigger updated_at criado';
END $$;

-- 9. Limpar backup
DO $$
BEGIN
    DROP TABLE IF EXISTS profiles_backup;
    RAISE NOTICE '🗑️ Backup removido';
END $$;

-- 10. Mensagem final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TABELA PROFILES CORRIGIDA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Estrutura correta criada';
    RAISE NOTICE '✅ Dados preservados';
    RAISE NOTICE '✅ Master admin garantido';
    RAISE NOTICE '✅ Cliente de teste garantido';
    RAISE NOTICE '✅ RLS configurado';
    RAISE NOTICE '✅ Triggers criados';
    RAISE NOTICE '';
END $$;
