-- Limpar dados existentes e criar usuário de teste simples
-- Este script garante que temos um usuário master admin funcional

-- Primeiro, vamos verificar se a tabela profiles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'Tabela profiles não existe. Execute primeiro os scripts de criação do banco.';
    END IF;
END $$;

-- Limpar usuários existentes para evitar conflitos
DELETE FROM profiles WHERE email IN ('admin@baitahotel.com', 'suporte@o2digital.com.br');

-- Criar usuário master admin de teste
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
    'admin123', -- Em produção, use hash real
    '+55 11 99999-9999',
    'America/Sao_Paulo',
    'pt-BR',
    NOW(),
    NOW()
);

-- Criar usuário de suporte também
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

-- Verificar se os usuários foram criados
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles WHERE user_role = 'master_admin' AND is_active = true;
    
    IF user_count >= 2 THEN
        RAISE NOTICE '✅ Usuários master admin criados com sucesso! Total: %', user_count;
    ELSE
        RAISE EXCEPTION '❌ Falha ao criar usuários master admin. Total encontrado: %', user_count;
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
WHERE user_role = 'master_admin' 
ORDER BY created_at DESC;

-- Teste rápido de login
DO $$
DECLARE
    test_user RECORD;
BEGIN
    -- Teste login admin@baitahotel.com
    SELECT * INTO test_user 
    FROM profiles 
    WHERE email = 'admin@baitahotel.com' 
    AND password_hash = 'admin123' 
    AND is_active = true;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Teste de login admin@baitahotel.com: SUCESSO';
    ELSE
        RAISE NOTICE '❌ Teste de login admin@baitahotel.com: FALHOU';
    END IF;
    
    -- Teste login suporte@o2digital.com.br
    SELECT * INTO test_user 
    FROM profiles 
    WHERE email = 'suporte@o2digital.com.br' 
    AND password_hash = 'LaVi121888!' 
    AND is_active = true;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Teste de login suporte@o2digital.com.br: SUCESSO';
    ELSE
        RAISE NOTICE '❌ Teste de login suporte@o2digital.com.br: FALHOU';
    END IF;
END $$;

-- Informações finais
SELECT 
    '=== CREDENCIAIS DE TESTE ===' as info
UNION ALL
SELECT 'Email: admin@baitahotel.com | Senha: admin123'
UNION ALL
SELECT 'Email: suporte@o2digital.com.br | Senha: LaVi121888!'
UNION ALL
SELECT '=== FIM DAS CREDENCIAIS ===';
