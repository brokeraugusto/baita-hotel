-- Corrigir sistema de autenticação
-- Este script vai criar os triggers necessários e corrigir usuários existentes

DO $$
BEGIN
    RAISE NOTICE '🔧 CORRIGINDO SISTEMA DE AUTENTICAÇÃO';
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
    
    -- 1. Criar função para lidar com novos usuários
    RAISE NOTICE '1. Criando função handle_new_user...';
    
END $$;

-- Criar função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    RAISE LOG 'Trigger handle_new_user executado para usuário: %', NEW.email;
    
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        user_role,
        hotel_name,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'user_role', 'client')::user_role,
        NEW.raw_user_meta_data->>'hotel_name',
        true,
        NOW(),
        NOW()
    );
    
    RAISE LOG 'Perfil criado para usuário: %', NEW.email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro ao criar perfil para %: %', NEW.email, SQLERRM;
        RETURN NEW; -- Não falhar o registro do usuário
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
    RAISE NOTICE '✅ Função e trigger criados com sucesso!';
    RAISE NOTICE '';
    
    -- 2. Corrigir usuários existentes sem perfil
    RAISE NOTICE '2. Corrigindo usuários existentes sem perfil...';
    
    -- Criar perfis para usuários que não têm
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        user_role,
        hotel_name,
        is_active,
        created_at,
        updated_at
    )
    SELECT 
        u.id,
        u.email,
        COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
        COALESCE(u.raw_user_meta_data->>'user_role', 'client')::user_role,
        u.raw_user_meta_data->>'hotel_name',
        true,
        u.created_at,
        NOW()
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    -- Mostrar quantos perfis foram criados
    RAISE NOTICE '✅ Perfis criados para usuários existentes!';
    RAISE NOTICE '';
    
    -- 3. Criar usuário admin se não existir
    RAISE NOTICE '3. Verificando usuário admin...';
    
    -- Verificar se já existe um admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'admin@baitahotel.com'
    ) THEN
        RAISE NOTICE '   Criando usuário admin via perfil...';
        
        -- Criar perfil admin (sem criar na auth.users pois isso deve ser feito via Supabase Auth)
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            user_role,
            hotel_name,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'admin@baitahotel.com',
            'Admin Baita Hotel',
            'master_admin',
            'Hotel Baita Demo',
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '   ⚠️  IMPORTANTE: Você precisa criar o usuário admin@baitahotel.com';
        RAISE NOTICE '   via cadastro na aplicação para que funcione completamente!';
    ELSE
        RAISE NOTICE '   ✅ Usuário admin já existe';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA DE AUTENTICAÇÃO CORRIGIDO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Acesse /cadastro na aplicação';
    RAISE NOTICE '2. Crie uma conta nova com qualquer email';
    RAISE NOTICE '3. O perfil será criado automaticamente';
    RAISE NOTICE '4. Faça login normalmente';
    RAISE NOTICE '';
    
END $$;
