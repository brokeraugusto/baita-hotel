-- Configurar Row Level Security (RLS) para segurança

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS PARA HOTELS
CREATE POLICY "Hotel owners can manage their hotels" ON hotels
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Hotel staff can view their hotel" ON hotels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('hotel_admin', 'hotel_staff')
        )
    );

-- POLÍTICAS PARA ROOMS
CREATE POLICY "Hotel users can manage rooms" ON rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hotels 
            WHERE hotels.id = rooms.hotel_id 
            AND (
                hotels.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('hotel_admin', 'hotel_staff')
                )
            )
        )
    );

-- POLÍTICAS PARA RESERVATIONS
CREATE POLICY "Hotel users can manage reservations" ON reservations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hotels 
            WHERE hotels.id = reservations.hotel_id 
            AND (
                hotels.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('hotel_admin', 'hotel_staff')
                )
            )
        )
    );

-- POLÍTICAS PARA MAINTENANCE
CREATE POLICY "Hotel users can manage maintenance" ON maintenance_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hotels 
            WHERE hotels.id = maintenance_orders.hotel_id 
            AND (
                hotels.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('hotel_admin', 'hotel_staff')
                )
            )
        )
    );

-- POLÍTICAS PARA CLEANING
CREATE POLICY "Hotel users can manage cleaning" ON cleaning_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hotels 
            WHERE hotels.id = cleaning_tasks.hotel_id 
            AND (
                hotels.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('hotel_admin', 'hotel_staff')
                )
            )
        )
    );

-- POLÍTICAS PARA FINANCIAL
CREATE POLICY "Hotel users can manage finances" ON financial_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hotels 
            WHERE hotels.id = financial_transactions.hotel_id 
            AND (
                hotels.owner_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('hotel_admin', 'hotel_staff')
                )
            )
        )
    );

-- Aplicar políticas similares para outras tabelas relacionadas
CREATE POLICY "Hotel users can manage room categories" ON room_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hotels 
            WHERE hotels.id = room_categories.hotel_id 
            AND hotels.owner_id = auth.uid()
        )
    );

CREATE POLICY "Hotel users can manage guests" ON guests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM hotels 
            WHERE hotels.id = guests.hotel_id 
            AND hotels.owner_id = auth.uid()
        )
    );

RAISE NOTICE '🛡️ Segurança RLS configurada com sucesso!';
