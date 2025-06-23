-- Adiciona a coluna 'checklist' à tabela 'maintenance_templates' se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_templates' AND column_name = 'checklist') THEN
        ALTER TABLE maintenance_templates ADD COLUMN checklist TEXT[];
        RAISE NOTICE 'Coluna "checklist" adicionada à tabela "maintenance_templates".';
    ELSE
        RAISE NOTICE 'Coluna "checklist" já existe na tabela "maintenance_templates". Nenhuma alteração necessária.';
    END IF;
END
$$;
