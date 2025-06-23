-- =============================================
-- CONFIGURAÇÃO DE RLS PARA PRODUÇÃO
-- Row Level Security Policies
-- =============================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS PARA PROFILES
-- =============================================

-- Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Master admins podem ver todos os perfis
CREATE POLICY "Master admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'master_admin'
    )
  );

-- =============================================
-- POLÍTICAS PARA HOTELS
-- =============================================

-- Usuários podem ver apenas hotéis relacionados
CREATE POLICY "Users can view related hotels" ON hotels
  FOR SELECT USING (
    id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'master_admin'
    )
  );

-- Apenas proprietários e master admins podem editar hotéis
CREATE POLICY "Hotel owners can update hotels" ON hotels
  FOR UPDATE USING (
    id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('hotel_owner', 'hotel_admin')
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'master_admin'
    )
  );

-- =============================================
-- POLÍTICAS PARA ROOMS
-- =============================================

-- Usuários podem ver apenas quartos do seu hotel
CREATE POLICY "Users can view hotel rooms" ON rooms
  FOR SELECT USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Usuários podem gerenciar quartos do seu hotel
CREATE POLICY "Users can manage hotel rooms" ON rooms
  FOR ALL USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA GUESTS
-- =============================================

-- Usuários podem ver apenas hóspedes do seu hotel
CREATE POLICY "Users can view hotel guests" ON guests
  FOR SELECT USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Usuários podem gerenciar hóspedes do seu hotel
CREATE POLICY "Users can manage hotel guests" ON guests
  FOR ALL USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA RESERVATIONS
-- =============================================

-- Usuários podem ver apenas reservas do seu hotel
CREATE POLICY "Users can view hotel reservations" ON reservations
  FOR SELECT USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Usuários podem gerenciar reservas do seu hotel
CREATE POLICY "Users can manage hotel reservations" ON reservations
  FOR ALL USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA CLEANING_TASKS
-- =============================================

-- Usuários podem ver apenas tarefas de limpeza do seu hotel
CREATE POLICY "Users can view hotel cleaning tasks" ON cleaning_tasks
  FOR SELECT USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Usuários podem gerenciar tarefas de limpeza do seu hotel
CREATE POLICY "Users can manage hotel cleaning tasks" ON cleaning_tasks
  FOR ALL USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA MAINTENANCE_ORDERS
-- =============================================

-- Usuários podem ver apenas ordens de manutenção do seu hotel
CREATE POLICY "Users can view hotel maintenance orders" ON maintenance_orders
  FOR SELECT USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Usuários podem gerenciar ordens de manutenção do seu hotel
CREATE POLICY "Users can manage hotel maintenance orders" ON maintenance_orders
  FOR ALL USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA FINANCIAL_TRANSACTIONS
-- =============================================

-- Usuários podem ver apenas transações financeiras do seu hotel
CREATE POLICY "Users can view hotel financial transactions" ON financial_transactions
  FOR SELECT USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Apenas usuários com permissão financeira podem gerenciar transações
CREATE POLICY "Financial users can manage transactions" ON financial_transactions
  FOR ALL USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('hotel_owner', 'hotel_admin', 'financial')
    )
  );

-- =============================================
-- POLÍTICAS PARA SUBSCRIPTION_PLANS (Master Admin)
-- =============================================

-- Todos podem ver planos ativos
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Apenas master admins podem gerenciar planos
CREATE POLICY "Master admins can manage subscription plans" ON subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'master_admin'
    )
  );

-- =============================================
-- POLÍTICAS PARA SUBSCRIPTIONS
-- =============================================

-- Usuários podem ver apenas suas próprias assinaturas
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (
    hotel_id IN (
      SELECT hotel_id FROM profiles 
      WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'master_admin'
    )
  );

-- Master admins podem gerenciar todas as assinaturas
CREATE POLICY "Master admins can manage all subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'master_admin'
    )
  );

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para verificar se usuário é master admin
CREATE OR REPLACE FUNCTION is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'master_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter hotel_id do usuário atual
CREATE OR REPLACE FUNCTION current_user_hotel_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT hotel_id FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
