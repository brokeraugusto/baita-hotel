-- Safe cleanup script that checks for existence before dropping

-- Drop triggers safely
DO $$ 
BEGIN
    -- Drop triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_orders_updated_at') THEN
        DROP TRIGGER update_maintenance_orders_updated_at ON maintenance_orders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_technicians_updated_at') THEN
        DROP TRIGGER update_maintenance_technicians_updated_at ON maintenance_technicians;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_categories_updated_at') THEN
        DROP TRIGGER update_maintenance_categories_updated_at ON maintenance_categories;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_attachments_updated_at') THEN
        DROP TRIGGER update_maintenance_attachments_updated_at ON maintenance_attachments;
    END IF;
END $$;

-- Drop tables safely in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS maintenance_attachments CASCADE;
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS maintenance_technicians CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;

-- Drop function safely
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Clean up any maintenance-related data in other tables
DO $$
BEGIN
    -- Only clean rooms if the table exists and has the status column
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'status') THEN
            UPDATE rooms SET status = 'available' WHERE status = 'maintenance';
        END IF;
    END IF;
END $$;

-- Show what was cleaned
SELECT 'Maintenance module cleanup completed successfully' as status;
