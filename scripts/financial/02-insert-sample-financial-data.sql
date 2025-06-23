-- Inserir dados de exemplo para o módulo financeiro

-- Categorias financeiras
INSERT INTO financial_categories (name, type, description, color) VALUES
('Hospedagem', 'income', 'Receita de hospedagem e diárias', '#10B981'),
('Alimentação', 'income', 'Receita de restaurante e room service', '#3B82F6'),
('Serviços Extras', 'income', 'Lavanderia, spa, tours, etc.', '#8B5CF6'),
('Eventos', 'income', 'Receita de eventos e conferências', '#F59E0B'),

('Pessoal', 'expense', 'Salários, encargos e benefícios', '#EF4444'),
('Manutenção', 'expense', 'Reparos, peças e serviços técnicos', '#F97316'),
('Limpeza', 'expense', 'Produtos de limpeza e lavanderia', '#06B6D4'),
('Utilidades', 'expense', 'Energia, água, telefone, internet', '#84CC16'),
('Marketing', 'expense', 'Publicidade e promoções', '#EC4899'),
('Administrativo', 'expense', 'Material de escritório, contabilidade', '#6B7280'),
('Fornecedores', 'expense', 'Compras diversas de fornecedores', '#9333EA');

-- Contas bancárias (usando hotel_id fixo para exemplo)
INSERT INTO bank_accounts (hotel_id, name, bank_name, account_number, account_type, balance) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Conta Corrente Principal', 'Banco do Brasil', '12345-6', 'checking', 45000.00),
('550e8400-e29b-41d4-a716-446655440000', 'Conta Poupança', 'Banco do Brasil', '78910-1', 'savings', 25000.00),
('550e8400-e29b-41d4-a716-446655440000', 'Cartão de Crédito', 'Visa', '**** 1234', 'credit', -5000.00);

-- Fornecedores
INSERT INTO suppliers (hotel_id, name, contact_person, email, phone, category, payment_terms) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Elétrica Silva Ltda', 'João Silva', 'joao@eletricasilva.com', '(11) 99999-1111', 'Manutenção Elétrica', 30),
('550e8400-e29b-41d4-a716-446655440000', 'Hidráulica Santos', 'Maria Santos', 'maria@hidraulicasantos.com', '(11) 99999-2222', 'Manutenção Hidráulica', 15),
('550e8400-e29b-41d4-a716-446655440000', 'Produtos de Limpeza ABC', 'Pedro Costa', 'pedro@limpezaabc.com', '(11) 99999-3333', 'Limpeza', 30),
('550e8400-e29b-41d4-a716-446655440000', 'Móveis & Decoração', 'Ana Oliveira', 'ana@moveisdecoracoes.com', '(11) 99999-4444', 'Mobiliário', 45),
('550e8400-e29b-41d4-a716-446655440000', 'Tecnologia Hoteleira', 'Carlos Mendes', 'carlos@techhotel.com', '(11) 99999-5555', 'Tecnologia', 30);

-- Transações financeiras de exemplo
INSERT INTO financial_transactions (
    hotel_id, 
    type, 
    amount, 
    description, 
    payment_method, 
    transaction_date,
    category_id
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'income', 1250.00, 'Hospedagem - Quarto 101', 'credit_card', CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM financial_categories WHERE name = 'Hospedagem' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440000', 'income', 850.00, 'Hospedagem - Quarto 102', 'pix', CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM financial_categories WHERE name = 'Hospedagem' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440000', 'income', 320.00, 'Room Service - Quarto 101', 'cash', CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM financial_categories WHERE name = 'Alimentação' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440000', 'expense', 450.00, 'Reparo ar-condicionado Quarto 205', 'bank_transfer', CURRENT_DATE - INTERVAL '2 days', (SELECT id FROM financial_categories WHERE name = 'Manutenção' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440000', 'expense', 280.00, 'Produtos de limpeza', 'credit_card', CURRENT_DATE - INTERVAL '3 days', (SELECT id FROM financial_categories WHERE name = 'Limpeza' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440000', 'expense', 1200.00, 'Conta de energia elétrica', 'bank_transfer', CURRENT_DATE - INTERVAL '5 days', (SELECT id FROM financial_categories WHERE name = 'Utilidades' LIMIT 1));

-- Contas a pagar
INSERT INTO accounts_payable (
    hotel_id,
    supplier_id,
    category_id,
    description,
    amount,
    due_date,
    invoice_number,
    status
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM suppliers WHERE name = 'Elétrica Silva Ltda' LIMIT 1),
 (SELECT id FROM financial_categories WHERE name = 'Manutenção' LIMIT 1),
 'Manutenção sistema elétrico - Quartos 3º andar',
 2500.00,
 CURRENT_DATE + INTERVAL '15 days',
 'NF-001234',
 'pending'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM suppliers WHERE name = 'Produtos de Limpeza ABC' LIMIT 1),
 (SELECT id FROM financial_categories WHERE name = 'Limpeza' LIMIT 1),
 'Produtos de limpeza - Pedido mensal',
 850.00,
 CURRENT_DATE + INTERVAL '30 days',
 'NF-005678',
 'pending'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM suppliers WHERE name = 'Hidráulica Santos' LIMIT 1),
 (SELECT id FROM financial_categories WHERE name = 'Manutenção' LIMIT 1),
 'Reparo vazamento - Banheiro Quarto 205',
 380.00,
 CURRENT_DATE - INTERVAL '5 days',
 'NF-009876',
 'overdue');

-- Contas a receber
INSERT INTO accounts_receivable (
    hotel_id,
    description,
    amount,
    due_date,
    status,
    category_id
) VALUES
('550e8400-e29b-41d4-a716-446655440000',
 'Evento corporativo - Empresa XYZ',
 5500.00,
 CURRENT_DATE + INTERVAL '10 days',
 'pending',
 (SELECT id FROM financial_categories WHERE name = 'Eventos' LIMIT 1)),

('550e8400-e29b-41d4-a716-446655440000',
 'Reserva grupo - Agência de Turismo ABC',
 3200.00,
 CURRENT_DATE + INTERVAL '7 days',
 'pending',
 (SELECT id FROM financial_categories WHERE name = 'Hospedagem' LIMIT 1)),

('550e8400-e29b-41d4-a716-446655440000',
 'Catering externo - Festa de casamento',
 1800.00,
 CURRENT_DATE - INTERVAL '3 days',
 'overdue',
 (SELECT id FROM financial_categories WHERE name = 'Alimentação' LIMIT 1));
