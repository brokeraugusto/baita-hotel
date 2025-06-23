-- Create a master admin user for testing
DO $$
DECLARE
    master_user_id UUID;
    master_email TEXT := 'admin@baitahotel.com';
    master_password TEXT := 'Admin123!';
    master_name TEXT := 'Master Administrator';
BEGIN
    -- Check if master admin already exists
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE email = master_email AND role = 'master_admin'
    ) THEN
        RAISE NOTICE 'Master admin already exists with email: %', master_email;
        RETURN;
    END IF;

    -- Create the master admin user
    SELECT create_master_admin_user(master_email, master_password, master_name) INTO master_user_id;
    
    IF master_user_id IS NOT NULL THEN
        RAISE NOTICE 'Master admin created successfully with ID: %', master_user_id;
        RAISE NOTICE 'Email: %', master_email;
        RAISE NOTICE 'Password: %', master_password;
        RAISE NOTICE 'Please change the password after first login!';
    ELSE
        RAISE EXCEPTION 'Failed to create master admin user';
    END IF;
END $$;
