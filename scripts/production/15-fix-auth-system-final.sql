-- Corrigir sistema de autenticação usando a estrutura REAL da tabela profiles
-- Baseado na estrutura: id, email, full_name, role, avatar_url, phone, created_at, updated_at

DO $$
BEGIN
    RAISE NOTICE '🔧 CORRIGINDO SISTEMA DE AUTENTICAÇÃO (VERSÃO FINAL)';
    RAISE NOTICE '====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Estrutura da tabela profiles identificada:';
    RAISE NOTICE '   - id (uuid)';
    RAISE NOTICE '   - email (text)';
    RAISE NOTICE '   - full_name (text)';
    RAISE NOTICE '   - role (user_role) - padrão: hotel_guest';
    RAISE NOTICE '   - avatar_url (text)';
    RAISE NOTICE '   - phone (text)';
    RAISE NOTICE '   - created_at (timestamptz)';
    RAISE NOTICE '   - updated_at (timestamptz)';
    RAISE NOTICE '';
END $$;

-- Criar função para lidar com novos usuários (usando estrutura correta)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    RAISE LOG 'Trigger handle_new_user executado para usuário: %', NEW.email;
    
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        avatar_url,
        phone,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'user_role', 'hotel_guest')::user_role,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'phone',
        NOW(),
        NOW()
    );
    
    RAISE LOG 'Perfil criado para usuário: % com role: %', NEW.email, COALESCE(NEW.raw_user_meta_data->>'user_role', 'hotel_guest');
    
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
DECLARE
    users_without_profiles integer;
    profiles_created integer;
BEGIN
    RAISE NOTICE '✅ Função e trigger criados com sucesso!';
    RAISE NOTICE '';
    
    -- Verificar quantos usuários não têm perfil
    SELECT COUNT(*) INTO users_without_profiles
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL;
    
    RAISE NOTICE '🔍 Usuários sem perfil encontrados: %', users_without_profiles;
    
    IF users_without_profiles > 0 THEN
        RAISE NOTICE '2. Criando perfis para usuários existentes...';
        
        -- Criar perfis para usuários que não têm (usando estrutura correta)
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            role,
            avatar_url,
            phone,
            created_at,
            updated_at
        )
        SELECT 
            u.id,
            u.email,
            COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
            COALESCE(u.raw_user_meta_data->>'user_role', 'hotel_guest')::user_role,
            u.raw_user_meta_data->>'avatar_url',
            u.raw_user_meta_data->>'phone',
            u.created_at,
            NOW()
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL;
        
        GET DIAGNOSTICS profiles_created = ROW_COUNT;
        RAISE NOTICE '✅ % perfis criados para usuários existentes!', profiles_created;
    ELSE
        RAISE NOTICE '✅ Todos os usuários já têm perfis!';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SISTEMA DE AUTENTICAÇÃO CORRIGIDO COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Acesse /cadastro na aplicação';
    RAISE NOTICE '2. Crie uma conta nova com qualquer email';
    RAISE NOTICE '3. O perfil será criado automaticamente com role: hotel_guest';
    RAISE NOTICE '4. Faça login normalmente';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Para criar um admin master:';
    RAISE NOTICE 'UPDATE profiles SET role = ''master_admin'' WHERE email = ''seu@email.com'';';
    RAISE NOTICE '';
    
END $$;
