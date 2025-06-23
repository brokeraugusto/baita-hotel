-- Drop and recreate the financial_transactions table with correct column names
DROP TABLE IF EXISTS financial_transactions CASCADE;

CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    category_id UUID REFERENCES financial_categories(id),
    bank_account_id UUID REFERENCES bank_accounts(id),
    reservation_id UUID REFERENCES reservations(id),
    maintenance_order_id UUID REFERENCES maintenance_orders(id),
    
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(100),
    
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    
    transaction_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    
    -- Campos para contas a pagar/receber
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20) CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    recurring_until DATE,
    
    -- Metadados
    tags TEXT[], -- Array de tags para categorização adicional
    notes TEXT,
    attachments JSONB, -- URLs de comprovantes/notas fiscais
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recriar índices
CREATE INDEX IF NOT EXISTS idx_financial_transactions_hotel_id ON financial_transactions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);

-- Desabilitar RLS na tabela recriada
ALTER TABLE financial_transactions DISABLE ROW LEVEL SECURITY;

-- Inserir algumas transações de exemplo
INSERT INTO financial_transactions (
    hotel_id, 
    transaction_type, 
    amount, 
    description, 
    payment_method, 
    transaction_date, 
    status
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'income', 1250.00, 'Hospedagem - Quarto 101 - Check-in', 'credit_card', CURRENT_DATE - INTERVAL '1 day', 'completed'),
('550e8400-e29b-41d4-a716-446655440000', 'income', 980.00, 'Hospedagem - Quarto 205 - Pagamento PIX', 'pix', CURRENT_DATE - INTERVAL '2 days', 'completed'),
('550e8400-e29b-41d4-a716-446655440000', 'expense', 350.00, 'Reparo elétrico - Quarto 301', 'bank_transfer', CURRENT_DATE - INTERVAL '3 days', 'completed'),
('550e8400-e29b-41d4-a716-446655440000', 'expense', 180.00, 'Produtos de limpeza - Estoque mensal', 'cash', CURRENT_DATE - INTERVAL '5 days', 'completed'),
('550e8400-e29b-41d4-a716-446655440000', 'income', 1450.00, 'Hospedagem - Suíte Master', 'credit_card', CURRENT_DATE, 'completed');
