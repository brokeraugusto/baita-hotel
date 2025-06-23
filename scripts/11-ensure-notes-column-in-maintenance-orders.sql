-- Adiciona a coluna 'notes' à tabela 'maintenance_orders' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_orders' AND column_name = 'notes') THEN
        ALTER TABLE maintenance_orders ADD COLUMN notes TEXT;
        RAISE NOTICE 'Coluna "notes" adicionada à tabela "maintenance_orders".';
    ELSE
        RAISE NOTICE 'Coluna "notes" já existe na tabela "maintenance_orders". Nenhuma alteração necessária.';
    END IF;
END
$$;
