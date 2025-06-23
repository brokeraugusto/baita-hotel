-- Adiciona a coluna 'emergency_level' à tabela 'maintenance_orders' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_orders' AND column_name = 'emergency_level') THEN
        ALTER TABLE maintenance_orders ADD COLUMN emergency_level VARCHAR(20) DEFAULT 'medium' CHECK (emergency_level IN ('low', 'medium', 'high', 'critical'));
        RAISE NOTICE 'Coluna "emergency_level" adicionada à tabela "maintenance_orders".';
    ELSE
        RAISE NOTICE 'Coluna "emergency_level" já existe na tabela "maintenance_orders". Nenhuma alteração necessária.';
    END IF;
END
$$;
