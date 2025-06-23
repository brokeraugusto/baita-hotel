-- Fix subscriptions table schema and relationships

-- First, let's check if the subscriptions table exists and its structure
DO $$
BEGIN
    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN client_id UUID;
    END IF;
    
    -- Add hotel_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'hotel_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN hotel_id UUID;
    END IF;
END $$;

-- Update the subscriptions table to ensure all necessary columns exist
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey,
DROP CONSTRAINT IF EXISTS subscriptions_client_id_fkey,
DROP CONSTRAINT IF EXISTS subscriptions_hotel_id_fkey;

-- Add proper foreign key constraints
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotel_id ON subscriptions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Insert some sample data for testing
INSERT INTO subscriptions (
    id,
    plan_id,
    client_id,
    hotel_id,
    status,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM subscription_plans WHERE name = 'Profissional' LIMIT 1),
    gen_random_uuid(),
    gen_random_uuid(),
    'active',
    NOW(),
    NOW() + INTERVAL '1 month',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM subscription_plans WHERE name = 'Básico' LIMIT 1),
    gen_random_uuid(),
    gen_random_uuid(),
    'active',
    NOW(),
    NOW() + INTERVAL '1 month',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;
