-- Criar o primeiro Master Admin manualmente
-- IMPORTANTE: Altere a senha antes de executar!

DO $$
DECLARE
    result JSON;
BEGIN
    -- Criar primeiro Master Admin
    SELECT create_first_master_admin(
        'admin@baitahotel.com',           -- Email (altere se necessário)
        'Administrador Master',           -- Nome completo
        'MasterAdmin2024!'                -- Senha (ALTERE ESTA SENHA!)
    ) INTO result;

    -- Mostrar resultado
    RAISE NOTICE 'Resultado: %', result;

    -- Verificar se foi criado
    IF (result->>'success')::boolean THEN
        RAISE NOTICE '✅ Master Admin criado com sucesso!';
        RAISE NOTICE 'Email: admin@baitahotel.com';
        RAISE NOTICE 'Senha: MasterAdmin2024!';
        RAISE NOTICE '⚠️  ALTERE A SENHA IMEDIATAMENTE APÓS O PRIMEIRO LOGIN!';
    ELSE
        RAISE NOTICE '❌ Erro ao criar Master Admin: %', result->>'error';
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

-- Verificar função de verificação
SELECT has_master_admin() as has_admin;
