-- Enable Row Level Security on all maintenance tables
ALTER TABLE maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_categories (public read, admin write)
CREATE POLICY "Anyone can view maintenance categories" ON maintenance_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON maintenance_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for maintenance_technicians (public read, admin write)
CREATE POLICY "Anyone can view active technicians" ON maintenance_technicians
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage technicians" ON maintenance_technicians
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for maintenance_orders (hotel-specific access)
CREATE POLICY "Users can view their hotel's maintenance orders" ON maintenance_orders
    FOR SELECT USING (
        hotel_id = current_setting('app.current_hotel_id', true)
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can create maintenance orders for their hotel" ON maintenance_orders
    FOR INSERT WITH CHECK (
        hotel_id = current_setting('app.current_hotel_id', true)
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their hotel's maintenance orders" ON maintenance_orders
    FOR UPDATE USING (
        hotel_id = current_setting('app.current_hotel_id', true)
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their hotel's maintenance orders" ON maintenance_orders
    FOR DELETE USING (
        hotel_id = current_setting('app.current_hotel_id', true)
        OR auth.role() = 'service_role'
    );

-- Create policies for maintenance_attachments (follows maintenance_orders access)
CREATE POLICY "Users can view attachments for their hotel's orders" ON maintenance_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM maintenance_orders mo 
            WHERE mo.id = maintenance_attachments.maintenance_order_id 
            AND (mo.hotel_id = current_setting('app.current_hotel_id', true)
                 OR auth.role() = 'service_role')
        )
    );

CREATE POLICY "Users can manage attachments for their hotel's orders" ON maintenance_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM maintenance_orders mo 
            WHERE mo.id = maintenance_attachments.maintenance_order_id 
            AND (mo.hotel_id = current_setting('app.current_hotel_id', true)
                 OR auth.role() = 'service_role')
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_technicians TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_attachments TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
