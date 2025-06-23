-- Inserir dados padrão para o sistema Master Admin

-- Inserir planos de assinatura
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, limits, is_featured, sort_order) VALUES
(
    'Básico',
    'basic',
    'Ideal para pousadas e hotéis pequenos',
    89.00,
    890.00,
    '[
        "Até 20 quartos",
        "1 usuário",
        "Reservas básicas",
        "Relatórios essenciais",
        "Suporte por email"
    ]'::jsonb,
    '{
        "rooms": 20,
        "users": 1,
        "reservations_per_month": 500,
        "storage_gb": 5
    }'::jsonb,
    false,
    1
),
(
    'Profissional',
    'professional',
    'Perfeito para hotéis em crescimento',
    189.00,
    1890.00,
    '[
        "Até 100 quartos",
        "5 usuários",
        "Todas as funcionalidades",
        "Integrações com OTAs",
        "Suporte prioritário",
        "Motor de precificação"
    ]'::jsonb,
    '{
        "rooms": 100,
        "users": 5,
        "reservations_per_month": 2000,
        "storage_gb": 25
    }'::jsonb,
    true,
    2
),
(
    'Premium',
    'premium',
    'Para hotéis e resorts de grande porte',
    389.00,
    3890.00,
    '[
        "Quartos ilimitados",
        "Usuários ilimitados",
        "Funcionalidades avançadas",
        "Integrações ilimitadas",
        "Suporte 24/7",
        "Relatórios personalizados",
        "API completa"
    ]'::jsonb,
    '{
        "rooms": -1,
        "users": -1,
        "reservations_per_month": -1,
        "storage_gb": 100
    }'::jsonb,
    false,
    3
);

-- Inserir clientes de exemplo
INSERT INTO clients (
    name, email, phone, hotel_name, hotel_address, hotel_city, hotel_state,
    rooms_count, plan_id, subscription_status, monthly_revenue, total_reservations
) VALUES
(
    'João Silva',
    'joao@hotelexemplo.com',
    '(11) 99999-9999',
    'Hotel Exemplo',
    'Rua das Flores, 123',
    'São Paulo',
    'SP',
    50,
    (SELECT id FROM subscription_plans WHERE slug = 'professional'),
    'active',
    15000.00,
    245
),
(
    'Maria Santos',
    'maria@pousadavista.com',
    '(21) 88888-8888',
    'Pousada Vista Mar',
    'Av. Atlântica, 456',
    'Rio de Janeiro',
    'RJ',
    25,
    (SELECT id FROM subscription_plans WHERE slug = 'basic'),
    'active',
    8500.00,
    156
),
(
    'Carlos Oliveira',
    'carlos@resortparadise.com',
    '(85) 77777-7777',
    'Resort Paradise',
    'Praia do Futuro, 789',
    'Fortaleza',
    'CE',
    120,
    (SELECT id FROM subscription_plans WHERE slug = 'premium'),
    'active',
    45000.00,
    678
);

-- Inserir configurações da landing page
INSERT INTO landing_page_settings (section, key, value, value_type) VALUES
-- Hero Section
('hero', 'title', 'Transforme a gestão do seu hotel', 'text'),
('hero', 'subtitle', 'O BaitaHotel é a plataforma completa para hotéis e pousadas que querem automatizar operações, aumentar a receita e oferecer uma experiência excepcional aos hóspedes.', 'textarea'),
('hero', 'cta_primary', 'Começar Teste Grátis', 'text'),
('hero', 'cta_secondary', 'Ver Demonstração', 'text'),
('hero', 'background_image', '/hero-bg.jpg', 'image'),

-- Stats
('stats', 'hotels_count', '500+', 'text'),
('stats', 'hotels_label', 'Hotéis ativos', 'text'),
('stats', 'reservations_count', '50k+', 'text'),
('stats', 'reservations_label', 'Reservas processadas', 'text'),
('stats', 'rating', '4.9/5', 'text'),
('stats', 'rating_label', 'Avaliação dos clientes', 'text'),

-- Company Info
('company', 'name', 'BaitaHotel', 'text'),
('company', 'tagline', 'Sistema de Gestão Hoteleira', 'text'),
('company', 'phone', '(11) 3000-0000', 'text'),
('company', 'email', 'contato@baitahotel.com', 'email'),
('company', 'address', 'São Paulo, SP - Brasil', 'text'),

-- Features
('features', 'title', 'Tudo que seu hotel precisa em uma plataforma', 'text'),
('features', 'subtitle', 'Módulos integrados que trabalham juntos para automatizar suas operações e maximizar sua receita.', 'textarea'),

-- Pricing
('pricing', 'title', 'Planos que crescem com seu negócio', 'text'),
('pricing', 'subtitle', 'Comece com 7 dias grátis. Sem compromisso, sem cartão de crédito.', 'textarea'),

-- Testimonials
('testimonials', 'title', 'Mais de 500 hotéis confiam no BaitaHotel', 'text'),
('testimonials', 'subtitle', 'Veja o que nossos clientes estão dizendo sobre a transformação em seus negócios.', 'textarea'),

-- CTA Section
('cta', 'title', 'Pronto para transformar seu hotel?', 'text'),
('cta', 'subtitle', 'Junte-se a centenas de hotéis que já automatizaram suas operações e aumentaram sua receita com o BaitaHotel.', 'textarea'),
('cta', 'button_text', 'Começar Teste Grátis', 'text');

-- Inserir features
INSERT INTO features (name, description, icon, sort_order) VALUES
('Gestão de Reservas', 'Calendário intuitivo, motor de reservas online e sincronização com OTAs principais.', 'Calendar', 1),
('Controle de Acomodações', 'Gerencie quartos, suítes e chalés com sistema avançado de precificação dinâmica.', 'Building2', 2),
('Financeiro Completo', 'Controle de receitas, despesas, fluxo de caixa e relatórios financeiros detalhados.', 'DollarSign', 3),
('Manutenção', 'Ordens de serviço, controle de equipamentos e manutenção preventiva.', 'Wrench', 4),
('Governança', 'Gestão de limpeza com checklists digitais e controle de status dos quartos.', 'Sparkles', 5),
('CRM de Hóspedes', 'Histórico completo, preferências e programa de fidelidade integrado.', 'Users', 6),
('Relatórios Avançados', 'Dashboards em tempo real com KPIs essenciais para tomada de decisão.', 'BarChart3', 7),
('Segurança Total', 'Dados protegidos com criptografia e conformidade com LGPD.', 'Shield', 8);

-- Inserir depoimentos
INSERT INTO testimonials (name, role, company, content, rating, sort_order) VALUES
(
    'Maria Silva',
    'Proprietária',
    'Pousada Vista Mar',
    'O BaitaHotel revolucionou nossa operação. Aumentamos nossa receita em 35% no primeiro ano.',
    5,
    1
),
(
    'João Santos',
    'Gerente Geral',
    'Hotel Central',
    'A automação dos processos nos permitiu focar no que realmente importa: a experiência do hóspede.',
    5,
    2
),
(
    'Ana Costa',
    'Diretora',
    'Resort Paradise',
    'Relatórios em tempo real e integração com OTAs. Exatamente o que precisávamos para crescer.',
    5,
    3
);

-- Inserir métricas de exemplo
INSERT INTO platform_analytics (metric_name, metric_value, metric_date, metadata) VALUES
('total_clients', 500, CURRENT_DATE, '{"type": "count"}'::jsonb),
('monthly_revenue', 125000.00, CURRENT_DATE, '{"currency": "BRL"}'::jsonb),
('total_reservations', 15420, CURRENT_DATE, '{"type": "count"}'::jsonb),
('active_subscriptions', 487, CURRENT_DATE, '{"type": "count"}'::jsonb),
('trial_conversions', 78.5, CURRENT_DATE, '{"type": "percentage"}'::jsonb),
('churn_rate', 2.3, CURRENT_DATE, '{"type": "percentage"}'::jsonb);
