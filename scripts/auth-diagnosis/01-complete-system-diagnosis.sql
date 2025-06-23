-- Diagnóstico completo do sistema de autenticação
-- Este script verifica todas as tabelas, funções e dados relacionados ao auth

-- 1. Verificar todas as tabelas relacionadas a usuários
SELECT 'TABELAS RELACIONADAS A USUÁRIOS:' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%user%' 
   OR table_name ILIKE '%profile%' 
   OR table_name ILIKE '%auth%'
   OR table_name ILIKE '%login%'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela profiles
SELECT 'ESTRUTURA DA TABELA PROFILES:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Verificar todos os usuários existentes
SELECT 'USUÁRIOS EXISTENTES:' as info;

SELECT 
    id,
    email,
    full_name,
    user_role,
    is_active,
    password_hash,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- 4. Verificar funções relacionadas a autenticação
SELECT 'FUNÇÕES DE AUTENTICAÇÃO:' as info;

SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name ILIKE '%auth%' 
   OR routine_name ILIKE '%login%' 
   OR routine_name ILIKE '%user%'
   OR routine_name ILIKE '%verify%'
ORDER BY routine_name;

-- 5. Testar consulta direta para login
SELECT 'TESTE DE CONSULTA DIRETA:' as info;

-- Teste com admin@baitahotel.com
SELECT 
    'Teste admin@baitahotel.com' as teste,
    email,
    password_hash,
    user_role,
    is_active
FROM profiles 
WHERE email = 'admin@baitahotel.com';

-- Teste com suporte@o2digital.com.br
SELECT 
    'Teste suporte@o2digital.com.br' as teste,
    email,
    password_hash,
    user_role,
    is_active
FROM profiles 
WHERE email = 'suporte@o2digital.com.br';

-- 6. Verificar se há outras tabelas de usuários
SELECT 'OUTRAS TABELAS POSSÍVEIS:' as info;

SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND (
    table_name ILIKE '%admin%' 
    OR table_name ILIKE '%client%'
    OR table_name ILIKE '%master%'
  )
ORDER BY table_name;

-- 7. Verificar triggers na tabela profiles
SELECT 'TRIGGERS NA TABELA PROFILES:' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 8. Verificar constraints
SELECT 'CONSTRAINTS DA TABELA PROFILES:' as info;

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';
