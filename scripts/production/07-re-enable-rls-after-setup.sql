-- Re-enable RLS after system setup is complete
-- This should be run after the master admin is created

-- Remove the temporary bypass policies
DROP POLICY IF EXISTS "System setup bypass" ON public.hotels;
DROP POLICY IF EXISTS "System setup bypass" ON public.subscriptions;

-- Re-enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_profiles', 'hotels', 'subscriptions', 'rooms', 
    'guests', 'reservations', 'maintenance_orders', 
    'cleaning_tasks', 'financial_transactions', 
    'subscription_payments', 'subscription_plans'
)
ORDER BY tablename;

SELECT 'RLS re-enabled after system setup' as status;
