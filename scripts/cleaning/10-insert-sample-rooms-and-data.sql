-- Inserir quartos de exemplo
INSERT INTO rooms (id, hotel_id, number, type, floor, status, capacity, created_at, updated_at) VALUES
('room-101', 'hotel-1', '101', 'Standard', 1, 'clean', 2, NOW(), NOW()),
('room-102', 'hotel-1', '102', 'Standard', 1, 'dirty', 2, NOW(), NOW()),
('room-103', 'hotel-1', '103', 'Standard', 1, 'in-progress', 2, NOW(), NOW()),
('room-201', 'hotel-1', '201', 'Deluxe', 2, 'maintenance', 4, NOW(), NOW()),
('room-202', 'hotel-1', '202', 'Deluxe', 2, 'clean', 4, NOW(), NOW()),
('room-203', 'hotel-1', '203', 'Deluxe', 2, 'dirty', 4, NOW(), NOW()),
('room-301', 'hotel-1', '301', 'Suite', 3, 'inspection', 6, NOW(), NOW()),
('room-302', 'hotel-1', '302', 'Suite', 3, 'clean', 6, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- Inserir pessoal de limpeza de exemplo
INSERT INTO cleaning_personnel (id, hotel_id, name, email, phone, is_active, specialties, hourly_rate, created_at, updated_at) VALUES
('staff-1', 'hotel-1', 'Maria Silva', 'maria@hotel.com', '(11) 98765-4321', true, ARRAY['Quartos Standard', 'Limpeza Geral'], 25.00, NOW(), NOW()),
('staff-2', 'hotel-1', 'João Santos', 'joao@hotel.com', '(11) 91234-5678', true, ARRAY['Quartos Deluxe', 'Áreas Comuns'], 30.00, NOW(), NOW()),
('staff-3', 'hotel-1', 'Ana Oliveira', 'ana@hotel.com', '(11) 99876-5432', true, ARRAY['Suítes', 'Limpeza Profunda'], 35.00, NOW(), NOW()),
('staff-4', 'hotel-1', 'Carlos Pereira', 'carlos@hotel.com', '(11) 98765-1234', false, ARRAY['Manutenção', 'Inspeção'], 28.00, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  specialties = EXCLUDED.specialties,
  hourly_rate = EXCLUDED.hourly_rate,
  updated_at = NOW();

-- Inserir tarefas de limpeza de exemplo
INSERT INTO cleaning_tasks (id, hotel_id, room_id, title, description, task_type, status, priority, assigned_personnel_id, scheduled_for, estimated_duration, notes, created_at, updated_at) VALUES
('task-1', 'hotel-1', 'room-102', 'Limpeza Pós Check-out', 'Limpeza completa após saída do hóspede', 'checkout', 'pending', 'high', 'staff-1', NOW() + INTERVAL '1 hour', 60, 'Verificar itens esquecidos', NOW(), NOW()),
('task-2', 'hotel-1', 'room-103', 'Limpeza em Andamento', 'Limpeza regular do quarto', 'regular', 'in-progress', 'medium', 'staff-2', NOW(), 45, NULL, NOW(), NOW()),
('task-3', 'hotel-1', 'room-201', 'Manutenção Preventiva', 'Verificação e limpeza de ar-condicionado', 'maintenance', 'pending', 'urgent', 'staff-3', NOW() + INTERVAL '2 hours', 90, 'Problema reportado pelo hóspede', NOW(), NOW()),
('task-4', 'hotel-1', 'room-301', 'Inspeção de Qualidade', 'Inspeção final após limpeza profunda', 'inspection', 'completed', 'low', 'staff-1', NOW() - INTERVAL '1 hour', 30, 'Aprovado', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  task_type = EXCLUDED.task_type,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  assigned_personnel_id = EXCLUDED.assigned_personnel_id,
  scheduled_for = EXCLUDED.scheduled_for,
  estimated_duration = EXCLUDED.estimated_duration,
  notes = EXCLUDED.notes,
  updated_at = NOW();
