-- Drop all maintenance-related tables and dependencies
DROP TRIGGER IF EXISTS update_maintenance_orders_updated_at ON maintenance_orders;
DROP TRIGGER IF EXISTS update_maintenance_technicians_updated_at ON maintenance_technicians;
DROP TRIGGER IF EXISTS update_maintenance_categories_updated_at ON maintenance_categories;
DROP TRIGGER IF EXISTS update_maintenance_attachments_updated_at ON maintenance_attachments;

-- Drop tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS maintenance_attachments CASCADE;
DROP TABLE IF EXISTS maintenance_orders CASCADE;
DROP TABLE IF EXISTS maintenance_technicians CASCADE;
DROP TABLE IF EXISTS maintenance_categories CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Clean up any orphaned data
DELETE FROM rooms WHERE status = 'maintenance' AND id NOT IN (
  SELECT DISTINCT room_id FROM maintenance_orders WHERE room_id IS NOT NULL
);
