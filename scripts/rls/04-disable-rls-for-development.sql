-- ATENÇÃO: Este script é apenas para desenvolvimento!
-- NUNCA use em produção!

-- Desabilitar RLS em todas as tabelas financeiras para permitir funcionamento em desenvolvimento
ALTER TABLE financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;

-- Verificar o status do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('financial_transactions', 'financial_categories', 'bank_accounts', 'suppliers', 'accounts_payable', 'accounts_receivable', 'hotels')
ORDER BY tablename;
