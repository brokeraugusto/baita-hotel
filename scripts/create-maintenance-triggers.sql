-- Criar trigger para agendamento automático de manutenção preventiva
CREATE OR REPLACE FUNCTION schedule_next_preventive_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    -- Se é uma ordem preventiva concluída, agendar a próxima
    IF NEW.status = 'completed' AND NEW.maintenance_type = 'preventive' AND NEW.recurrence_type IS NOT NULL AND NEW.recurrence_type != 'none' THEN
        UPDATE maintenance_orders 
        SET next_occurrence = CASE 
            WHEN NEW.recurrence_type = 'daily' THEN NEW.completed_at + INTERVAL '1 day'
            WHEN NEW.recurrence_type = 'weekly' THEN NEW.completed_at + INTERVAL '1 week'
            WHEN NEW.recurrence_type = 'monthly' THEN NEW.completed_at + INTERVAL '1 month'
            WHEN NEW.recurrence_type = 'quarterly' THEN NEW.completed_at + INTERVAL '3 months'
            WHEN NEW.recurrence_type = 'yearly' THEN NEW.completed_at + INTERVAL '1 year'
            ELSE NULL
        END
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verificar se o trigger já existe e removê-lo se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_schedule_preventive_maintenance') THEN
        DROP TRIGGER trigger_schedule_preventive_maintenance ON maintenance_orders;
    END IF;
END
$$;

-- Criar o trigger
CREATE TRIGGER trigger_schedule_preventive_maintenance
    AFTER UPDATE ON maintenance_orders
    FOR EACH ROW
    EXECUTE FUNCTION schedule_next_preventive_maintenance();
