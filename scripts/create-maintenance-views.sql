-- Criar views para facilitar consultas
BEGIN;

SELECT 'CRIANDO VIEWS PARA FACILITAR CONSULTAS' as title;

-- View com dados completos das ordens de manutenção
CREATE OR REPLACE VIEW v_maintenance_orders_complete AS
SELECT 
    mo.id,
    mo.hotel_id,
    mo.order_number,
    mo.title,
    mo.description,
    mo.priority,
    mo.status,
    mo.maintenance_type,
    mo.is_emergency,
    mo.estimated_cost,
    mo.actual_cost,
    mo.estimated_duration,
    mo.actual_duration,
    mo.scheduled_date,
    mo.started_at,
    mo.completed_at,
    mo.created_at,
    mo.updated_at,
    
    -- Dados do quarto
    r.room_number,
    r.room_type,
    r.floor_number,
    
    -- Dados da categoria
    mc.name as category_name,
    mc.color as category_color,
    mc.icon as category_icon,
    
    -- Dados do técnico
    mt.name as technician_name,
    mt.email as technician_email,
    mt.phone as technician_phone,
    
    -- Campos de compatibilidade
    mo.assigned_technician_id as assigned_to,
    mo.reported_by,
    mo.location,
    mo.completion_notes,
    mo.quality_rating,
    mo.quality_notes
    
FROM maintenance_orders mo
LEFT JOIN rooms r ON mo.room_id = r.id
LEFT JOIN maintenance_categories mc ON mo.category_id = mc.id
LEFT JOIN maintenance_technicians mt ON mo.assigned_technician_id = mt.id;

-- View para estatísticas de manutenção
CREATE OR REPLACE VIEW v_maintenance_stats AS
SELECT 
    hotel_id,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    COUNT(CASE WHEN priority = 'urgent' AND status IN ('pending', 'in_progress') THEN 1 END) as urgent_orders,
    COUNT(CASE WHEN is_emergency = true THEN 1 END) as emergency_orders,
    AVG(actual_cost) as avg_cost,
    SUM(actual_cost) as total_cost,
    AVG(actual_duration) as avg_duration
FROM maintenance_orders
GROUP BY hotel_id;

-- View para ordens por técnico
CREATE OR REPLACE VIEW v_technician_workload AS
SELECT 
    mt.id as technician_id,
    mt.name as technician_name,
    mt.email,
    mt.phone,
    COUNT(mo.id) as total_orders,
    COUNT(CASE WHEN mo.status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN mo.status = 'in_progress' THEN 1 END) as in_progress_orders,
    COUNT(CASE WHEN mo.status = 'completed' THEN 1 END) as completed_orders,
    AVG(mo.quality_rating) as avg_rating,
    SUM(mo.actual_cost) as total_revenue
FROM maintenance_technicians mt
LEFT JOIN maintenance_orders mo ON mt.id = mo.assigned_technician_id
WHERE mt.is_active = true
GROUP BY mt.id, mt.name, mt.email, mt.phone;

COMMIT;

SELECT 'Views criadas com sucesso!' as status;

-- Testar as views
SELECT 'TESTANDO VIEW v_maintenance_orders_complete:' as title;
SELECT 
    order_number,
    title,
    status,
    category_name,
    technician_name,
    room_number
FROM v_maintenance_orders_complete 
LIMIT 5;

SELECT 'TESTANDO VIEW v_maintenance_stats:' as title;
SELECT * FROM v_maintenance_stats;
