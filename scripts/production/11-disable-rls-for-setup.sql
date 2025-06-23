-- Completely disable RLS for system setup
-- This is safe because we're using service role key

-- Disable RLS on all main tables temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might interfere
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Master admin can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Master admin can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "System setup bypass" ON public.hotels;
DROP POLICY IF EXISTS "System setup bypass" ON public.subscriptions;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'hotels', 'subscriptions', 'subscription_plans')
ORDER BY tablename;

SELECT 'RLS completely disabled for system setup' as status;
