-- Insert sample maintenance orders
DO $$
DECLARE
    cat_eletrica_id UUID;
    cat_hidraulica_id UUID;
    cat_ar_id UUID;
    cat_mobiliario_id UUID;
    cat_seguranca_id UUID;
    
    tech_joao_id UUID;
    tech_maria_id UUID;
    tech_pedro_id UUID;
    tech_ana_id UUID;
    tech_carlos_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_eletrica_id FROM maintenance_categories WHERE name = 'Elétrica' LIMIT 1;
    SELECT id INTO cat_hidraulica_id FROM maintenance_categories WHERE name = 'Hidráulica' LIMIT 1;
    SELECT id INTO cat_ar_id FROM maintenance_categories WHERE name = 'Ar-condicionado' LIMIT 1;
    SELECT id INTO cat_mobiliario_id FROM maintenance_categories WHERE name = 'Mobiliário' LIMIT 1;
    SELECT id INTO cat_seguranca_id FROM maintenance_categories WHERE name = 'Segurança' LIMIT 1;
    
    -- Get technician IDs
    SELECT id INTO tech_joao_id FROM maintenance_technicians WHERE name = 'João Silva' LIMIT 1;
    SELECT id INTO tech_maria_id FROM maintenance_technicians WHERE name = 'Maria Santos' LIMIT 1;
    SELECT id INTO tech_pedro_id FROM maintenance_technicians WHERE name = 'Pedro Costa' LIMIT 1;
    SELECT id INTO tech_ana_id FROM maintenance_technicians WHERE name = 'Ana Lima' LIMIT 1;
    SELECT id INTO tech_carlos_id FROM maintenance_technicians WHERE name = 'Carlos Oliveira' LIMIT 1;
    
    -- Insert maintenance orders only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM maintenance_orders WHERE title = 'Ar condicionado não gela') THEN
        INSERT INTO maintenance_orders (
            hotel_id, category_id, assigned_technician_id,
            title, description, priority, status,
            estimated_cost, scheduled_date, estimated_duration
        ) VALUES
        (
            'hotel-1', cat_ar_id, tech_ana_id,
            'Ar condicionado não gela',
            'O ar condicionado não está gelando adequadamente. Cliente reclamou que mesmo no máximo, o ambiente não resfria.',
            'high', 'pending',
            150.00, NOW() + INTERVAL '2 hours', 120
        ),
        (
            'hotel-1', cat_hidraulica_id, tech_pedro_id,
            'Vazamento na torneira do banheiro',
            'Torneira da pia do banheiro está com vazamento constante. Água pingando continuamente.',
            'medium', 'in-progress',
            80.00, NOW() + INTERVAL '1 hour', 90
        ),
        (
            'hotel-1', cat_eletrica_id, tech_maria_id,
            'Tomada não funciona',
            'Tomada próxima à cama não está funcionando. Hóspede não consegue carregar dispositivos.',
            'medium', 'pending',
            45.00, NOW() + INTERVAL '4 hours', 60
        ),
        (
            'hotel-1', cat_mobiliario_id, tech_carlos_id,
            'Porta do armário solta',
            'A porta do armário está solta e fazendo ruído. Dobradiça precisa ser ajustada.',
            'low', 'completed',
            35.00, NOW() - INTERVAL '2 days', 45
        ),
        (
            'hotel-1', cat_seguranca_id, tech_joao_id,
            'Fechadura da porta principal travando',
            'A fechadura eletrônica da entrada principal está travando ocasionalmente, dificultando o acesso.',
            'urgent', 'in-progress',
            200.00, NOW() + INTERVAL '30 minutes', 180
        ),
        (
            'hotel-1', cat_eletrica_id, tech_maria_id,
            'Lâmpada do banheiro queimada',
            'Lâmpada LED do banheiro queimou e precisa ser substituída.',
            'low', 'completed',
            25.00, NOW() - INTERVAL '1 day', 15
        ),
        (
            'hotel-1', cat_ar_id, tech_ana_id,
            'Limpeza do filtro do ar condicionado',
            'Manutenção preventiva - limpeza e troca do filtro do ar condicionado.',
            'low', 'pending',
            60.00, NOW() + INTERVAL '1 day', 30
        ),
        (
            'hotel-1', cat_hidraulica_id, tech_pedro_id,
            'Pressão baixa da água no 3º andar',
            'Hóspedes do 3º andar relataram baixa pressão da água nos chuveiros.',
            'high', 'pending',
            120.00, NOW() + INTERVAL '3 hours', 150
        );
        
        -- Update completed orders with completion data
        UPDATE maintenance_orders 
        SET 
            completed_at = NOW() - INTERVAL '1 day',
            actual_cost = 30.00,
            actual_duration = 40,
            completed_by = 'Carlos Oliveira',
            completion_notes = 'Dobradiça ajustada e parafusos apertados. Problema resolvido.',
            quality_rating = 5
        WHERE title = 'Porta do armário solta';
        
        UPDATE maintenance_orders 
        SET 
            completed_at = NOW() - INTERVAL '6 hours',
            actual_cost = 25.00,
            actual_duration = 15,
            completed_by = 'Maria Santos',
            completion_notes = 'Lâmpada LED substituída. Testado e funcionando normalmente.',
            quality_rating = 5
        WHERE title = 'Lâmpada do banheiro queimada';
    END IF;

    -- Show results
    RAISE NOTICE 'Sample maintenance orders inserted successfully!';
END $$;

-- Show summary
SELECT 
    'Sample data inserted' as status,
    (SELECT COUNT(*) FROM maintenance_orders) as total_orders,
    (SELECT COUNT(*) FROM maintenance_orders WHERE status = 'pending') as pending_orders,
    (SELECT COUNT(*) FROM maintenance_orders WHERE status = 'in-progress') as in_progress_orders,
    (SELECT COUNT(*) FROM maintenance_orders WHERE status = 'completed') as completed_orders;
