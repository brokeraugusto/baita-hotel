-- Criar tabelas para sistema de templates de e-mail

-- Tabela de templates de e-mail
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_key VARCHAR(100) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    UNIQUE(hotel_id, template_key),
    INDEX idx_email_templates_hotel_id ON email_templates(hotel_id),
    INDEX idx_email_templates_template_key ON email_templates(template_key),
    INDEX idx_email_templates_is_active ON email_templates(is_active)
);

-- Tabela de logs de e-mail
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_email_logs_hotel_id ON email_logs(hotel_id),
    INDEX idx_email_logs_template_id ON email_logs(template_id),
    INDEX idx_email_logs_status ON email_logs(status),
    INDEX idx_email_logs_recipient_email ON email_logs(recipient_email),
    INDEX idx_email_logs_created_at ON email_logs(created_at DESC)
);

-- Tabela de configurações de e-mail por hotel
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_username VARCHAR(255),
    smtp_password VARCHAR(255), -- Em produção, criptografar
    smtp_encryption VARCHAR(10) DEFAULT 'tls' CHECK (smtp_encryption IN ('none', 'ssl', 'tls')),
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    reply_to_email VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'smtp' CHECK (provider IN ('smtp', 'sendgrid', 'ses', 'mailgun', 'postmark')),
    provider_api_key VARCHAR(500),
    provider_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    daily_limit INTEGER DEFAULT 1000,
    monthly_limit INTEGER DEFAULT 30000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    UNIQUE(hotel_id),
    INDEX idx_email_settings_hotel_id ON email_settings(hotel_id)
);

-- Tabela de variáveis globais para templates
CREATE TABLE IF NOT EXISTS email_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    variable_key VARCHAR(100) NOT NULL,
    variable_name VARCHAR(255) NOT NULL,
    variable_description TEXT,
    default_value TEXT,
    variable_type VARCHAR(50) DEFAULT 'text' CHECK (variable_type IN ('text', 'number', 'date', 'boolean', 'url', 'email')),
    is_required BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    UNIQUE(hotel_id, variable_key),
    INDEX idx_email_variables_hotel_id ON email_variables(hotel_id),
    INDEX idx_email_variables_key ON email_variables(variable_key)
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_email_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
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
