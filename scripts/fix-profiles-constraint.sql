-- Remover a constraint problemática se ela existir
DO $$
BEGIN
    -- Verificar se a constraint existe e removê-la
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
        RAISE NOTICE 'Constraint profiles_id_fkey removida com sucesso';
    END IF;
    
    -- Verificar se a constraint profiles_user_id_fkey existe e removê-la
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;
        RAISE NOTICE 'Constraint profiles_user_id_fkey removida com sucesso';
    END IF;
END $$;

-- Recriar a tabela profiles sem a constraint problemática
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    user_role VARCHAR(20) DEFAULT 'client' CHECK (user_role IN ('client', 'master_admin')),
    hotel_name VARCHAR(255),
    hotel_address TEXT,
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    subscription_plan VARCHAR(50),
    subscription_end_date TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status);
