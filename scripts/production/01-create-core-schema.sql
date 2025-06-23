-- Core Database Schema - Production Ready
-- Clean, well-structured schema with proper naming conventions

-- User roles enum
CREATE TYPE user_role_enum AS ENUM (
    'master_admin',
    'hotel_owner', 
    'hotel_staff',
    'guest'
);

-- Subscription status enum
CREATE TYPE subscription_status_enum AS ENUM (
    'trial',
    'active', 
    'suspended',
    'cancelled',
    'expired'
);

-- Hotel status enum  
CREATE TYPE hotel_status_enum AS ENUM (
    'active',
    'suspended',
    'pending_setup',
    'cancelled'
);

-- Room status enum
CREATE TYPE room_status_enum AS ENUM (
    'available',
    'occupied',
    'maintenance', 
    'cleaning',
    'out_of_order'
);

-- Reservation status enum
CREATE TYPE reservation_status_enum AS ENUM (
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show'
);

-- Payment status enum
CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);

-- Billing cycle enum
CREATE TYPE billing_cycle_enum AS ENUM (
    'monthly',
    'yearly'
);

-- Maintenance priority enum
CREATE TYPE maintenance_priority_enum AS ENUM (
    'low',
    'medium', 
    'high',
    'urgent'
);

-- Maintenance status enum
CREATE TYPE maintenance_status_enum AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);

-- Cleaning task type enum
CREATE TYPE cleaning_task_type_enum AS ENUM (
    'daily',
    'deep',
    'checkout',
    'maintenance',
    'inspection'
);

-- Cleaning status enum
CREATE TYPE cleaning_status_enum AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'verified',
    'failed'
);

-- User Profiles Table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    user_role user_role_enum NOT NULL DEFAULT 'hotel_owner',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscription Plans Table
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    features TEXT[] NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    max_hotels INTEGER NOT NULL DEFAULT 1,
    max_rooms INTEGER NOT NULL DEFAULT 50,
    max_users INTEGER NOT NULL DEFAULT 5,
    max_integrations INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hotels Table
CREATE TABLE public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    tax_id VARCHAR(50),
    status hotel_status_enum NOT NULL DEFAULT 'pending_setup',
    settings JSONB NOT NULL DEFAULT '{}',
    branding JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status subscription_status_enum NOT NULL DEFAULT 'trial',
    billing_cycle billing_cycle_enum NOT NULL DEFAULT 'monthly',
    current_price DECIMAL(10,2) NOT NULL,
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    floor INTEGER,
    capacity INTEGER NOT NULL DEFAULT 2,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    images TEXT[] NOT NULL DEFAULT '{}',
    status room_status_enum NOT NULL DEFAULT 'available',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(hotel_id, room_number)
);

-- Guests Table
CREATE TABLE public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    nationality VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    postal_code VARCHAR(20),
    is_vip BOOLEAN NOT NULL DEFAULT false,
    preferences JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reservations Table
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    reservation_number VARCHAR(50) UNIQUE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER NOT NULL DEFAULT 0,
    status reservation_status_enum NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    booking_source VARCHAR(100),
    special_requests TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (check_out_date > check_in_date),
    CHECK (adults > 0),
    CHECK (children >= 0),
    CHECK (total_amount >= 0),
    CHECK (paid_amount >= 0)
);

-- Maintenance Orders Table
CREATE TABLE public.maintenance_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority maintenance_priority_enum NOT NULL DEFAULT 'medium',
    status maintenance_status_enum NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reported_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    scheduled_for TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    attachments TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (estimated_cost >= 0),
    CHECK (actual_cost >= 0),
    CHECK (estimated_duration > 0),
    CHECK (actual_duration > 0)
);

-- Cleaning Tasks Table
CREATE TABLE public.cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    task_type cleaning_task_type_enum NOT NULL DEFAULT 'daily',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status cleaning_status_enum NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    scheduled_for TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    checklist JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (priority > 0),
    CHECK (estimated_duration > 0),
    CHECK (actual_duration > 0)
);

-- Financial Transactions Table
CREATE TABLE public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_method VARCHAR(50),
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    description TEXT,
    reference_number VARCHAR(100),
    processed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (amount != 0)
);

-- Subscription Payments Table
CREATE TABLE public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_method VARCHAR(50),
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    invoice_number VARCHAR(100),
    payment_gateway_id VARCHAR(255),
    failure_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (amount > 0),
    CHECK (period_end > period_start)
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(user_role);
CREATE INDEX idx_user_profiles_active ON public.user_profiles(is_active);

CREATE INDEX idx_hotels_owner ON public.hotels(owner_id);
CREATE INDEX idx_hotels_status ON public.hotels(status);
CREATE INDEX idx_hotels_slug ON public.hotels(slug);

CREATE INDEX idx_subscriptions_hotel ON public.subscriptions(hotel_id);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX idx_rooms_hotel ON public.rooms(hotel_id);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_active ON public.rooms(is_active);

CREATE INDEX idx_guests_hotel ON public.guests(hotel_id);
CREATE INDEX idx_guests_email ON public.guests(email);

CREATE INDEX idx_reservations_hotel ON public.reservations(hotel_id);
CREATE INDEX idx_reservations_room ON public.reservations(room_id);
CREATE INDEX idx_reservations_guest ON public.reservations(guest_id);
CREATE INDEX idx_reservations_dates ON public.reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);

CREATE INDEX idx_maintenance_hotel ON public.maintenance_orders(hotel_id);
CREATE INDEX idx_maintenance_room ON public.maintenance_orders(room_id);
CREATE INDEX idx_maintenance_status ON public.maintenance_orders(status);
CREATE INDEX idx_maintenance_assigned ON public.maintenance_orders(assigned_to);

CREATE INDEX idx_cleaning_hotel ON public.cleaning_tasks(hotel_id);
CREATE INDEX idx_cleaning_room ON public.cleaning_tasks(room_id);
CREATE INDEX idx_cleaning_status ON public.cleaning_tasks(status);
CREATE INDEX idx_cleaning_assigned ON public.cleaning_tasks(assigned_to);
CREATE INDEX idx_cleaning_scheduled ON public.cleaning_tasks(scheduled_for);

CREATE INDEX idx_transactions_hotel ON public.financial_transactions(hotel_id);
CREATE INDEX idx_transactions_reservation ON public.financial_transactions(reservation_id);
CREATE INDEX idx_transactions_subscription ON public.financial_transactions(subscription_id);
CREATE INDEX idx_transactions_status ON public.financial_transactions(payment_status);

CREATE INDEX idx_payments_subscription ON public.subscription_payments(subscription_id);
CREATE INDEX idx_payments_status ON public.subscription_payments(payment_status);
CREATE INDEX idx_payments_due_date ON public.subscription_payments(due_date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_orders_updated_at BEFORE UPDATE ON public.maintenance_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cleaning_tasks_updated_at BEFORE UPDATE ON public.cleaning_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_payments_updated_at BEFORE UPDATE ON public.subscription_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

SELECT 'Core schema created successfully' as status;
