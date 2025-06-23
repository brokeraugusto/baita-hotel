-- Criar tabelas principais que estão faltando
DO $$
BEGIN
    -- Criar tabela hotels se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotels') THEN
        CREATE TABLE hotels (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            phone VARCHAR(50),
            email VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true
        );
        
        -- Inserir hotel de exemplo
        INSERT INTO hotels (id, name, address, phone, email) VALUES 
        ('hotel-1', 'Hotel Exemplo', 'Rua das Flores, 123', '(11) 1234-5678', 'contato@hotelexemplo.com');
        
        RAISE NOTICE 'Tabela hotels criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela hotels já existe';
    END IF;

    -- Verificar se tabela rooms existe e tem dados
    IF NOT EXISTS (SELECT FROM rooms WHERE hotel_id = 'hotel-1' LIMIT 1) THEN
        -- Inserir quartos de exemplo se não existirem
        INSERT INTO rooms (id, hotel_id, room_number, room_type, status, capacity, daily_rate) VALUES 
        (gen_random_uuid(), 'hotel-1', '101', 'Standard', 'available', 2, 150.00),
        (gen_random_uuid(), 'hotel-1', '102', 'Standard', 'available', 2, 150.00),
        (gen_random_uuid(), 'hotel-1', '201', 'Deluxe', 'available', 3, 250.00),
        (gen_random_uuid(), 'hotel-1', '301', 'Suíte', 'available', 4, 400.00),
        (gen_random_uuid(), 'hotel-1', '302', 'Suíte', 'available', 4, 400.00)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Quartos de exemplo inseridos';
    END IF;

    -- Verificar se categorias de manutenção existem
    IF NOT EXISTS (SELECT FROM maintenance_categories LIMIT 1) THEN
        INSERT INTO maintenance_categories (id, name, description, color, is_active) VALUES 
        (gen_random_uuid(), 'Elétrica', 'Problemas relacionados à instalação elétrica', '#FF5733', true),
        (gen_random_uuid(), 'Hidráulica', 'Problemas relacionados à instalação hidráulica', '#33A1FF', true),
        (gen_random_uuid(), 'Ar Condicionado', 'Manutenção de sistemas de climatização', '#33FF57', true),
        (gen_random_uuid(), 'Estrutural', 'Problemas estruturais e de construção', '#A133FF', true),
        (gen_random_uuid(), 'Limpeza', 'Serviços de limpeza e higienização', '#FFD700', true)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Categorias de manutenção inseridas';
    END IF;

    -- Verificar se técnicos existem
    IF NOT EXISTS (SELECT FROM maintenance_technicians LIMIT 1) THEN
        INSERT INTO maintenance_technicians (id, name, email, phone, specialties, hourly_rate, is_active) VALUES 
        (gen_random_uuid(), 'João Silva', 'joao@hotel.com', '(11) 9999-1111', ARRAY['Elétrica', 'Hidráulica'], 50.00, true),
        (gen_random_uuid(), 'Maria Oliveira', 'maria@hotel.com', '(11) 9999-2222', ARRAY['Ar Condicionado'], 60.00, true),
        (gen_random_uuid(), 'Carlos Santos', 'carlos@hotel.com', '(11) 9999-3333', ARRAY['Estrutural'], 55.00, true),
        (gen_random_uuid(), 'Ana Costa', 'ana@hotel.com', '(11) 9999-4444', ARRAY['Limpeza', 'Geral'], 45.00, true)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Técnicos de manutenção inseridos';
    END IF;

END $$;

-- Verificar se tudo foi criado corretamente
SELECT 'VERIFICAÇÃO FINAL:' as status;
SELECT COUNT(*) as total_hotels FROM hotels;
SELECT COUNT(*) as total_rooms FROM rooms WHERE hotel_id = 'hotel-1';
SELECT COUNT(*) as total_categories FROM maintenance_categories;
SELECT COUNT(*) as total_technicians FROM maintenance_technicians;
SELECT COUNT(*) as total_maintenance_orders FROM maintenance_orders;
