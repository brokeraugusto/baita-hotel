-- Function to safely create triggers
DO $$
BEGIN
    -- Profiles table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Subscription plans table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscription_plans_updated_at') THEN
        CREATE TRIGGER update_subscription_plans_updated_at 
        BEFORE UPDATE ON subscription_plans 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Rooms table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rooms_updated_at') THEN
        CREATE TRIGGER update_rooms_updated_at 
        BEFORE UPDATE ON rooms 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Guests table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_guests_updated_at') THEN
        CREATE TRIGGER update_guests_updated_at 
        BEFORE UPDATE ON guests 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Reservations table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reservations_updated_at') THEN
        CREATE TRIGGER update_reservations_updated_at 
        BEFORE UPDATE ON reservations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Maintenance orders table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_orders_updated_at') THEN
        CREATE TRIGGER update_maintenance_orders_updated_at 
        BEFORE UPDATE ON maintenance_orders 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Cleaning tasks table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cleaning_tasks_updated_at') THEN
        CREATE TRIGGER update_cleaning_tasks_updated_at 
        BEFORE UPDATE ON cleaning_tasks 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Room categories table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_room_categories_updated_at') THEN
        CREATE TRIGGER update_room_categories_updated_at 
        BEFORE UPDATE ON room_categories 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Pricing rules table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pricing_rules_updated_at') THEN
        CREATE TRIGGER update_pricing_rules_updated_at 
        BEFORE UPDATE ON pricing_rules 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Expenses table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_expenses_updated_at') THEN
        CREATE TRIGGER update_expenses_updated_at 
        BEFORE UPDATE ON expenses 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Financial transactions table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_financial_transactions_updated_at') THEN
        CREATE TRIGGER update_financial_transactions_updated_at 
        BEFORE UPDATE ON financial_transactions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Support tickets table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_support_tickets_updated_at') THEN
        CREATE TRIGGER update_support_tickets_updated_at 
        BEFORE UPDATE ON support_tickets 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

END $$;
