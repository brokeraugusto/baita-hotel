-- Criar o primeiro Master Admin
-- Execute este script APÓS o script 00-diagnose-and-create-structure.sql

DO $$
DECLARE
    result JSON;
    admin_email VARCHAR(255) := 'admin@baitahotel.com';
    admin_name VARCHAR(255) := 'Administrador Master';
    admin_password VARCHAR(255) := 'MasterAdmin2024!';
BEGIN
    RAISE NOTICE '=== CRIANDO PRIMEIRO MASTER ADMIN ===';
    
    -- Verificar se a tabela existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'master_admins') THEN
        RAISE EXCEPTION 'Tabela master_admins não existe. Execute o script 00-diagnose-and-create-structure.sql primeiro.';
    END IF;
    
    -- Criar primeiro Master Admin
    SELECT create_first_master_admin(admin_email, admin_name, admin_password) INTO result;
    
    -- Mostrar resultado
    RAISE NOTICE 'Resultado: %', result;
    
    -- Verificar se foi criado com sucesso
    IF (result->>'success')::boolean THEN
        RAISE NOTICE '✅ MASTER ADMIN CRIADO COM SUCESSO!';
        RAISE NOTICE '📧 Email: %', admin_email;
        RAISE NOTICE '🔑 Senha: %', admin_password;
        RAISE NOTICE '👤 Nome: %', admin_name;
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  IMPORTANTE:';
        RAISE NOTICE '   1. Anote essas credenciais';
        RAISE NOTICE '   2. Altere a senha após o primeiro login';
        RAISE NOTICE '   3. Acesse: /master/login';
    ELSE
        RAISE NOTICE '❌ ERRO: %', result->>'error';
    END IF;
    
END $$;

-- Verificar Master Admin criado
SELECT 
    id,
    email,
    full_name,
    is_active,
    created_at
FROM master_admins
WHERE is_active = true;
