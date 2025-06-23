CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plans_count        int;
  has_master_admin   bool;
  hotel_cnt          int;
  client_cnt         int;
BEGIN
  SELECT COUNT(*) INTO plans_count FROM public.subscription_plans WHERE is_active = true;
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE user_role = 'master_admin' AND is_active = true
  ) INTO has_master_admin;
  SELECT COUNT(*) INTO hotel_cnt  FROM public.hotels;
  SELECT COUNT(*) INTO client_cnt FROM public.user_profiles WHERE user_role = 'hotel_owner';

  RETURN jsonb_build_object(
    'system_initialized', has_master_admin AND plans_count > 0,
    'database_ready',      true,
    'has_master_admin',    has_master_admin,
    'subscription_plans_count', plans_count,
    'version', '2.0.0',
    'requires_setup', NOT has_master_admin,
    'statistics', jsonb_build_object(
        'total_hotels',  hotel_cnt,
        'total_clients', client_cnt,
        'master_admin_exists', has_master_admin
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_system_status() TO authenticated, anon, service_role;
