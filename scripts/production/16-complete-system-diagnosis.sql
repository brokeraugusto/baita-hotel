-- Diagnóstico completo do sistema
-- Este script vai mostrar TUDO que está acontecendo

DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNÓSTICO COMPLETO DO SISTEMA';
    RAISE NOTICE '==================================';
    RAISE NOTICE '';
END $$;

-- 1. Verificar usuários na auth.users
SELECT 
    'USUÁRIOS EM AUTH.USERS' as section,
    COUNT(*) as total
FROM auth.users;

SELECT 
    email,
    created_at::date as criado,
    email_confirmed_at IS NOT NULL as confirmado,
    last_sign_in_at::date as ultimo_login
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar perfis na profiles
SELECT 
    'PERFIS EM PROFILES' as section,
    COUNT(*) as total
FROM public.profiles;

SELECT 
    email,
    full_name,
    role,
    created_at::date as criado
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Verificar usuários sem perfil
SELECT 
    'USUÁRIOS SEM PERFIL' as section,
    COUNT(*) as total
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Mostrar usuários sem perfil
SELECT 
    u.email,
    u.created_at::date as criado_auth,
    'SEM PERFIL' as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Verificar triggers
SELECT 
    'TRIGGERS ATIVOS' as section,
    COUNT(*) as total
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name = 'on_auth_user_created';

-- 5. Verificar estrutura das tabelas principais
SELECT 
    'TABELAS PRINCIPAIS' as section,
    table_name,
    'EXISTE' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'hotels', 'subscription_plans', 'clients')
ORDER BY table_name;

-- 6. Verificar se existe sistema master/client separado
SELECT 
    'TABELA CLIENTS' as section,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'clients'
    ) THEN 'EXISTE' ELSE 'NÃO EXISTE' END as status;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 DIAGNÓSTICO CONCLUÍDO!';
    RAISE NOTICE 'Analise os resultados acima para entender a estrutura atual';
    RAISE NOTICE '';
END $$;
