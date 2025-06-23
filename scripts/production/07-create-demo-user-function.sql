-- Função para criar usuário de demonstração (apenas para desenvolvimento)

CREATE OR REPLACE FUNCTION create_demo_user()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_user_id UUID;
    demo_hotel_id UUID;
    result_text TEXT;
BEGIN
    -- Verificar se já existe usuário demo
    SELECT id INTO demo_user_id 
    FROM profiles 
    WHERE email = 'demo@baitahotel.com' 
    LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        RETURN '⚠️ Usuário demo já existe!';
    END IF;
    
    -- Gerar ID para o usuário demo
    demo_user_id := gen_random_uuid();
    
    -- Inserir usuário demo diretamente na tabela auth.users (APENAS PARA DEMO)
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        demo_user_id,
        'demo@baitahotel.com',
        crypt('demo123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Usuário Demo"}'
    );
    
    -- Criar perfil do usuário
    INSERT INTO profiles (
        id,
        email,
        full_name,
        role
    ) VALUES (
        demo_user_id,
        'demo@baitahotel.com',
        'Usuário Demo',
        'hotel_admin'
    );
    
    -- Criar hotel demo
    INSERT INTO hotels (
        id,
        name,
        description,
        owner_id,
        city,
        state,
        subscription_plan_id
    ) VALUES (
        gen_random_uuid(),
        'Hotel Demo',
        'Hotel de demonstração do sistema',
        demo_user_id,
        'São Paulo',
        'SP',
        (SELECT id FROM subscription_plans WHERE name = 'Básico' LIMIT 1)
    ) RETURNING id INTO demo_hotel_id;
    
    -- Criar categoria de quarto
    INSERT INTO room_categories (
        hotel_id,
        name,
        description,
        base_price,
        max_occupancy
    ) VALUES (
        demo_hotel_id,
        'Standard',
        'Quarto padrão',
        150.00,
        2
    );
    
    -- Criar alguns quartos
    INSERT INTO rooms (hotel_id, category_id, number, floor)
    SELECT 
        demo_hotel_id,
        rc.id,
        '10' || generate_series(1,5),
        1
    FROM room_categories rc
    WHERE rc.hotel_id = demo_hotel_id;
    
    result_text := '✅ Usuário demo criado com sucesso!' || chr(10) ||
                   '📧 Email: demo@baitahotel.com' || chr(10) ||
                   '🔑 Senha: demo123' || chr(10) ||
                   '🏨 Hotel: Hotel Demo' || chr(10) ||
                   '🏠 Quartos: 101-105 criados';
    
    RETURN result_text;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN '❌ Erro ao criar usuário demo: ' || SQLERRM;
END;
$$;

-- Executar a função para criar o usuário demo
SELECT create_demo_user();
