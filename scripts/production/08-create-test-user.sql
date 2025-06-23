-- Criar usuário de teste para desenvolvimento
-- ATENÇÃO: Use apenas em ambiente de desenvolvimento!

DO $$
DECLARE
    test_user_id uuid;
    test_hotel_id uuid;
BEGIN
    -- Gerar IDs únicos
    test_user_id := gen_random_uuid();
    test_hotel_id := gen_random_uuid();
    
    RAISE NOTICE 'Criando usuário de teste...';
    RAISE NOTICE 'User ID: %', test_user_id;
    RAISE NOTICE 'Hotel ID: %', test_hotel_id;
    
    -- 1. Inserir usuário na tabela auth.users (simulando registro via Supabase Auth)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        test_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@baitahotel.com',
        crypt('123456789', gen_salt('bf')), -- Senha: 123456789
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Admin Baita Hotel"}',
        FALSE,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        FALSE,
        NULL
    ) ON CONFLICT (id) DO NOTHING;
    
    -- 2. Criar perfil do usuário
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        user_role,
        hotel_name,
        hotel_address,
        subscription_status,
        subscription_plan,
        subscription_end_date,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'admin@baitahotel.com',
        'Admin Baita Hotel',
        'master_admin',
        'Hotel Baita Demo',
        'Rua das Flores, 123 - Centro',
        'active',
        'premium',
        NOW() + INTERVAL '1 year',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        user_role = EXCLUDED.user_role,
        hotel_name = EXCLUDED.hotel_name,
        hotel_address = EXCLUDED.hotel_address,
        subscription_status = EXCLUDED.subscription_status,
        subscription_plan = EXCLUDED.subscription_plan,
        subscription_end_date = EXCLUDED.subscription_end_date,
        updated_at = NOW();
    
    -- 3. Criar hotel de exemplo
    INSERT INTO public.hotels (
        id,
        owner_id,
        name,
        address,
        phone,
        email,
        website,
        description,
        amenities,
        settings,
        created_at,
        updated_at
    ) VALUES (
        test_hotel_id,
        test_user_id,
        'Hotel Baita Demo',
        'Rua das Flores, 123 - Centro, Cidade - Estado',
        '(11) 99999-9999',
        'contato@baitahotel.com',
        'https://baitahotel.com',
        'Hotel de demonstração para testes do sistema',
        '["wifi", "piscina", "estacionamento", "cafe_manha", "ar_condicionado"]'::jsonb,
        '{"check_in": "14:00", "check_out": "12:00", "currency": "BRL", "timezone": "America/Sao_Paulo"}'::jsonb,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        description = EXCLUDED.description,
        amenities = EXCLUDED.amenities,
        settings = EXCLUDED.settings,
        updated_at = NOW();
    
    -- 4. Criar quartos de exemplo
    INSERT INTO public.rooms (
        hotel_id,
        room_number,
        room_type,
        capacity,
        price_per_night,
        description,
        status,
        amenities
    ) VALUES 
    (test_hotel_id, '101', 'Standard', 2, 150.00, 'Quarto padrão com vista para o jardim', 'available', '["tv", "frigobar", "ar_condicionado"]'::jsonb),
    (test_hotel_id, '102', 'Standard', 2, 150.00, 'Quarto padrão com vista para a rua', 'available', '["tv", "frigobar", "ar_condicionado"]'::jsonb),
    (test_hotel_id, '201', 'Deluxe', 3, 250.00, 'Quarto deluxe com varanda', 'available', '["tv", "frigobar", "ar_condicionado", "varanda"]'::jsonb),
    (test_hotel_id, '301', 'Suite', 4, 400.00, 'Suíte master com jacuzzi', 'available', '["tv", "frigobar", "ar_condicionado", "jacuzzi", "varanda"]'::jsonb)
    ON CONFLICT (hotel_id, room_number) DO NOTHING;
    
    -- 5. Verificar se tudo foi criado
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) AND
       EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) AND
       EXISTS (SELECT 1 FROM public.hotels WHERE id = test_hotel_id) THEN
        
        RAISE NOTICE '✅ USUÁRIO DE TESTE CRIADO COM SUCESSO!';
        RAISE NOTICE '';
        RAISE NOTICE '📧 Email: admin@baitahotel.com';
        RAISE NOTICE '🔑 Senha: 123456789';
        RAISE NOTICE '👤 Tipo: Master Admin';
        RAISE NOTICE '🏨 Hotel: Hotel Baita Demo';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 Agora você pode fazer login no sistema!';
        
    ELSE
        RAISE EXCEPTION 'Erro ao criar usuário de teste';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao criar usuário de teste: %', SQLERRM;
        RAISE NOTICE 'Isso pode acontecer se você não tiver permissões para inserir na tabela auth.users';
        RAISE NOTICE 'Neste caso, use o cadastro normal via interface da aplicação';
END $$;
