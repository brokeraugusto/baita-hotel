-- Limpar usuários duplicados ou problemáticos
-- Execute apenas se necessário

DO $$
DECLARE
    user_count INTEGER;
BEGIN
    RAISE NOTICE '🧹 LIMPEZA DE USUÁRIOS PROBLEMÁTICOS';
    RAISE NOTICE '===================================';
    RAISE NOTICE '';
    
    -- Contar usuários na auth.users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE 'Total de usuários encontrados: %', user_count;
    
    -- Se houver muitos usuários de teste, oferecer limpeza
    IF user_count > 10 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  ATENÇÃO: Encontrados muitos usuários de teste';
        RAISE NOTICE 'Se quiser limpar usuários de teste, execute:';
        RAISE NOTICE '';
        RAISE NOTICE 'DELETE FROM auth.users WHERE email LIKE ''%test%'' OR email LIKE ''%demo%'';';
        RAISE NOTICE 'DELETE FROM public.profiles WHERE email LIKE ''%test%'' OR email LIKE ''%demo%'';';
        RAISE NOTICE '';
    END IF;
    
    -- Mostrar usuários recentes
    RAISE NOTICE 'Últimos usuários criados:';
    FOR rec IN (
        SELECT email, created_at, email_confirmed_at IS NOT NULL as confirmed
        FROM auth.users 
        ORDER BY created_at DESC 
        LIMIT 5
    ) LOOP
        RAISE NOTICE '  📧 % | % | Confirmado: %', 
            rec.email, 
            rec.created_at::timestamp(0), 
            CASE WHEN rec.confirmed THEN 'Sim' ELSE 'Não' END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Diagnóstico de limpeza concluído';
    
END $$;
