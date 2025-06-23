-- Cria ou substitui função para criação do primeiro master admin
CREATE OR REPLACE FUNCTION public.create_master_admin(
  admin_email     text,
  admin_password  text,
  admin_name      text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_admin int;
  new_user_id  uuid := gen_random_uuid();
BEGIN
  SELECT COUNT(*) INTO exists_admin
  FROM public.user_profiles
  WHERE user_role = 'master_admin'
    AND is_active = true;

  IF exists_admin > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Master-admin já existe'
    );
  END IF;

  INSERT INTO public.user_profiles(
      id,
      email,
      full_name,
      user_role,
      simple_password,
      is_active,
      is_email_verified,
      created_at,
      updated_at
  )
  VALUES (
      new_user_id,
      LOWER(TRIM(admin_email)),
      TRIM(admin_name),
      'master_admin',
      admin_password,     -- ← por enquanto em texto simples
      TRUE,
      TRUE,
      NOW(),
      NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'Master-admin criado com sucesso'
  );
EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM
    );
END;
$$;

-- Permite que anon / authenticated / service_role executem
GRANT EXECUTE ON FUNCTION public.create_master_admin(text, text, text) TO authenticated, anon, service_role;
