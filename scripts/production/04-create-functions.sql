-- Funções úteis para o sistema

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'hotel_guest');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON maintenance_orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON cleaning_tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Função para criar categorias padrão quando hotel é criado
CREATE OR REPLACE FUNCTION public.create_default_hotel_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar categorias de manutenção padrão
    INSERT INTO maintenance_categories (hotel_id, name, description, color) VALUES
    (NEW.id, 'Elétrica', 'Problemas elétricos e instalações', '#F59E0B'),
    (NEW.id, 'Hidráulica', 'Problemas de água e encanamento', '#3B82F6'),
    (NEW.id, 'Ar Condicionado', 'Manutenção de climatização', '#10B981'),
    (NEW.id, 'Móveis', 'Reparos em móveis e decoração', '#8B5CF6'),
    (NEW.id, 'Limpeza Especial', 'Limpezas especializadas', '#EF4444');

    -- Criar categoria de quarto padrão
    INSERT INTO room_categories (hotel_id, name, description, base_price, max_occupancy) VALUES
    (NEW.id, 'Standard', 'Quarto padrão', 150.00, 2);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar dados padrão do hotel
DROP TRIGGER IF EXISTS on_hotel_created ON hotels;
CREATE TRIGGER on_hotel_created
    AFTER INSERT ON hotels
    FOR EACH ROW EXECUTE FUNCTION public.create_default_hotel_data();

RAISE NOTICE '⚙️ Funções e triggers criados com sucesso!';
