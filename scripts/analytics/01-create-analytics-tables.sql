-- Create analytics and notification tables

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    hotel_id UUID REFERENCES hotels(id),
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    user_id UUID REFERENCES auth.users(id),
    hotel_id UUID REFERENCES hotels(id),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    notification_types JSONB DEFAULT '{
        "reservations": true,
        "maintenance": true,
        "cleaning": true,
        "financial": true,
        "system": true
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup configurations
CREATE TABLE IF NOT EXISTS backup_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id) UNIQUE,
    backup_frequency VARCHAR(20) CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
    backup_time TIME DEFAULT '02:00',
    include_files BOOLEAN DEFAULT TRUE,
    retention_days INTEGER DEFAULT 30,
    auto_backup BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup records
CREATE TABLE IF NOT EXISTS backup_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id),
    backup_type VARCHAR(20) CHECK (backup_type IN ('manual', 'automatic')) DEFAULT 'manual',
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
    file_size BIGINT DEFAULT 0,
    download_url TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Restore records
CREATE TABLE IF NOT EXISTS restore_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_id UUID REFERENCES backup_records(id),
    hotel_id UUID REFERENCES hotels(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_hotel_id ON analytics_events(hotel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_hotel_id ON notifications(hotel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_backup_records_hotel_id ON backup_records(hotel_id);
CREATE INDEX IF NOT EXISTS idx_backup_records_status ON backup_records(status);
