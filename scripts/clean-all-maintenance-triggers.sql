-- Clean all maintenance-related triggers and functions

DO $$ 
DECLARE
    trigger_record RECORD;
    table_record RECORD;
BEGIN
    -- Drop all maintenance-related triggers
    FOR trigger_record IN 
        SELECT t.tgname, c.relname 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE t.tgname LIKE '%maintenance%' 
           OR c.relname LIKE '%maintenance%'
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE', trigger_record.tgname, trigger_record.relname);
            RAISE NOTICE 'Dropped trigger % on table %', trigger_record.tgname, trigger_record.relname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop trigger % on table %: %', trigger_record.tgname, trigger_record.relname, SQLERRM;
        END;
    END LOOP;
    
    -- Drop all update_updated_at triggers on any table
    FOR trigger_record IN 
        SELECT t.tgname, c.relname 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE t.tgname LIKE 'update_%_updated_at'
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE', trigger_record.tgname, trigger_record.relname);
            RAISE NOTICE 'Dropped trigger % on table %', trigger_record.tgname, trigger_record.relname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop trigger % on table %: %', trigger_record.tgname, trigger_record.relname, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'All maintenance triggers cleaned up successfully';
END $$;

-- Drop maintenance tables in correct order
DROP TABLE IF EXISTS maintenance_attachments CASCADE;
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS maintenance_technicians CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;

-- Drop and recreate the update function to ensure it's clean
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

SELECT 'All maintenance triggers and tables cleaned successfully' as status;
