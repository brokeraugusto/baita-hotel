-- Create helper functions for auth diagnostics

-- Function to check if auth user exists
CREATE OR REPLACE FUNCTION check_auth_user(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_exists BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = user_email
    ) INTO user_exists;
    
    RETURN user_exists;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Function to get auth users info (for diagnostics)
CREATE OR REPLACE FUNCTION get_auth_users_info()
RETURNS TABLE(
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    email_confirmed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.created_at,
        u.email_confirmed_at
    FROM auth.users u
    WHERE u.email IN ('admin@baitahotel.com', 'hotel@exemplo.com')
    ORDER BY u.email;
EXCEPTION
    WHEN OTHERS THEN
        RETURN;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_auth_user(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_auth_users_info() TO anon, authenticated;
