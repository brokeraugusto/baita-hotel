-- Add simple_password column to user_profiles table
-- This is needed for our custom authentication system

ALTER TABLE public.user_profiles 
ADD COLUMN simple_password VARCHAR(255);

-- Create index for better performance on authentication queries
CREATE INDEX idx_user_profiles_simple_password ON public.user_profiles(simple_password) WHERE simple_password IS NOT NULL;

-- Update the existing master admin user if it exists
-- (This is safe to run even if no user exists)
UPDATE public.user_profiles 
SET simple_password = 'admin123' 
WHERE user_role = 'master_admin' AND email = 'suporte@o2digital.com.br';

SELECT 'Simple password column added successfully' as status;
