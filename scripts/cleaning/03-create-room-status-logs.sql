-- Criar tabela para logs de mudança de status dos quartos
CREATE TABLE IF NOT EXISTS room_status_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_room_status_logs_room_id ON room_status_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_room_status_logs_hotel_id ON room_status_logs(hotel_id);
CREATE INDEX IF NOT EXISTS idx_room_status_logs_created_at ON room_status_logs(created_at);

-- Habilitar RLS
ALTER TABLE room_status_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS para logs de status
CREATE POLICY "Users can view room status logs for their hotel" ON room_status_logs
FOR SELECT USING (
    hotel_id IN (
        SELECT hotel_id FROM profiles 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can insert room status logs for their hotel" ON room_status_logs
FOR INSERT WITH CHECK (
    hotel_id IN (
        SELECT hotel_id FROM profiles 
        WHERE id = auth.uid()
    )
);

-- Adicionar coluna status na tabela rooms se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'status') THEN
        ALTER TABLE rooms ADD COLUMN status TEXT DEFAULT 'clean';
    END IF;
END $$;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'status';
