-- Insert Default Subscription Plans
-- Clean plans without mock data, ready for production

INSERT INTO public.subscription_plans (
    name,
    slug,
    description,
    price_monthly,
    price_yearly,
    features,
    limits,
    max_hotels,
    max_rooms,
    max_users,
    max_integrations,
    is_active,
    is_featured,
    sort_order
) VALUES 
(
    'Starter',
    'starter',
    'Plano básico para pequenos hotéis e pousadas',
    99.90,
    999.00,
    ARRAY[
        'Até 1 hotel',
        'Até 20 quartos',
        'Até 3 usuários',
        'Reservas ilimitadas',
        'Gestão de hóspedes',
        'Relatórios básicos',
        'Suporte por email'
    ],
    '{"reservations": -1, "reports": "basic", "support": "email"}',
    1,
    20,
    3,
    2,
    true,
    false,
    1
),
(
    'Professional',
    'professional',
    'Plano completo para hotéis de médio porte',
    199.90,
    1999.00,
    ARRAY[
        'Até 1 hotel',
        'Até 50 quartos',
        'Até 10 usuários',
        'Reservas ilimitadas',
        'Gestão completa de hóspedes',
        'Sistema de limpeza',
        'Sistema de manutenção',
        'Relatórios avançados',
        'Integrações com OTAs',
        'Suporte prioritário'
    ],
    '{"reservations": -1, "reports": "advanced", "support": "priority", "integrations": ["booking", "airbnb"]}',
    1,
    50,
    10,
    5,
    true,
    true,
    2
),
(
    'Enterprise',
    'enterprise',
    'Solução completa para redes hoteleiras',
    399.90,
    3999.00,
    ARRAY[
        'Hotéis ilimitados',
        'Quartos ilimitados',
        'Usuários ilimitados',
        'Reservas ilimitadas',
        'Gestão completa de hóspedes',
        'Sistema de limpeza avançado',
        'Sistema de manutenção completo',
        'Gestão financeira completa',
        'Relatórios personalizados',
        'Todas as integrações',
        'API personalizada',
        'Suporte 24/7',
        'Gerente de conta dedicado'
    ],
    '{"reservations": -1, "reports": "custom", "support": "24x7", "integrations": "all", "api": true}',
    -1,
    -1,
    -1,
    -1,
    true,
    true,
    3
);

SELECT 'Subscription plans inserted successfully' as status;
