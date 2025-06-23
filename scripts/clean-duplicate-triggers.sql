-- Script to clean up any duplicate triggers if they exist
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Drop existing triggers if they exist (to avoid conflicts)
    FOR trigger_record IN 
        SELECT tgname, relname 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE tgname LIKE 'update_%_updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_record.tgname, trigger_record.relname);
    END LOOP;
    
    RAISE NOTICE 'All update triggers have been cleaned up';
END $$;
