-- =============================================
-- ÍNDICES PARA PERFORMANCE EM PRODUÇÃO
-- =============================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_hotel_id ON profiles(hotel_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Índices para hotels
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);
CREATE INDEX IF NOT EXISTS idx_hotels_is_active ON hotels(is_active);

-- Índices para rooms
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(hotel_id, number);

-- Índices para guests
CREATE INDEX IF NOT EXISTS idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_document_number ON guests(document_number);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);

-- Índices para reservations
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_id ON reservations(hotel_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_check_in_date ON reservations(check_in_date);
CREATE INDEX IF NOT EXISTS idx_reservations_check_out_date ON reservations(check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_number ON reservations(reservation_number);

-- Índices para cleaning_tasks
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_hotel_id ON cleaning_tasks(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_room_id ON cleaning_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_status ON cleaning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_scheduled_for ON cleaning_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_assigned_personnel ON cleaning_tasks(assigned_personnel_id);

-- Índices para maintenance_orders
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_id ON maintenance_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_room_id ON maintenance_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_priority ON maintenance_orders(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_created_at ON maintenance_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_assigned_personnel ON maintenance_orders(assigned_personnel_id);

-- Índices para financial_transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_hotel_id ON financial_transactions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reservation_id ON financial_transactions(reservation_id);

-- Índices para subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort_order ON subscription_plans(sort_order);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotel_id ON subscriptions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_dates ON reservations(hotel_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_hotel_status ON cleaning_tasks(hotel_id, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_hotel_status ON maintenance_orders(hotel_id, status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_hotel_date ON financial_transactions(hotel_id, transaction_date);
