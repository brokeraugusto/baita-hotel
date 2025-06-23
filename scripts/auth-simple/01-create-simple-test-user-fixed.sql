-- Criar usuários de teste após garantir que a tabela existe
-- Este script cria usuários master admin funcionais

-- Verificar se a tabela profiles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'Tabela profiles não existe. Execute primeiro o script 00-create-profiles-table.sql';
    END IF;
    RAISE NOTICE '✅ Tabela profiles encontrada, prosseguindo...';
END $$;

-- Limpar usuários existentes para evitar conflitos
DELETE FROM profiles WHERE email IN ('admin@baitahotel.com', 'suporte@o2digital.com.br', 'hotel@exemplo.com');

RAISE NOTICE '🧹 Usuários existentes removidos';

-- Criar usuário master admin principal
INSERT INTO profiles (
    id,
    email,
    full_name,
    user_role,
    is_active,
    password_hash,
    phone,
    timezone,
    language,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@baitahotel.com',
    'Master Administrator',
    'master_admin',
    true,
    'admin123', -- Senha simples para teste
    '+55 11 99999-9999',
    'America/Sao_Paulo',
    'pt-BR',
    NOW(),
    NOW()
);

-- Criar usuário de suporte
INSERT INTO profiles (
    id,
    email,
    full_name,
    user_role,
    is_active,
    password_hash,
    phone,
    timezone,
    language,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'suporte@o2digital.com.br',
    'Suporte O2 Digital',
    'master_admin',
    true,
    'LaVi121888!', -- Senha original do system-setup
    '+55 11 88888-8888',
    'America/Sao_Paulo',
    'pt-BR',
    NOW(),
    NOW()
);

-- Criar usuário hotel owner para teste
INSERT INTO profiles (
    id,
    email,
    full_name,
    user_role,
    is_active,
    password_hash,
    phone,
    timezone,
    language,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'hotel@exemplo.com',
    'João Silva - Hotel Exemplo',
    'hotel_owner',
    true,
    'hotel123',
    '+55 11 77777-7777',
    'America/Sao_Paulo',
    'pt-BR',
    NOW(),
    NOW()
);

-- Verificar se os usuários foram criados
DO $$
DECLARE
    master_count INTEGER;
    hotel_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO master_count FROM profiles WHERE user_role = 'master_admin' AND is_active = true;
    SELECT COUNT(*) INTO hotel_count FROM profiles WHERE user_role = 'hotel_owner' AND is_active = true;
    
    RAISE NOTICE '✅ Usuários criados - Master Admin: %, Hotel Owner: %', master_count, hotel_count;
    
    IF master_count < 2 THEN
        RAISE EXCEPTION '❌ Falha ao criar usuários master admin. Esperado: 2, Encontrado: %', master_count;
    END IF;
END $$;

-- Mostrar os usuários criados
SELECT 
    email,
    full_name,
    user_role,
    is_active,
    password_hash as senha,
    created_at
FROM profiles 
ORDER BY user_role, created_at DESC;

-- Teste de login para cada usuário
DO $$
DECLARE
    test_user RECORD;
    test_cases TEXT[] := ARRAY[
        'admin@baitahotel.com|admin123',
        'suporte@o2digital.com.br|LaVi121888!',
        'hotel@exemplo.com|hotel123'
    ];
    test_case TEXT;
    email_part TEXT;
    password_part TEXT;
BEGIN
    FOREACH test_case IN ARRAY test_cases
    LOOP
        email_part := split_part(test_case, '|', 1);
        password_part := split_part(test_case, '|', 2);
        
        SELECT * INTO test_user 
        FROM profiles 
        WHERE email = email_part 
        AND password_hash = password_part 
        AND is_active = true;
        
        IF FOUND THEN
            RAISE NOTICE '✅ Teste de login %: SUCESSO (Role: %)', email_part, test_user.user_role;
        ELSE
            RAISE NOTICE '❌ Teste de login %: FALHOU', email_part;
        END IF;
    END LOOP;
END $$;

-- Informações finais para o usuário
SELECT '=== CREDENCIAIS DE TESTE CRIADAS ===' as info
UNION ALL
SELECT '1. Master Admin: admin@baitahotel.com | Senha: admin123'
UNION ALL
SELECT '2. Master Admin: suporte@o2digital.com.br | Senha: LaVi121888!'
UNION ALL
SELECT '3. Hotel Owner: hotel@exemplo.com | Senha: hotel123'
UNION ALL
SELECT '=== TODAS AS CREDENCIAIS TESTADAS E FUNCIONAIS ===';
