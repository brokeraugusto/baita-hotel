-- Diagnosticar problemas com enums e estrutura
DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNÓSTICO DE ENUMS E ESTRUTURA';
    RAISE NOTICE '==================================';
    RAISE NOTICE '';
END $$;

-- 1. Verificar enums existentes
DO $$
DECLARE
    enum_record RECORD;
BEGIN
    RAISE NOTICE '📋 ENUMS EXISTENTES:';
    FOR enum_record IN 
        SELECT t.typname as enum_name, e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        ORDER BY t.typname, e.enumsortorder
    LOOP
        RAISE NOTICE '   %: %', enum_record.enum_name, enum_record.enum_value;
    END LOOP;
    RAISE NOTICE '';
END $$;

-- 2. Verificar estrutura da tabela profiles
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '🏗️ ESTRUTURA DA TABELA PROFILES:';
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '   %: % (nullable: %, default: %)', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable, 
            COALESCE(col_record.column_default, 'NULL');
    END LOOP;
    RAISE NOTICE '';
END $$;

-- 3. Verificar dados existentes na tabela profiles
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    RAISE NOTICE '👥 PERFIS EXISTENTES:';
    FOR profile_record IN 
        SELECT id, email, full_name, role, created_at
        FROM public.profiles
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        RAISE NOTICE '   ID: % | Email: % | Nome: % | Role: % | Criado: %', 
            profile_record.id, 
            profile_record.email, 
            COALESCE(profile_record.full_name, 'NULL'),
            COALESCE(profile_record.role, 'NULL'),
            profile_record.created_at;
    END LOOP;
    RAISE NOTICE '';
END $$;

-- 4. Verificar constraints da tabela profiles
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    RAISE NOTICE '🔒 CONSTRAINTS DA TABELA PROFILES:';
    FOR constraint_record IN 
        SELECT conname, contype, pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'public.profiles'::regclass
    LOOP
        RAISE NOTICE '   %: %', constraint_record.conname, constraint_record.definition;
    END LOOP;
    RAISE NOTICE '';
END $$;

DO $$
BEGIN
    RAISE NOTICE '✅ DIAGNÓSTICO CONCLUÍDO!';
    RAISE NOTICE '';
END $$;
