-- Re-enable RLS after system setup is complete
-- This should be run after the master admin is successfully created

-- Re-enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create master admin policies
CREATE POLICY "Master admin can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'master_admin' 
            AND is_active = true
        )
    );

CREATE POLICY "Master admin can manage all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'master_admin' 
            AND is_active = true
        )
    );

-- Create hotel policies
CREATE POLICY "Hotel owners can view own hotel" ON public.hotels
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Hotel owners can update own hotel" ON public.hotels
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Master admin can view all hotels" ON public.hotels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'master_admin' 
            AND is_active = true
        )
    );

CREATE POLICY "Master admin can manage all hotels" ON public.hotels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'master_admin' 
            AND is_active = true
        )
    );

-- Create subscription policies
CREATE POLICY "Hotel owners can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (
        hotel_id IN (
            SELECT id FROM public.hotels WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Master admin can view all subscriptions" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'master_admin' 
            AND is_active = true
        )
    );

CREATE POLICY "Master admin can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'master_admin' 
            AND is_active = true
        )
    );

-- Subscription plans are read-only for all authenticated users
CREATE POLICY "Authenticated users can view subscription plans" ON public.subscription_plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- Verify RLS is re-enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'hotels', 'subscriptions', 'subscription_plans')
ORDER BY tablename;

SELECT 'RLS re-enabled with proper policies' as status;
