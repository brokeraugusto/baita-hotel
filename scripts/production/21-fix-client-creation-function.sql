-- Corrigir função de criação de cliente
DO $$
BEGIN
    RAISE NOTICE '🔧 CORRIGINDO FUNÇÃO DE CRIAÇÃO DE CLIENTE';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
END $$;

-- 1. Remover função antiga
DROP FUNCTION IF EXISTS create_client_with_user(text, text, text, text, text, text);

-- 2. Criar função corrigida
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
    new_hotel_id uuid;
    result json;
BEGIN
    -- Gerar IDs
    new_user_id := gen_random_uuid();
    new_client_id := gen_random_uuid();
    new_hotel_id := gen_random_uuid();
    
    -- Verificar se email já existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = client_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Email já cadastrado',
            'message', 'Este email já está em uso'
        );
    END IF;
    
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
        hotel_name,
        hotel_id,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        client_email,
        client_name,
        'client'::user_role,  -- Cast explícito para o enum
        hotel_name,
        new_hotel_id,
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
        created_at,
        updated_at
    ) VALUES (
        new_hotel_id,
        hotel_name,
        new_user_id,
        hotel_city,
        hotel_state,
        NOW(),
        NOW()
    );
    
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'client_id', new_client_id,
        'hotel_id', new_hotel_id,
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

RAISE NOTICE '✅ Função create_client_with_user corrigida';

-- 3. Testar a função corrigida
DO $$
DECLARE
    test_result json;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTANDO FUNÇÃO CORRIGIDA...';
    
    -- Limpar cliente de teste anterior se existir
    DELETE FROM auth.users WHERE email = 'joao@hotelexemplo.com';
    DELETE FROM public.profiles WHERE email = 'joao@hotelexemplo.com';
    DELETE FROM public.clients WHERE email = 'joao@hotelexemplo.com';
    
    -- Criar cliente de teste
    SELECT create_client_with_user(
        'João Silva',
        'joao@hotelexemplo.com',
        '123456789',
        'Hotel Exemplo',
        'São Paulo',
        'SP'
    ) INTO test_result;
    
    RAISE NOTICE 'Resultado: %', test_result;
    
    IF (test_result->>'success')::boolean THEN
        RAISE NOTICE '✅ TESTE PASSOU! Cliente criado com sucesso';
    ELSE
        RAISE NOTICE '❌ TESTE FALHOU: %', test_result->>'error';
    END IF;
    
END $$;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 FUNÇÃO CORRIGIDA E TESTADA!';
    RAISE NOTICE '';
    RAISE NOTICE '👤 CREDENCIAIS PARA TESTE:';
    RAISE NOTICE '   Master Admin: suporte@o2digital.com.br / 123456789';
    RAISE NOTICE '   Cliente: joao@hotelexemplo.com / 123456789';
    RAISE NOTICE '';
END $$;
