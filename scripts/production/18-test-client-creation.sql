-- Testar criação de cliente
-- Este script cria um cliente de exemplo

DO $$
BEGIN
    RAISE NOTICE '🧪 TESTANDO CRIAÇÃO DE CLIENTE';
    RAISE NOTICE '=============================';
    RAISE NOTICE '';
END $$;

-- Criar cliente de teste
SELECT create_client_with_user(
    'João Silva',                    -- nome do cliente
    'joao@hotelexemplo.com',        -- email do cliente
    '123456789',                     -- senha do cliente
    'Hotel Exemplo',                 -- nome do hotel
    'São Paulo',                     -- cidade
    'SP'                            -- estado
) as resultado;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TESTE DE CRIAÇÃO CONCLUÍDO!';
    RAISE NOTICE '';
    RAISE NOTICE '👤 CLIENTE DE TESTE CRIADO:';
    RAISE NOTICE '   📧 Email: joao@hotelexemplo.com';
    RAISE NOTICE '   🔑 Senha: 123456789';
    RAISE NOTICE '   🎯 Tipo: client';
    RAISE NOTICE '   🏨 Hotel: Hotel Exemplo';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 AGORA VOCÊ PODE:';
    RAISE NOTICE '1. Login como master admin: suporte@o2digital.com.br';
    RAISE NOTICE '2. Login como cliente: joao@hotelexemplo.com';
    RAISE NOTICE '3. Criar mais clientes via interface ou função SQL';
    RAISE NOTICE '';
END $$;
