-- Fix profiles table safely without losing existing data
DO $$
DECLARE
    profile_record RECORD;
    backup_count INTEGER;
BEGIN
    RAISE NOTICE '🔧 FIXING PROFILES TABLE SAFELY';
    RAISE NOTICE '================================';
    
    -- First, backup existing profiles
    DROP TABLE IF EXISTS profiles_backup_temp;
    CREATE TABLE profiles_backup_temp AS SELECT * FROM profiles;
    
    SELECT COUNT(*) INTO backup_count FROM profiles_backup_temp;
    RAISE NOTICE '💾 Backed up % profiles', backup_count;
    
    -- Check if hotel_name column exists in profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'hotel_name') THEN
        -- Add hotel_name column to profiles
        ALTER TABLE profiles ADD COLUMN hotel_name VARCHAR(255);
        RAISE NOTICE '✅ Added hotel_name column to profiles';
        
        -- Update hotel_name from hotels table
        UPDATE profiles 
        SET hotel_name = h.name 
        FROM hotels h 
        WHERE profiles.hotel_id = h.id;
        
        RAISE NOTICE '✅ Updated hotel_name values from hotels table';
    ELSE
        RAISE NOTICE '✅ Hotel_name column already exists';
    END IF;
    
    -- Ensure all required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url VARCHAR(500);
        RAISE NOTICE '✅ Added avatar_url column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(50);
        RAISE NOTICE '✅ Added phone column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'settings') THEN
        ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Added settings column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login') THEN
        ALTER TABLE profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Added last_login column';
    END IF;
    
    -- Clean up backup
    DROP TABLE IF EXISTS profiles_backup_temp;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Profiles table schema fixed safely!';
    
END $$;
