-- Insert sample analytics data

-- Sample analytics events
INSERT INTO analytics_events (event_name, hotel_id, properties) VALUES
('reservation_created', (SELECT id FROM hotels LIMIT 1), '{"amount": 250.00, "nights": 2}'),
('check_in_completed', (SELECT id FROM hotels LIMIT 1), '{"room_number": "101", "guest_count": 2}'),
('maintenance_requested', (SELECT id FROM hotels LIMIT 1), '{"priority": "high", "category": "plumbing"}'),
('payment_received', (SELECT id FROM hotels LIMIT 1), '{"amount": 250.00, "method": "credit_card"}'),
('cleaning_completed', (SELECT id FROM hotels LIMIT 1), '{"room_number": "102", "duration": 45}');

-- Sample notifications
INSERT INTO notifications (title, message, type, priority, hotel_id) VALUES
('Nova Reserva', 'Nova reserva recebida para o quarto 101', 'info', 'medium', (SELECT id FROM hotels LIMIT 1)),
('Manutenção Urgente', 'Problema de encanamento no quarto 205', 'error', 'urgent', (SELECT id FROM hotels LIMIT 1)),
('Check-in Pronto', 'Quarto 103 está pronto para check-in', 'success', 'medium', (SELECT id FROM hotels LIMIT 1)),
('Pagamento Recebido', 'Pagamento de R$ 350,00 confirmado', 'success', 'low', (SELECT id FROM hotels LIMIT 1));

-- Sample backup config
INSERT INTO backup_configs (hotel_id, backup_frequency, backup_time, auto_backup) VALUES
((SELECT id FROM hotels LIMIT 1), 'weekly', '02:00', true);

-- Sample backup records
INSERT INTO backup_records (hotel_id, backup_type, status, file_size, completed_at) VALUES
((SELECT id FROM hotels LIMIT 1), 'automatic', 'completed', 1024000, NOW() - INTERVAL '1 day'),
((SELECT id FROM hotels LIMIT 1), 'manual', 'completed', 1536000, NOW() - INTERVAL '3 days'),
((SELECT id FROM hotels LIMIT 1), 'automatic', 'completed', 998000, NOW() - INTERVAL '1 week');
