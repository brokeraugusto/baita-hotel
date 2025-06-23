-- Corrigir enums e estrutura das tabelas
DO $$
BEGIN
    RAISE NOTICE '🔧 CORRIGINDO ENUMS E ESTRUTURA';
    RAISE NOTICE '==============================';
    RAISE NOTICE '';
END $$;

-- 1. Remover enum user_role se existir
DO $$
BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    RAISE NOTICE '🗑️ Enum user_role removido (se existia)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao remover enum: %', SQLERRM;
END $$;

-- 2. Criar enum user_role correto
CREATE TYPE user_role AS ENUM ('client', 'master_admin', 'hotel_staff');
RAISE NOTICE '✅ Enum user_role criado com valores: client, master_admin, hotel_staff';

-- 3. Recriar tabela profiles com estrutura correta
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

-- 4. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
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

RAISE NOTICE '✅ Políticas RLS criadas';

-- 6. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✅ Trigger updated_at criado';

-- 7. Recriar master admin
DO $$
DECLARE
    master_admin_id uuid;
BEGIN
    master_admin_id := gen_random_uuid();
    
    RAISE NOTICE '👤 Criando master admin...';
    
    -- Limpar usuário existente
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
        '{"full_name": "Suporte O2 Digital", "user_role": "master_admin"}',
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
        'master_admin',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Master admin criado: suporte@o2digital.com.br / 123456789';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao criar master admin: %', SQLERRM;
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORREÇÃO CONCLUÍDA!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Enum user_role corrigido';
    RAISE NOTICE '✅ Tabela profiles recriada';
    RAISE NOTICE '✅ Master admin criado';
    RAISE NOTICE '';
END $$;
