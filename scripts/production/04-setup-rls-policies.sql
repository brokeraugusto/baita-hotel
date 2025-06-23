-- Row Level Security Policies
-- Secure access control for all tables

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Subscription plans are public (read-only for authenticated users)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- USER PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Master admin can view all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND user_role = 'master_admin'
        )
    );

-- HOTELS POLICIES
CREATE POLICY "Hotel owners can manage their hotels" ON public.hotels
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Master admin can manage all hotels" ON public.hotels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND user_role = 'master_admin'
        )
    );

CREATE POLICY "Hotel staff can view their hotel" ON public.hotels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.hotels h ON h.owner_id = up.id
            WHERE up.id = auth.uid() AND h.id = hotels.id
        )
    );

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Hotel owners can view their subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hotels 
            WHERE id = hotel_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Master admin can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND user_role = 'master_admin'
        )
    );

-- ROOMS POLICIES
CREATE POLICY "Hotel owners can manage their rooms" ON public.rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hotels 
            WHERE id = hotel_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Master admin can view all rooms" ON public.rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND user_role = 'master_admin'
        )
    );

-- GUESTS POLICIES
CREATE POLICY "Hotel owners can manage their guests" ON public.guests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hotels 
            WHERE id = hotel_id AND owner_id = auth.uid()
        )
    );

-- RESERVATIONS POLICIES
CREATE POLICY "Hotel owners can manage their reservations" ON public.reservations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hotels 
            WHERE id = hotel_id AND owner_id = auth.uid()
        )
    );

-- MAINTENANCE ORDERS POLICIES
CREATE POLICY "Hotel owners can manage their maintenance orders" ON public.maintenance_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hotels 
            WHERE id = hotel_id AND owner_id = auth.uid()
        )
    );

-- CLEANING TASKS POLICIES
CREATE POLICY "Hotel owners can manage their cleaning tasks" ON public.cleaning_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hotels 
            WHERE id = hotel_id AND owner_id = auth.uid()
        )
    );

-- FINANCIAL TRANSACTIONS POLICIES
CREATE POLICY "Hotel owners can manage their transactions" ON public.financial_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.hotels 
            WHERE id = hotel_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Master admin can view all transactions" ON public.financial_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND user_role = 'master_admin'
        )
    );

-- SUBSCRIPTION PAYMENTS POLICIES
CREATE POLICY "Hotel owners can view their payments" ON public.subscription_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions s
            JOIN public.hotels h ON h.id = s.hotel_id
            WHERE s.id = subscription_id AND h.owner_id = auth.uid()
        )
    );

CREATE POLICY "Master admin can manage all payments" ON public.subscription_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND user_role = 'master_admin'
        )
    );

-- SUBSCRIPTION PLANS POLICIES (public read access)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Master admin can manage subscription plans" ON public.subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND user_role = 'master_admin'
        )
    );

SELECT 'RLS policies created successfully' as status;
