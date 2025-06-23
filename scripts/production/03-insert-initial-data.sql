-- Inserir dados iniciais essenciais

-- 1. PLANOS DE ASSINATURA
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, max_hotels, max_rooms, features) VALUES
('Básico', 'Plano ideal para pequenos hotéis', 99.90, 999.00, 1, 20, '{"maintenance": true, "cleaning": true, "basic_reports": true}'),
('Profissional', 'Plano completo para hotéis médios', 199.90, 1999.00, 1, 50, '{"maintenance": true, "cleaning": true, "financial": true, "advanced_reports": true, "integrations": true}'),
('Empresarial', 'Plano para redes de hotéis', 399.90, 3999.00, 5, 200, '{"maintenance": true, "cleaning": true, "financial": true, "advanced_reports": true, "integrations": true, "multi_hotel": true, "api_access": true}');

-- 2. CATEGORIAS DE MANUTENÇÃO PADRÃO
-- Estas serão criadas automaticamente quando um hotel for criado

-- 3. DADOS DE EXEMPLO (OPCIONAL - remover em produção)
-- Criar um usuário admin de exemplo (apenas para testes)
-- INSERT INTO profiles (id, email, full_name, role) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'admin@baitahotel.com', 'Admin Sistema', 'master_admin');

RAISE NOTICE '📊 Dados iniciais inseridos com sucesso!';
