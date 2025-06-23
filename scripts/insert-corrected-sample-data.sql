-- Inserir dados de exemplo corrigidos
BEGIN;

SELECT 'INSERINDO DADOS DE EXEMPLO CORRIGIDOS' as title;

-- 1. Inserir categorias de manutenção
INSERT INTO maintenance_categories (name, description, color, icon, sort_order) VALUES
('Elétrica', 'Problemas elétricos, lâmpadas, tomadas, disjuntores', '#F59E0B', 'zap', 1),
('Hidráulica', 'Vazamentos, entupimentos, torneiras, chuveiros', '#3B82F6', 'droplets', 2),
('Ar Condicionado', 'Manutenção e reparo de sistemas de climatização', '#06B6D4', 'wind', 3),
('Móveis e Decoração', 'Reparos em móveis, pintura, decoração', '#8B5CF6', 'paintbrush', 4),
('Eletrônicos', 'TV, telefone, internet, equipamentos eletrônicos', '#10B981', 'monitor', 5),
('Limpeza Especial', 'Limpeza profunda, dedetização, desinfecção', '#F97316', 'spray-can', 6),
('Segurança', 'Fechaduras, alarmes, câmeras, controle de acesso', '#EF4444', 'shield', 7),
('Estrutural', 'Problemas estruturais, rachaduras, infiltrações', '#6B7280', 'home', 8),
('Jardim e Área Externa', 'Manutenção de jardins, piscina, área externa', '#22C55E', 'trees', 9),
('Emergência', 'Situações de emergência que requerem ação imediata', '#DC2626', 'alert-triangle', 10);

-- 2. Inserir técnicos de manutenção
INSERT INTO maintenance_technicians (name, email, phone, employee_id, specialties, hourly_rate, hire_date) VALUES
('Carlos Silva', 'carlos.silva@hotel.com', '(11) 99999-1001', 'TEC001', ARRAY['Elétrica', 'Eletrônicos'], 45.00, '2023-01-15'),
('João Santos', 'joao.santos@hotel.com', '(11) 99999-1002', 'TEC002', ARRAY['Hidráulica', 'Ar Condicionado'], 50.00, '2023-02-01'),
('Maria Oliveira', 'maria.oliveira@hotel.com', '(11) 99999-1003', 'TEC003', ARRAY['Limpeza Especial', 'Jardim e Área Externa'], 35.00, '2023-03-10'),
('Pedro Costa', 'pedro.costa@hotel.com', '(11) 99999-1004', 'TEC004', ARRAY['Móveis e Decoração', 'Estrutural'], 40.00, '2023-01-20'),
('Ana Ferreira', 'ana.ferreira@hotel.com', '(11) 99999-1005', 'TEC005', ARRAY['Segurança', 'Eletrônicos'], 55.00, '2023-04-05'),
('Roberto Lima', 'roberto.lima@hotel.com', '(11) 99999-1006', 'TEC006', ARRAY['Hidráulica', 'Elétrica'], 48.00, '2023-02-15'),
('Lucia Mendes', 'lucia.mendes@hotel.com', '(11) 99999-1007', 'TEC007', ARRAY['Emergência', 'Estrutural'], 60.00, '2023-01-05');

-- 3. Inserir materiais de manutenção
INSERT INTO maintenance_materials (name, description, category, unit, unit_price, stock_quantity, minimum_stock, supplier_name) VALUES
('Lâmpada LED 9W', 'Lâmpada LED branca 9W bivolt', 'Elétrica', 'unidade', 15.90, 50, 10, 'Elétrica Total'),
('Torneira Monocomando', 'Torneira monocomando para banheiro', 'Hidráulica', 'unidade', 89.90, 8, 2, 'Hidráulica Pro'),
('Filtro de Ar Condicionado', 'Filtro para ar condicionado split', 'Ar Condicionado', 'unidade', 25.00, 20, 5, 'Clima Tech'),
('Tinta Acrílica Branca', 'Tinta acrílica branca 18L', 'Móveis e Decoração', 'galão', 120.00, 5, 2, 'Tintas & Cores'),
('Cabo HDMI 2m', 'Cabo HDMI 2 metros para TV', 'Eletrônicos', 'unidade', 35.00, 15, 3, 'Tech Solutions'),
('Desinfetante Hospitalar', 'Desinfetante para limpeza profunda', 'Limpeza Especial', 'litro', 18.50, 30, 8, 'Clean Master'),
('Fechadura Digital', 'Fechadura digital com cartão', 'Segurança', 'unidade', 450.00, 3, 1, 'Security Plus'),
('Massa Corrida', 'Massa corrida para parede 25kg', 'Estrutural', 'saco', 45.00, 10, 3, 'Construção Total');

-- 4. Inserir templates de manutenção
INSERT INTO maintenance_templates (name, description, maintenance_type, estimated_duration, estimated_cost, instructions) VALUES
('Limpeza Preventiva AC', 'Limpeza preventiva mensal do ar condicionado', 'preventive', 60, 80.00, 'Desligar o equipamento, remover filtros, limpar com água e sabão neutro, secar completamente, reinstalar'),
('Inspeção Elétrica Mensal', 'Verificação mensal de instalações elétricas', 'inspection', 45, 50.00, 'Verificar disjuntores, testar tomadas, inspecionar fiação aparente, testar iluminação'),
('Manutenção Preventiva Hidráulica', 'Verificação preventiva do sistema hidráulico', 'preventive', 90, 120.00, 'Verificar vazamentos, testar pressão, limpar ralos, inspecionar registros');

COMMIT;

SELECT 'Dados de exemplo inseridos com sucesso!' as status;

-- Verificar dados inseridos
SELECT 'VERIFICAÇÃO DOS DADOS INSERIDOS:' as title;

SELECT 'Categorias:', COUNT(*) as total FROM maintenance_categories;
SELECT 'Técnicos:', COUNT(*) as total FROM maintenance_technicians;
SELECT 'Materiais:', COUNT(*) as total FROM maintenance_materials;
SELECT 'Templates:', COUNT(*) as total FROM maintenance_templates;
