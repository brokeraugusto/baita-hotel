-- Verificar se as tabelas existem e criar se necessário
DO $$
BEGIN
    -- Verificar se a extensão uuid-ossp existe
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION "uuid-ossp";
    END IF;
END $$;

-- Criar tabela de planos de assinatura com todas as validações necessárias
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL CHECK (price_monthly >= 0),
    price_yearly DECIMAL(10, 2) CHECK (price_yearly >= 0),
    features JSONB DEFAULT '[]'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    max_hotels INTEGER DEFAULT 1,
    max_rooms INTEGER DEFAULT 50,
    max_users INTEGER DEFAULT 5,
    max_integrations INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_prices CHECK (
        price_yearly IS NULL OR price_yearly < (price_monthly * 12)
    )
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_featured ON subscription_plans(is_featured);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort_order ON subscription_plans(sort_order);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    resume_date TIMESTAMP WITH TIME ZONE,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    payment_details JSONB DEFAULT '{}'::jsonb,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'canceled', 'trial', 'past_due')),
    CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly')),
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date)
);

-- Criar índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment ON subscriptions(next_payment_date);

-- Criar tabela de histórico de assinaturas
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    previous_plan_id UUID,
    new_plan_id UUID,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Criar índices para subscription_history
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON subscription_history(action);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir planos padrão se não existirem
INSERT INTO subscription_plans (
    name, slug, description, price_monthly, price_yearly, 
    features, max_hotels, max_rooms, max_users, max_integrations,
    is_active, is_featured, sort_order
) VALUES 
(
    'Básico',
    'basico',
    'Ideal para hotéis pequenos e pousadas',
    99.00,
    990.00,
    '["Gestão de reservas", "Check-in/Check-out", "Relatórios básicos", "Suporte por email", "1 hotel", "Até 20 quartos", "Até 3 usuários"]'::jsonb,
    1,
    20,
    3,
    1,
    true,
    false,
    1
),
(
    'Profissional',
    'profissional',
    'Para hotéis em crescimento',
    199.00,
    1990.00,
    '["Todas as funcionalidades do Básico", "Gestão financeira", "Manutenção", "Limpeza", "Relatórios avançados", "Integrações", "Suporte prioritário", "1 hotel", "Até 100 quartos", "Até 10 usuários"]'::jsonb,
    1,
    100,
    10,
    5,
    true,
    true,
    2
),
(
    'Enterprise',
    'enterprise',
    'Para grandes redes hoteleiras',
    399.00,
    3990.00,
    '["Todas as funcionalidades", "Multi-propriedades", "API completa", "Customizações", "Suporte 24/7", "Treinamento", "Hotéis ilimitados", "Quartos ilimitados", "Usuários ilimitados"]'::jsonb,
    -1,
    -1,
    -1,
    -1,
    true,
    false,
    3
)
ON CONFLICT (name) DO NOTHING;
