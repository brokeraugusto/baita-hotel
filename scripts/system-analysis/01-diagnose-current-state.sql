-- Comprehensive system diagnosis
-- Check current database state and identify issues

-- 1. Check if auth schema exists and is properly configured
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname IN ('auth', 'public')
ORDER BY schemaname, tablename;

-- 2. Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check for existing users in auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check profiles data consistency
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_active,
  u.email as auth_email,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Check for any constraint violations
SELECT 
  conname,
  contype,
  conrelid::regclass as table_name
FROM pg_constraint 
WHERE conrelid IN (
  SELECT oid FROM pg_class WHERE relname IN ('profiles', 'hotels', 'rooms')
);
