-- Corrigir recursão infinita nas políticas RLS

-- 1. Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Hotel owners can manage their hotels" ON hotels;
DROP POLICY IF EXISTS "Hotel staff can view their hotel" ON hotels;
DROP POLICY IF EXISTS "Hotel users can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Hotel users can manage reservations" ON reservations;
DROP POLICY IF EXISTS "Hotel users can manage maintenance" ON maintenance_orders;
DROP POLICY IF EXISTS "Hotel users can manage cleaning" ON cleaning_tasks;
DROP POLICY IF EXISTS "Hotel users can manage finances" ON financial_transactions;
DROP POLICY IF EXISTS "Hotel users can manage room categories" ON room_categories;
DROP POLICY IF EXISTS "Hotel users can manage guests" ON guests;

-- 3. Criar políticas simples e seguras (sem recursão)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política simples para profiles - apenas o próprio usuário pode ver/editar
CREATE POLICY "profiles_own_data" ON profiles
    FOR ALL USING (auth.uid() = id);

-- 4. Para desenvolvimento, permitir acesso total às outras tabelas
-- (em produção, implementaremos políticas mais específicas)

RAISE NOTICE '🛡️ RLS corrigido! Recursão eliminada.';
RAISE NOTICE '📝 Profiles: apenas próprio usuário pode acessar';
RAISE NOTICE '🔓 Outras tabelas: acesso liberado para desenvolvimento';
