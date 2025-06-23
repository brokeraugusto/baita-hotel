-- Diagnose User Creation Issues
-- Check what's actually in the database

-- Check if user_profiles table exists and its structure
SELECT 'Checking user_profiles table structure...' as step;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if any users exist
SELECT 'Checking existing users...' as step;

SELECT 
    id,
    email,
    full_name,
    user_role,
    is_active,
    is_email_verified,
    password_hash IS NOT NULL as has_password_hash,
    simple_password IS NOT NULL as has_simple_password,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- Check if master admin exists
SELECT 'Checking for master admin...' as step;

SELECT COUNT(*) as master_admin_count
FROM public.user_profiles
WHERE user_role = 'master_admin' AND is_active = true;

-- Test the system status function
SELECT 'Testing system status function...' as step;

SELECT public.get_system_status() as system_status;

-- Test the authentication function with a known user (if any exists)
SELECT 'Testing authentication function...' as step;

DO $$
DECLARE
    test_email text;
    auth_result jsonb;
BEGIN
    -- Get the first user email for testing
    SELECT email INTO test_email
    FROM public.user_profiles
    WHERE user_role = 'master_admin'
    LIMIT 1;
    
    IF test_email IS NOT NULL THEN
        -- Test authentication with empty password first
        SELECT public.authenticate_user(test_email, '') INTO auth_result;
        RAISE NOTICE 'Auth test with empty password: %', auth_result;
        
        -- Test authentication with 'admin123'
        SELECT public.authenticate_user(test_email, 'admin123') INTO auth_result;
        RAISE NOTICE 'Auth test with admin123: %', auth_result;
    ELSE
        RAISE NOTICE 'No master admin found to test authentication';
    END IF;
END $$;

-- Check RLS status
SELECT 'Checking RLS status...' as step;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'hotels', 'subscriptions', 'subscription_plans')
ORDER BY tablename;

SELECT 'Diagnosis complete' as status;
