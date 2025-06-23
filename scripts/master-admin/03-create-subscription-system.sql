-- Criar tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  features JSONB,
  limits JSONB,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  resume_date TIMESTAMP WITH TIME ZONE,
  billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly',
  price DECIMAL(10, 2) NOT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  payment_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de assinaturas
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  action VARCHAR(50) NOT NULL,
  previous_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  reason TEXT,
  resume_date TIMESTAMP WITH TIME ZONE,
  immediate BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_method VARCHAR(50),
  payment_details JSONB,
  invoice_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos de exemplo
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, limits, is_active, is_featured, sort_order)
VALUES
  ('Básico', 'basico', 'Ideal para hotéis pequenos com até 20 quartos', 99.00, 990.00, '["Gestão de reservas", "Check-in/Check-out", "Relatórios básicos", "Suporte por email"]', '{"rooms": 20, "users": 3, "integrations": 1}', true, false, 1),
  ('Profissional', 'profissional', 'Para hotéis em crescimento com até 100 quartos', 199.00, 1990.00, '["Todas as funcionalidades do Básico", "Gestão financeira", "Manutenção", "Limpeza", "Relatórios avançados", "Integrações", "Suporte prioritário"]', '{"rooms": 100, "users": 10, "integrations": 5}', true, true, 2),
  ('Enterprise', 'enterprise', 'Para grandes redes hoteleiras sem limites', 399.00, 3990.00, '["Todas as funcionalidades", "Multi-propriedades", "API completa", "Customizações", "Suporte 24/7", "Treinamento"]', '{"rooms": -1, "users": -1, "integrations": -1}', true, false, 3);

-- Inserir assinaturas de exemplo
INSERT INTO subscriptions (client_id, plan_id, status, start_date, billing_cycle, price, last_payment_date, next_payment_date)
SELECT 
  p.id,
  (SELECT id FROM subscription_plans WHERE name = 'Profissional' LIMIT 1),
  'active',
  NOW() - INTERVAL '3 months',
  'monthly',
  199.00,
  NOW() - INTERVAL '1 month',
  NOW() + INTERVAL '1 month'
FROM profiles p
WHERE p.user_role = 'client'
LIMIT 3;

-- Inserir mais algumas assinaturas com status diferentes
INSERT INTO subscriptions (client_id, plan_id, status, start_date, billing_cycle, price, last_payment_date, next_payment_date)
SELECT 
  p.id,
  (SELECT id FROM subscription_plans WHERE name = 'Básico' LIMIT 1),
  'paused',
  NOW() - INTERVAL '6 months',
  'monthly',
  99.00,
  NOW() - INTERVAL '2 months',
  NOW() + INTERVAL '1 month'
FROM profiles p
WHERE p.user_role = 'client'
ORDER BY p.created_at DESC
LIMIT 1;

INSERT INTO subscriptions (client_id, plan_id, status, start_date, end_date, billing_cycle, price, last_payment_date)
SELECT 
  p.id,
  (SELECT id FROM subscription_plans WHERE name = 'Enterprise' LIMIT 1),
  'canceled',
  NOW() - INTERVAL '12 months',
  NOW() - INTERVAL '1 month',
  'yearly',
  3990.00,
  NOW() - INTERVAL '2 months'
FROM profiles p
WHERE p.user_role = 'client'
ORDER BY p.created_at
LIMIT 1;
