-- Criar views úteis para relatórios financeiros

-- View para resumo financeiro por período
CREATE OR REPLACE VIEW financial_summary_view AS
SELECT 
    ft.hotel_id,
    DATE_TRUNC('month', ft.transaction_date) as period,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN ft.type = 'expense' THEN ft.amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE -ft.amount END) as net_income,
    COUNT(*) as transaction_count
FROM financial_transactions ft
WHERE ft.payment_status = 'completed'
GROUP BY ft.hotel_id, DATE_TRUNC('month', ft.transaction_date);

-- View para contas em atraso
CREATE OR REPLACE VIEW overdue_accounts_view AS
SELECT 
    'payable' as account_type,
    ap.id,
    ap.hotel_id,
    ap.description,
    ap.amount,
    ap.due_date,
    ap.status,
    s.name as supplier_name,
    CURRENT_DATE - ap.due_date as days_overdue
FROM accounts_payable ap
LEFT JOIN suppliers s ON ap.supplier_id = s.id
WHERE ap.status = 'pending' AND ap.due_date < CURRENT_DATE

UNION ALL

SELECT 
    'receivable' as account_type,
    ar.id,
    ar.hotel_id,
    ar.description,
    ar.amount,
    ar.due_date,
    ar.status,
    'Cliente' as supplier_name,
    CURRENT_DATE - ar.due_date as days_overdue
FROM accounts_receivable ar
WHERE ar.status = 'pending' AND ar.due_date < CURRENT_DATE;

-- View para fluxo de caixa diário
CREATE OR REPLACE VIEW daily_cash_flow_view AS
SELECT 
    ft.hotel_id,
    ft.transaction_date,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE 0 END) as daily_income,
    SUM(CASE WHEN ft.type = 'expense' THEN ft.amount ELSE 0 END) as daily_expenses,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE -ft.amount END) as daily_net
FROM financial_transactions ft
WHERE ft.payment_status = 'completed'
GROUP BY ft.hotel_id, ft.transaction_date
ORDER BY ft.transaction_date;

-- View para análise por categoria
CREATE OR REPLACE VIEW category_analysis_view AS
SELECT 
    ft.hotel_id,
    fc.name as category_name,
    fc.type as category_type,
    fc.color as category_color,
    DATE_TRUNC('month', ft.transaction_date) as period,
    SUM(ft.amount) as total_amount,
    COUNT(*) as transaction_count,
    AVG(ft.amount) as average_amount
FROM financial_transactions ft
JOIN financial_categories fc ON ft.category_id = fc.id
WHERE ft.payment_status = 'completed'
GROUP BY ft.hotel_id, fc.id, fc.name, fc.type, fc.color, DATE_TRUNC('month', ft.transaction_date);
