-- Criar sistema completo de templates de e-mail

-- Primeiro, verificar se a tabela hotels existe, se não, criar uma básica
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hotels') THEN
        CREATE TABLE hotels (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Inserir hotel de exemplo
        INSERT INTO hotels (id, name) VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Hotel Exemplo');
    END IF;
END $$;

-- Tabela de templates de e-mail
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_key VARCHAR(100) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_hotel_id ON email_templates(hotel_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_template_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_templates_hotel_key ON email_templates(hotel_id, template_key);

-- Tabela de logs de e-mail
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL,
    template_id UUID,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_hotel_id ON email_logs(hotel_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Tabela de configurações de e-mail por hotel
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL,
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_username VARCHAR(255),
    smtp_password VARCHAR(255),
    smtp_encryption VARCHAR(10) DEFAULT 'tls',
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    reply_to_email VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'smtp',
    provider_api_key VARCHAR(500),
    provider_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    daily_limit INTEGER DEFAULT 1000,
    monthly_limit INTEGER DEFAULT 30000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para email_settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_settings_hotel_id ON email_settings(hotel_id);

-- Tabela de variáveis globais para templates
CREATE TABLE IF NOT EXISTS email_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL,
    variable_key VARCHAR(100) NOT NULL,
    variable_name VARCHAR(255) NOT NULL,
    variable_description TEXT,
    default_value TEXT,
    variable_type VARCHAR(50) DEFAULT 'text',
    is_required BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para email_variables
CREATE INDEX IF NOT EXISTS idx_email_variables_hotel_id ON email_variables(hotel_id);
CREATE INDEX IF NOT EXISTS idx_email_variables_key ON email_variables(variable_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_variables_hotel_key ON email_variables(hotel_id, variable_key);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_email_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at_column();

DROP TRIGGER IF EXISTS update_email_logs_updated_at ON email_logs;
CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at_column();

DROP TRIGGER IF EXISTS update_email_settings_updated_at ON email_settings;
CREATE TRIGGER update_email_settings_updated_at
    BEFORE UPDATE ON email_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at_column();

DROP TRIGGER IF EXISTS update_email_variables_updated_at ON email_variables;
CREATE TRIGGER update_email_variables_updated_at
    BEFORE UPDATE ON email_variables
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at_column();
