-- Limpar banco para começar do zero (CUIDADO: Remove todos os dados)
-- Execute apenas se quiser começar limpo

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maintenance_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cleaning_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financial_transactions DISABLE ROW LEVEL SECURITY;

-- Remover tabelas existentes (se houver)
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS cleaning_tasks CASCADE;
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS maintenance_templates CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;
DROP TABLE IF EXISTS maintenance_technicians CASCADE;
DROP TABLE IF EXISTS cleaning_personnel CASCADE;
DROP TABLE IF EXISTS room_status_logs CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS room_categories CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Remover tipos ENUM se existirem
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS room_status CASCADE;
DROP TYPE IF EXISTS reservation_status CASCADE;
DROP TYPE IF EXISTS maintenance_status CASCADE;
DROP TYPE IF EXISTS maintenance_priority CASCADE;
DROP TYPE IF EXISTS cleaning_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

RAISE NOTICE '🧹 Banco limpo! Pronto para criar estrutura nova.';
