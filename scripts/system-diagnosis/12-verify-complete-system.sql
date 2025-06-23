-- Comprehensive system verification after fixes
DO $$
DECLARE
    rec RECORD;
    table_count INTEGER;
    profile_count INTEGER;
    hotel_count INTEGER;
    auth_user_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 === COMPLETE SYSTEM VERIFICATION ===';
    RAISE NOTICE '====================================';
    
    -- 1. Check user_role enum
    RAISE NOTICE '';
    RAISE NOTICE '🏷️ 1. USER_ROLE ENUM:';
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE NOTICE '✅ user_role enum exists';
        FOR rec IN 
            SELECT enumlabel 
            FROM pg_enum e 
            JOIN pg_type t ON e.enumtypid = t.oid 
            WHERE t.typname = 'user_role'
        LOOP
            RAISE NOTICE '  - %', rec.enumlabel;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ user_role enum missing';
    END IF;
    
    -- 2. Check hotels table
    RAISE NOTICE '';
    RAISE NOTICE '🏨 2. HOTELS TABLE:';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels') THEN
        SELECT COUNT(*) INTO hotel_count FROM hotels;
        RAISE NOTICE '✅ Hotels table exists with % records', hotel_count;
        
        -- Show hotel columns
        RAISE NOTICE '  Columns:';
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'hotels' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '    - % (%)', rec.column_name, rec.data_type;
        END LOOP;
        
        -- Show sample hotels
        IF hotel_count > 0 THEN
            RAISE NOTICE '  Sample hotels:';
            FOR rec IN SELECT name, email, city, state FROM hotels LIMIT 3
            LOOP
                RAISE NOTICE '    - % (%) - %, %', rec.name, rec.email, 
                    COALESCE(rec.city, 'N/A'), COALESCE(rec.state, 'N/A');
            END LOOP;
        END IF;
    ELSE
        RAISE NOTICE '❌ Hotels table missing';
    END IF;
    
    -- 3. Check profiles table
    RAISE NOTICE '';
    RAISE NOTICE '👤 3. PROFILES TABLE:';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        SELECT COUNT(*) INTO profile_count FROM profiles;
        RAISE NOTICE '✅ Profiles table exists with % records', profile_count;
        
        -- Show profile columns
        RAISE NOTICE '  Columns:';
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '    - % (%)', rec.column_name, rec.data_type;
        END LOOP;
        
        -- Show sample profiles
        IF profile_count > 0 THEN
            RAISE NOTICE '  Sample profiles:';
            FOR rec IN 
                SELECT email, full_name, role::text, hotel_name 
                FROM profiles 
                LIMIT 5
            LOOP
                RAISE NOTICE '    - % (%) - % - %', rec.email, rec.full_name, 
                    rec.role, COALESCE(rec.hotel_name, 'No hotel');
            END LOOP;
        END IF;
    ELSE
        RAISE NOTICE '❌ Profiles table missing';
    END IF;
    
    -- 4. Check auth users
    RAISE NOTICE '';
    RAISE NOTICE '🔐 4. AUTH USERS:';
    
    BEGIN
        SELECT COUNT(*) INTO auth_user_count FROM auth.users;
        RAISE NOTICE '✅ Auth users table accessible with % records', auth_user_count;
        
        IF auth_user_count > 0 THEN
            RAISE NOTICE '  Sample auth users:';
            FOR rec IN 
                SELECT email, email_confirmed_at IS NOT NULL as confirmed 
                FROM auth.users 
                LIMIT 5
            LOOP
                RAISE NOTICE '    - % (%)', rec.email, 
                    CASE WHEN rec.confirmed THEN 'Confirmed' ELSE 'Not confirmed' END;
            END LOOP;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot access auth.users: %', SQLERRM;
    END;
    
    -- 5. Test login credentials
    RAISE NOTICE '';
    RAISE NOTICE '🔑 5. LOGIN CREDENTIALS TEST:';
    
    -- Check if test users exist in both auth and profiles
    DECLARE
        master_auth_exists BOOLEAN;
        master_profile_exists BOOLEAN;
        client_auth_exists BOOLEAN;
        client_profile_exists BOOLEAN;
    BEGIN
        -- Master admin
        SELECT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@baitahotel.com') INTO master_auth_exists;
        SELECT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@baitahotel.com') INTO master_profile_exists;
        
        -- Client
        SELECT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hotel@exemplo.com') INTO client_auth_exists;
        SELECT EXISTS (SELECT 1 FROM profiles WHERE email = 'hotel@exemplo.com') INTO client_profile_exists;
        
        RAISE NOTICE '  👑 Master Admin (admin@baitahotel.com):';
        RAISE NOTICE '    Auth: %', CASE WHEN master_auth_exists THEN '✅ OK' ELSE '❌ Missing' END;
        RAISE NOTICE '    Profile: %', CASE WHEN master_profile_exists THEN '✅ OK' ELSE '❌ Missing' END;
        
        RAISE NOTICE '  👤 Client (hotel@exemplo.com):';
        RAISE NOTICE '    Auth: %', CASE WHEN client_auth_exists THEN '✅ OK' ELSE '❌ Missing' END;
        RAISE NOTICE '    Profile: %', CASE WHEN client_profile_exists THEN '✅ OK' ELSE '❌ Missing' END;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '  ❌ Error checking credentials: %', SQLERRM;
    END;
    
    -- 6. System health summary
    RAISE NOTICE '';
    RAISE NOTICE '📊 6. SYSTEM HEALTH SUMMARY:';
    
    DECLARE
        enum_ok BOOLEAN := EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role');
        hotels_ok BOOLEAN := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotels');
        profiles_ok BOOLEAN := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles');
        auth_ok BOOLEAN := auth_user_count > 0;
        data_ok BOOLEAN := profile_count > 0 AND hotel_count > 0;
    BEGIN
        RAISE NOTICE '  Enum: %', CASE WHEN enum_ok THEN '✅' ELSE '❌' END;
        RAISE NOTICE '  Hotels table: %', CASE WHEN hotels_ok THEN '✅' ELSE '❌' END;
        RAISE NOTICE '  Profiles table: %', CASE WHEN profiles_ok THEN '✅' ELSE '❌' END;
        RAISE NOTICE '  Auth users: %', CASE WHEN auth_ok THEN '✅' ELSE '❌' END;
        RAISE NOTICE '  Sample data: %', CASE WHEN data_ok THEN '✅' ELSE '❌' END;
        
        IF enum_ok AND hotels_ok AND profiles_ok AND auth_ok AND data_ok THEN
            RAISE NOTICE '';
            RAISE NOTICE '🎉 SYSTEM IS READY FOR TESTING!';
            RAISE NOTICE '';
            RAISE NOTICE '🔑 TEST CREDENTIALS:';
            RAISE NOTICE '  👑 Master: admin@baitahotel.com / 123456789';
            RAISE NOTICE '  👤 Client: hotel@exemplo.com / 123456789';
        ELSE
            RAISE NOTICE '';
            RAISE NOTICE '⚠️ SYSTEM NEEDS ATTENTION - Some components are missing';
        END IF;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ === VERIFICATION COMPLETE ===';
    
END $$;
