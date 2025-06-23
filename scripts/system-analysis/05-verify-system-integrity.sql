-- Verify system integrity after fixes
-- This script checks if everything is working correctly

-- 1. Verify auth users exist
SELECT 
    'Auth Users' as check_type,
    COUNT(*) as count,
    string_agg(email, ', ') as emails
FROM auth.users;

-- 2. Verify profiles exist and are linked
SELECT 
    'Profiles' as check_type,
    COUNT(*) as count,
    string_agg(email || ' (' || role || ')', ', ') as profiles
FROM profiles;

-- 3. Verify hotels exist
SELECT 
    'Hotels' as check_type,
    COUNT(*) as count,
    string_agg(name, ', ') as hotels
FROM hotels;

-- 4. Verify foreign key relationships
SELECT 
    'Profile-Auth Link' as check_type,
    COUNT(*) as linked_profiles
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id;

-- 5. Verify RLS policies are active
SELECT 
    'RLS Policies' as check_type,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'hotels');

-- 6. Test the get_current_user_profile function
SELECT 'Function Test' as check_type, 'get_current_user_profile exists' as status
WHERE EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_current_user_profile'
);

-- 7. Check for any constraint violations
SELECT 
    'Constraint Check' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'No violations found'
        ELSE CAST(COUNT(*) AS TEXT) || ' violations found'
    END as status
FROM (
    SELECT * FROM profiles WHERE hotel_id IS NOT NULL 
    AND hotel_id NOT IN (SELECT id FROM hotels)
) violations;
