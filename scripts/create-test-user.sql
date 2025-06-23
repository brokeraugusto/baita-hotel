-- Criar usuário de teste se não existir

-- Verificar se o usuário já existe
DO $$
DECLARE
    user_exists boolean;
BEGIN
    -- Verificar se já existe um perfil com este email
    SELECT EXISTS(
        SELECT 1 FROM profiles WHERE email = 'admin@baitahotel.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Inserir usuário de teste
        INSERT INTO profiles (
            id,
            email,
            name,
            role,
            hotel_name,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'admin@baitahotel.com',
            'Admin Baita Hotel',
            'client',
            'Hotel Baita Demo',
            true,
            now(),
            now()
        );
        
        RAISE NOTICE '✅ Usuário de teste criado: admin@baitahotel.com';
    ELSE
        RAISE NOTICE '👤 Usuário de teste já existe: admin@baitahotel.com';
    END IF;
END $$;

-- Verificar dados criados
SELECT 
    id,
    email,
    name,
    role,
    hotel_name,
    is_active,
    created_at
FROM profiles 
WHERE email = 'admin@baitahotel.com';
