-- Inserir dados de exemplo na tabela profiles
INSERT INTO profiles (
    email, full_name, user_role, hotel_name, hotel_address, 
    subscription_status, subscription_plan, subscription_end_date
) VALUES 
(
    'admin@baitahotel.com',
    'Master Administrator',
    'master_admin',
    'Baita Hotel Platform',
    'São Paulo, SP',
    'active',
    'master',
    '2025-12-31 23:59:59'
),
(
    'hotel@exemplo.com',
    'João Silva',
    'client',
    'Hotel Exemplo',
    'Rua das Flores, 123 - São Paulo, SP',
    'active',
    'professional',
    '2024-12-31 23:59:59'
),
(
    'pousada@teste.com',
    'Maria Santos',
    'client',
    'Pousada Teste',
    'Av. Principal, 456 - Rio de Janeiro, RJ',
    'trial',
    'basic',
    '2024-07-31 23:59:59'
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    hotel_name = EXCLUDED.hotel_name,
    hotel_address = EXCLUDED.hotel_address,
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    subscription_end_date = EXCLUDED.subscription_end_date,
    updated_at = NOW();
