-- Temporarily disable RLS for system setup
-- This allows the initial master admin creation to work

-- Disable RLS on user_profiles temporarily for system setup
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Add temporary bypass policies for other tables during setup
DROP POLICY IF EXISTS "System setup bypass" ON public.hotels;
DROP POLICY IF EXISTS "System setup bypass" ON public.subscriptions;

CREATE POLICY "System setup bypass" ON public.hotels
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "System setup bypass" ON public.subscriptions
    FOR ALL USING (true)
    WITH CHECK (true);

-- We'll re-enable RLS after master admin is created
SELECT 'RLS temporarily disabled for system setup' as status;
