-- Criar sistema master admin completo
-- Este script vai criar a estrutura correta para master admin e clientes

DO $$
BEGIN
    RAISE NOTICE '🏗️ CRIANDO SISTEMA MASTER ADMIN COMPLETO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- 1. Limpar usuário master admin existente se houver
DELETE FROM auth.users WHERE email = 'suporte@o2digital.com.br';
DELETE FROM public.profiles WHERE email = 'suporte@o2digital.com.br';

-- 2. Criar usuário master admin diretamente
DO $$
DECLARE
    master_admin_id uuid;
BEGIN
    master_admin_id := gen_random_uuid();
    
    RAISE NOTICE '1. Criando usuário master admin...';
    RAISE NOTICE '   Email: suporte@o2digital.com.br';
    RAISE NOTICE '   Senha: 123456789';
    RAISE NOTICE '   ID: %', master_admin_id;
    
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
    
    RAISE NOTICE '✅ Master admin criado com sucesso!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao criar master admin: %', SQLERRM;
        RAISE NOTICE 'Isso pode ser normal se você não tiver permissões diretas na auth.users';
END $$;

-- 3. Criar tabela de clientes se não existir
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    hotel_name text NOT NULL,
    hotel_address text,
    hotel_city text,
    hotel_state text,
    hotel_country text DEFAULT 'Brasil',
    rooms_count integer DEFAULT 10,
    plan_id uuid REFERENCES subscription_plans(id),
    subscription_status text DEFAULT 'trial',
    trial_ends_at timestamptz DEFAULT NOW() + INTERVAL '7 days',
    monthly_revenue decimal(10,2) DEFAULT 0,
    total_reservations integer DEFAULT 0,
    status text DEFAULT 'active',
    notes text,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- 4. Habilitar RLS na tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 5. Criar política para master admin ver todos os clientes
CREATE POLICY "Master admin can manage all clients" ON public.clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'master_admin'
        )
    );

-- 6. Criar função para criar cliente com usuário
CREATE OR REPLACE FUNCTION create_client_with_user(
    client_name text,
    client_email text,
    client_password text,
    hotel_name text,
    hotel_city text DEFAULT NULL,
    hotel_state text DEFAULT NULL
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    new_client_id uuid;
    result json;
BEGIN
    -- Gerar IDs
    new_user_id := gen_random_uuid();
    new_client_id := gen_random_uuid();
    
    -- Criar usuário na auth.users
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
        client_email,
        crypt(client_password, gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        format('{"full_name": "%s", "user_role": "client", "hotel_name": "%s"}', client_name, hotel_name)::json,
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Criar perfil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        client_email,
        client_name,
        'client',
        NOW(),
        NOW()
    );
    
    -- Criar registro na tabela clients
    INSERT INTO public.clients (
        id,
        name,
        email,
        hotel_name,
        hotel_city,
        hotel_state,
        created_at,
        updated_at
    ) VALUES (
        new_client_id,
        client_name,
        client_email,
        hotel_name,
        hotel_city,
        hotel_state,
        NOW(),
        NOW()
    );
    
    -- Criar hotel para o cliente
    INSERT INTO public.hotels (
        id,
        name,
        owner_id,
        city,
        state,
        subscription_plan_id,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        hotel_name,
        new_user_id,
        hotel_city,
        hotel_state,
        (SELECT id FROM subscription_plans WHERE name = 'Básico' LIMIT 1),
        NOW(),
        NOW()
    );
    
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'client_id', new_client_id,
        'email', client_email,
        'message', 'Cliente criado com sucesso'
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erro ao criar cliente'
        );
END;
$$;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA MASTER ADMIN CRIADO!';
    RAISE NOTICE '';
    RAISE NOTICE '👤 CREDENCIAIS MASTER ADMIN:';
    RAISE NOTICE '   📧 Email: suporte@o2digital.com.br';
    RAISE NOTICE '   🔑 Senha: 123456789';
    RAISE NOTICE '   🎯 Tipo: master_admin';
    RAISE NOTICE '';
    RAISE NOTICE '🏗️ ESTRUTURA CRIADA:';
    RAISE NOTICE '   ✅ Tabela clients';
    RAISE NOTICE '   ✅ Políticas RLS';
    RAISE NOTICE '   ✅ Função create_client_with_user()';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Faça login como master admin';
    RAISE NOTICE '2. Use a função para criar clientes';
    RAISE NOTICE '3. Clientes poderão fazer login normalmente';
    RAISE NOTICE '';
END $$;
