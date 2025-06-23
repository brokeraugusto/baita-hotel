-- Inserir dados de exemplo para testar o sistema

-- 1. Atualizar planos existentes e inserir novos
UPDATE subscription_plans SET 
    slug = 'basico',
    limits = '{"rooms": 20, "users": 3, "integrations": 1}'::jsonb,
    is_featured = false,
    sort_order = 1
WHERE name = 'Básico' OR id = (SELECT id FROM subscription_plans LIMIT 1);

-- Inserir planos se não existirem
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, limits, is_active, is_featured, sort_order) 
VALUES 
('Básico', 'basico', 'Ideal para hotéis pequenos', 99.00, 990.00, 
 '["Gestão de reservas", "Check-in/Check-out", "Relatórios básicos", "Suporte por email"]'::jsonb,
 '{"rooms": 20, "users": 3, "integrations": 1}'::jsonb, true, false, 1),

('Profissional', 'profissional', 'Para hotéis em crescimento', 199.00, 1990.00,
 '["Todas as funcionalidades do Básico", "Gestão financeira", "Manutenção", "Limpeza", "Relatórios avançados", "Integrações", "Suporte prioritário"]'::jsonb,
 '{"rooms": 100, "users": 10, "integrations": 5}'::jsonb, true, true, 2),

('Enterprise', 'enterprise', 'Para grandes redes hoteleiras', 399.00, 3990.00,
 '["Todas as funcionalidades", "Multi-propriedades", "API completa", "Customizações", "Suporte 24/7", "Treinamento"]'::jsonb,
 '{"rooms": -1, "users": -1, "integrations": -1}'::jsonb, true, false, 3)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured,
    sort_order = EXCLUDED.sort_order;

-- 2. Inserir clientes de exemplo
INSERT INTO clients (name, email, phone, hotel_name, hotel_address, hotel_city, hotel_state, hotel_country, rooms_count, plan_id, subscription_status, monthly_revenue, total_reservations, status) VALUES
('João Silva', 'joao@hotelpousada.com', '(11) 99999-1111', 'Pousada do Vale', 'Rua das Flores, 123', 'Campos do Jordão', 'SP', 'Brasil', 15, 
 (SELECT id FROM subscription_plans WHERE slug = 'basico' LIMIT 1), 'active', 12500.00, 45, 'active'),

('Maria Santos', 'maria@hotelcentral.com', '(21) 88888-2222', 'Hotel Central', 'Av. Copacabana, 456', 'Rio de Janeiro', 'RJ', 'Brasil', 80,
 (SELECT id FROM subscription_plans WHERE slug = 'profissional' LIMIT 1), 'active', 85000.00, 320, 'active'),

('Carlos Oliveira', 'carlos@redehoteis.com', '(11) 77777-3333', 'Rede Hotéis Premium', 'Rua Augusta, 789', 'São Paulo', 'SP', 'Brasil', 250,
 (SELECT id FROM subscription_plans WHERE slug = 'enterprise' LIMIT 1), 'active', 450000.00, 1200, 'active'),

('Ana Costa', 'ana@pousadapraia.com', '(85) 66666-4444', 'Pousada da Praia', 'Av. Beira Mar, 321', 'Fortaleza', 'CE', 'Brasil', 12,
 (SELECT id FROM subscription_plans WHERE slug = 'basico' LIMIT 1), 'trial', 0.00, 0, 'active')
ON CONFLICT (email) DO NOTHING;

-- 3. Inserir pagamentos de exemplo
INSERT INTO payments (client_id, amount, currency, status, payment_method, payment_provider, paid_at) VALUES
((SELECT id FROM clients WHERE email = 'joao@hotelpousada.com'), 99.00, 'BRL', 'paid', 'credit_card', 'stripe', NOW() - INTERVAL '5 days'),
((SELECT id FROM clients WHERE email = 'maria@hotelcentral.com'), 199.00, 'BRL', 'paid', 'credit_card', 'stripe', NOW() - INTERVAL '3 days'),
((SELECT id FROM clients WHERE email = 'carlos@redehoteis.com'), 399.00, 'BRL', 'paid', 'bank_transfer', 'stripe', NOW() - INTERVAL '1 day'),
((SELECT id FROM clients WHERE email = 'ana@pousadapraia.com'), 99.00, 'BRL', 'pending', 'credit_card', 'stripe', NULL);

-- 4. Inserir tickets de suporte
INSERT INTO support_tickets (client_id, title, description, priority, status, category, client_email, client_name) VALUES
((SELECT id FROM clients WHERE email = 'joao@hotelpousada.com'), 
 'Dúvida sobre relatórios', 'Como gerar relatório de ocupação mensal?', 'low', 'resolved', 'Dúvida', 'joao@hotelpousada.com', 'João Silva'),

((SELECT id FROM clients WHERE email = 'maria@hotelcentral.com'), 
 'Problema na integração', 'Reservas do Booking.com não estão sincronizando', 'high', 'open', 'Técnico', 'maria@hotelcentral.com', 'Maria Santos'),

((SELECT id FROM clients WHERE email = 'ana@pousadapraia.com'), 
 'Solicitação de funcionalidade', 'Gostaria de ter relatório de limpeza personalizado', 'medium', 'in_progress', 'Melhoria', 'ana@pousadapraia.com', 'Ana Costa');

-- 5. Inserir configurações da landing page
INSERT INTO landing_page_settings (section, key, value, value_type, is_active, sort_order) VALUES
('hero', 'title', 'Sistema de Gestão Hoteleira Completo', 'text', true, 1),
('hero', 'subtitle', 'Gerencie seu hotel com eficiência e aumente sua receita', 'text', true, 2),
('hero', 'cta_text', 'Começar Teste Grátis', 'text', true, 3),
('pricing', 'title', 'Planos que Cabem no seu Bolso', 'text', true, 1),
('pricing', 'subtitle', 'Escolha o plano ideal para o seu hotel', 'text', true, 2)
ON CONFLICT (section, key) DO NOTHING;

-- 6. Inserir features
INSERT INTO features (name, description, icon, is_active, sort_order) VALUES
('Gestão de Reservas', 'Sistema completo para gerenciar reservas online e offline', 'calendar', true, 1),
('Check-in Digital', 'Check-in e check-out rápido e eficiente', 'user-check', true, 2),
('Gestão Financeira', 'Controle completo das finanças do seu hotel', 'dollar-sign', true, 3),
('Manutenção', 'Gerencie ordens de serviço e manutenção preventiva', 'wrench', true, 4),
('Limpeza', 'Controle de limpeza e status dos quartos', 'sparkles', true, 5),
('Relatórios', 'Relatórios detalhados e analytics em tempo real', 'bar-chart', true, 6);

-- 7. Inserir depoimentos
INSERT INTO testimonials (name, role, company, content, rating, is_active, sort_order) VALUES
('João Silva', 'Proprietário', 'Pousada do Vale', 'O sistema revolucionou a gestão da nossa pousada. Aumentamos nossa ocupação em 40% no primeiro ano.', 5, true, 1),
('Maria Santos', 'Gerente', 'Hotel Central', 'Interface intuitiva e funcionalidades completas. Nossa equipe se adaptou rapidamente e os resultados apareceram logo.', 5, true, 2),
('Carlos Oliveira', 'Diretor', 'Rede Hotéis Premium', 'Conseguimos centralizar a gestão de todas as nossas propriedades em uma única plataforma. Excelente ROI.', 5, true, 3);

-- 8. Inserir métricas de analytics
INSERT INTO platform_analytics (metric_name, metric_value, metric_date, client_id) VALUES
('total_revenue', 547500.00, CURRENT_DATE, NULL),
('total_clients', 4, CURRENT_DATE, NULL),
('active_subscriptions', 3, CURRENT_DATE, NULL),
('trial_conversions', 75.0, CURRENT_DATE, NULL);
