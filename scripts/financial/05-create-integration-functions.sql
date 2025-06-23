-- Funções para integração automática com outros módulos

-- Função para criar transação automática quando uma reserva é paga
CREATE OR REPLACE FUNCTION create_transaction_from_reservation()
RETURNS TRIGGER AS $$
DECLARE
    category_id UUID;
BEGIN
    -- Só criar transação se o status mudou para 'paid'
    IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
        -- Buscar categoria de hospedagem
        SELECT id INTO category_id 
        FROM financial_categories 
        WHERE name = 'Hospedagem' AND type = 'income' 
        LIMIT 1;

        -- Criar transação financeira
        INSERT INTO financial_transactions (
            hotel_id,
            reservation_id,
            category_id,
            type,
            amount,
            description,
            payment_method,
            payment_status,
            transaction_date
        ) VALUES (
            NEW.hotel_id,
            NEW.id,
            category_id,
            'income',
            NEW.total_amount,
            'Pagamento de hospedagem - Reserva #' || SUBSTRING(NEW.id::text, 1, 8),
            'credit_card', -- Método padrão, pode ser customizado
            'completed',
            CURRENT_DATE
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para reservas
DROP TRIGGER IF EXISTS trigger_reservation_payment ON reservations;
CREATE TRIGGER trigger_reservation_payment
    AFTER UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION create_transaction_from_reservation();

-- Função para criar conta a pagar quando uma ordem de manutenção é concluída
CREATE OR REPLACE FUNCTION create_payable_from_maintenance()
RETURNS TRIGGER AS $$
DECLARE
    category_id UUID;
    supplier_id UUID;
BEGIN
    -- Só criar conta a pagar se o status mudou para 'completed' e há custo real
    IF NEW.status = 'completed' AND NEW.actual_cost > 0 AND 
       (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Buscar categoria de manutenção
        SELECT id INTO category_id 
        FROM financial_categories 
        WHERE name = 'Manutenção' AND type = 'expense' 
        LIMIT 1;

        -- Buscar fornecedor padrão de manutenção (pode ser customizado)
        SELECT id INTO supplier_id 
        FROM suppliers 
        WHERE hotel_id = NEW.hotel_id AND category = 'Manutenção' 
        LIMIT 1;

        -- Criar conta a pagar
        INSERT INTO accounts_payable (
            hotel_id,
            supplier_id,
            category_id,
            maintenance_order_id,
            description,
            amount,
            due_date,
            status
        ) VALUES (
            NEW.hotel_id,
            supplier_id,
            category_id,
            NEW.id,
            'Serviço de manutenção - OS #' || SUBSTRING(NEW.id::text, 1, 8),
            NEW.actual_cost,
            CURRENT_DATE + INTERVAL '30 days', -- 30 dias para pagamento
            'pending'
        );

        -- Criar transação financeira se foi pago imediatamente
        INSERT INTO financial_transactions (
            hotel_id,
            maintenance_order_id,
            category_id,
            type,
            amount,
            description,
            payment_method,
            payment_status,
            transaction_date
        ) VALUES (
            NEW.hotel_id,
            NEW.id,
            category_id,
            'expense',
            NEW.actual_cost,
            'Despesa de manutenção - OS #' || SUBSTRING(NEW.id::text, 1, 8),
            'bank_transfer',
            'completed',
            CURRENT_DATE
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ordens de manutenção
DROP TRIGGER IF EXISTS trigger_maintenance_completion ON maintenance_orders;
CREATE TRIGGER trigger_maintenance_completion
    AFTER UPDATE ON maintenance_orders
    FOR EACH ROW
    EXECUTE FUNCTION create_payable_from_maintenance();

-- Função para atualizar status de contas em atraso
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS void AS $$
BEGIN
    -- Atualizar contas a pagar em atraso
    UPDATE accounts_payable 
    SET status = 'overdue'
    WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;

    -- Atualizar contas a receber em atraso
    UPDATE accounts_receivable 
    SET status = 'overdue'
    WHERE status = 'pending' 
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar relatório financeiro mensal
CREATE OR REPLACE FUNCTION generate_monthly_financial_report(
    p_hotel_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    category_name VARCHAR,
    category_type VARCHAR,
    total_amount DECIMAL,
    transaction_count BIGINT,
    percentage DECIMAL
) AS $$
DECLARE
    total_period DECIMAL;
BEGIN
    -- Calcular total do período
    SELECT COALESCE(SUM(ft.amount), 0) INTO total_period
    FROM financial_transactions ft
    WHERE ft.hotel_id = p_hotel_id
    AND EXTRACT(YEAR FROM ft.transaction_date) = p_year
    AND EXTRACT(MONTH FROM ft.transaction_date) = p_month
    AND ft.payment_status = 'completed';

    -- Retornar dados por categoria
    RETURN QUERY
    SELECT 
        COALESCE(fc.name, 'Sem Categoria') as category_name,
        COALESCE(fc.type, 'unknown') as category_type,
        SUM(ft.amount) as total_amount,
        COUNT(*) as transaction_count,
        CASE 
            WHEN total_period > 0 THEN ROUND((SUM(ft.amount) / total_period * 100), 2)
            ELSE 0
        END as percentage
    FROM financial_transactions ft
    LEFT JOIN financial_categories fc ON ft.category_id = fc.id
    WHERE ft.hotel_id = p_hotel_id
    AND EXTRACT(YEAR FROM ft.transaction_date) = p_year
    AND EXTRACT(MONTH FROM ft.transaction_date) = p_month
    AND ft.payment_status = 'completed'
    GROUP BY fc.name, fc.type
    ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;
