-- Function to temporarily disable RLS for development purposes
-- WARNING: This should NEVER be used in production!
CREATE OR REPLACE FUNCTION temporarily_disable_rls()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- This is important as it runs with the privileges of the function creator
AS $$
BEGIN
  -- In a real production environment, you would implement proper authentication checks here
  -- For development purposes, we're just returning true
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION temporarily_disable_rls() TO authenticated;
GRANT EXECUTE ON FUNCTION temporarily_disable_rls() TO anon;
GRANT EXECUTE ON FUNCTION temporarily_disable_rls() TO service_role;
