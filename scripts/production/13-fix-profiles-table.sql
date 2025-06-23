-- Corrigir estrutura da tabela profiles
-- Adicionar colunas que faltam e corrigir tipos

DO $$
BEGIN
    RAISE NOTICE '🔧 CORRIGINDO ESTRUTURA DA TABELA PROFILES';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
END $$;

-- Verificar e adicionar colunas que faltam
DO $$
BEGIN
    -- Adicionar coluna user_role se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_role') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
            RAISE NOTICE '➕ Adicionando coluna user_role...';
            ALTER TABLE public.profiles ADD COLUMN user_role user_role DEFAULT 'client';
        ELSE
            RAISE NOTICE '➕ Renomeando coluna role para user_role...';
            ALTER TABLE public.profiles RENAME COLUMN role TO user_role;
        END IF;
    ELSE
        RAISE NOTICE '✅ Coluna user_role já existe';
    END IF;
    
    -- Adicionar coluna full_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
        RAISE NOTICE '➕ Adicionando coluna full_name...';
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    ELSE
        RAISE NOTICE '✅ Coluna full_name já existe';
    END IF;
    
    -- Adicionar coluna hotel_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'hotel_name') THEN
        RAISE NOTICE '➕ Adicionando coluna hotel_name...';
        ALTER TABLE public.profiles ADD COLUMN hotel_name TEXT;
    ELSE
        RAISE NOTICE '✅ Coluna hotel_name já existe';
    END IF;
    
    -- Adicionar coluna is_active se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_active') THEN
        RAISE NOTICE '➕ Adicionando coluna is_active...';
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    ELSE
        RAISE NOTICE '✅ Coluna is_active já existe';
    END IF;
    
    -- Adicionar colunas de timestamp se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
        RAISE NOTICE '➕ Adicionando coluna created_at...';
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    ELSE
        RAISE NOTICE '✅ Coluna created_at já existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        RAISE NOTICE '➕ Adicionando coluna updated_at...';
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    ELSE
        RAISE NOTICE '✅ Coluna updated_at já existe';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ ESTRUTURA DA TABELA PROFILES CORRIGIDA!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMO PASSO:';
    RAISE NOTICE 'Execute o script 14-fix-auth-system-corrected.sql';
    
END $$;
