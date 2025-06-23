-- Inserir dados padrão para o sistema de e-mail

-- Inserir hotel de exemplo se não existir
INSERT INTO hotels (id, name) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Hotel Exemplo')
ON CONFLICT (id) DO NOTHING;

-- Inserir templates padrão
INSERT INTO email_templates (
    hotel_id, 
    name, 
    subject, 
    template_key, 
    html_content, 
    text_content, 
    variables, 
    is_system
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Confirmação de Reserva',
    'Confirmação da sua reserva - {{hotel_name}}',
    'booking_confirmation',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirmação de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{hotel_name}}</h1>
            <p>Confirmação de Reserva</p>
        </div>
        <div class="content">
            <h2>Olá, {{guest_name}}!</h2>
            <p>Sua reserva foi confirmada com sucesso. Abaixo estão os detalhes:</p>
            
            <div class="booking-details">
                <h3>Detalhes da Reserva</h3>
                <p><strong>Número da Reserva:</strong> {{booking_number}}</p>
                <p><strong>Check-in:</strong> {{checkin_date}}</p>
                <p><strong>Check-out:</strong> {{checkout_date}}</p>
                <p><strong>Acomodação:</strong> {{room_type}}</p>
                <p><strong>Hóspedes:</strong> {{guests_count}}</p>
                <p><strong>Valor Total:</strong> {{total_amount}}</p>
            </div>
            
            <p>Aguardamos você em nosso hotel!</p>
            <p>Em caso de dúvidas, entre em contato conosco.</p>
        </div>
        <div class="footer">
            <p>{{hotel_name}}</p>
            <p>{{hotel_address}}</p>
            <p>Telefone: {{hotel_phone}} | E-mail: {{hotel_email}}</p>
        </div>
    </div>
</body>
</html>',
    'Olá {{guest_name}},

Sua reserva foi confirmada com sucesso!

Detalhes da Reserva:
- Número: {{booking_number}}
- Check-in: {{checkin_date}}
- Check-out: {{checkout_date}}
- Acomodação: {{room_type}}
- Hóspedes: {{guests_count}}
- Valor Total: {{total_amount}}

Aguardamos você em nosso hotel!

{{hotel_name}}
{{hotel_address}}
Telefone: {{hotel_phone}}
E-mail: {{hotel_email}}',
    '[
        {"key": "hotel_name", "name": "Nome do Hotel", "required": true},
        {"key": "guest_name", "name": "Nome do Hóspede", "required": true},
        {"key": "booking_number", "name": "Número da Reserva", "required": true},
        {"key": "checkin_date", "name": "Data Check-in", "required": true},
        {"key": "checkout_date", "name": "Data Check-out", "required": true},
        {"key": "room_type", "name": "Tipo de Quarto", "required": true},
        {"key": "guests_count", "name": "Número de Hóspedes", "required": true},
        {"key": "total_amount", "name": "Valor Total", "required": true},
        {"key": "hotel_address", "name": "Endereço do Hotel", "required": false},
        {"key": "hotel_phone", "name": "Telefone do Hotel", "required": false},
        {"key": "hotel_email", "name": "E-mail do Hotel", "required": false}
    ]'::jsonb,
    true
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Lembrete de Check-in',
    'Lembrete: Seu check-in é amanhã - {{hotel_name}}',
    'checkin_reminder',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lembrete de Check-in</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .reminder-box { background: #dcfce7; border: 1px solid #16a34a; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{hotel_name}}</h1>
            <p>Lembrete de Check-in</p>
        </div>
        <div class="content">
            <h2>Olá, {{guest_name}}!</h2>
            <p>Este é um lembrete de que seu check-in é amanhã.</p>
            
            <div class="reminder-box">
                <h3>Informações da Reserva</h3>
                <p><strong>Reserva:</strong> {{booking_number}}</p>
                <p><strong>Check-in:</strong> {{checkin_date}} às 14:00</p>
                <p><strong>Acomodação:</strong> {{room_type}}</p>
            </div>
            
            <p>Estamos ansiosos para recebê-lo!</p>
            <p>Horário de check-in: 14:00 às 22:00</p>
        </div>
        <div class="footer">
            <p>{{hotel_name}}</p>
            <p>{{hotel_address}}</p>
            <p>Telefone: {{hotel_phone}} | E-mail: {{hotel_email}}</p>
        </div>
    </div>
</body>
</html>',
    'Olá {{guest_name}},

Este é um lembrete de que seu check-in é amanhã.

Informações da Reserva:
- Reserva: {{booking_number}}
- Check-in: {{checkin_date}} às 14:00
- Acomodação: {{room_type}}

Estamos ansiosos para recebê-lo!
Horário de check-in: 14:00 às 22:00

{{hotel_name}}
{{hotel_address}}
Telefone: {{hotel_phone}}
E-mail: {{hotel_email}}',
    '[
        {"key": "hotel_name", "name": "Nome do Hotel", "required": true},
        {"key": "guest_name", "name": "Nome do Hóspede", "required": true},
        {"key": "booking_number", "name": "Número da Reserva", "required": true},
        {"key": "checkin_date", "name": "Data Check-in", "required": true},
        {"key": "room_type", "name": "Tipo de Quarto", "required": true},
        {"key": "hotel_address", "name": "Endereço do Hotel", "required": false},
        {"key": "hotel_phone", "name": "Telefone do Hotel", "required": false},
        {"key": "hotel_email", "name": "E-mail do Hotel", "required": false}
    ]'::jsonb,
    true
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Cancelamento de Reserva',
    'Cancelamento da reserva {{booking_number}} - {{hotel_name}}',
    'booking_cancellation',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cancelamento de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .cancellation-box { background: #fef2f2; border: 1px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{hotel_name}}</h1>
            <p>Cancelamento de Reserva</p>
        </div>
        <div class="content">
            <h2>Olá, {{guest_name}}</h2>
            <p>Confirmamos o cancelamento da sua reserva.</p>
            
            <div class="cancellation-box">
                <h3>Reserva Cancelada</h3>
                <p><strong>Número:</strong> {{booking_number}}</p>
                <p><strong>Check-in:</strong> {{checkin_date}}</p>
                <p><strong>Check-out:</strong> {{checkout_date}}</p>
                <p><strong>Acomodação:</strong> {{room_type}}</p>
            </div>
            
            <p>Esperamos vê-lo em uma próxima oportunidade!</p>
        </div>
        <div class="footer">
            <p>{{hotel_name}}</p>
            <p>{{hotel_address}}</p>
            <p>Telefone: {{hotel_phone}} | E-mail: {{hotel_email}}</p>
        </div>
    </div>
</body>
</html>',
    'Olá {{guest_name}},

Confirmamos o cancelamento da sua reserva.

Reserva Cancelada:
- Número: {{booking_number}}
- Check-in: {{checkin_date}}
- Check-out: {{checkout_date}}
- Acomodação: {{room_type}}

Esperamos vê-lo em uma próxima oportunidade!

{{hotel_name}}
{{hotel_address}}
Telefone: {{hotel_phone}}
E-mail: {{hotel_email}}',
    '[
        {"key": "hotel_name", "name": "Nome do Hotel", "required": true},
        {"key": "guest_name", "name": "Nome do Hóspede", "required": true},
        {"key": "booking_number", "name": "Número da Reserva", "required": true},
        {"key": "checkin_date", "name": "Data Check-in", "required": true},
        {"key": "checkout_date", "name": "Data Check-out", "required": true},
        {"key": "room_type", "name": "Tipo de Quarto", "required": true},
        {"key": "hotel_address", "name": "Endereço do Hotel", "required": false},
        {"key": "hotel_phone", "name": "Telefone do Hotel", "required": false},
        {"key": "hotel_email", "name": "E-mail do Hotel", "required": false}
    ]'::jsonb,
    true
);

-- Inserir configurações padrão de e-mail
INSERT INTO email_settings (
    hotel_id,
    from_email,
    from_name,
    reply_to_email
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'noreply@hotelexemplo.com',
    'Hotel Exemplo',
    'contato@hotelexemplo.com'
) ON CONFLICT (hotel_id) DO NOTHING;

-- Inserir algumas variáveis padrão
INSERT INTO email_variables (hotel_id, variable_key, variable_name, variable_description, is_system) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'hotel_name', 'Nome do Hotel', 'Nome do estabelecimento', true),
('550e8400-e29b-41d4-a716-446655440000', 'guest_name', 'Nome do Hóspede', 'Nome completo do hóspede', true),
('550e8400-e29b-41d4-a716-446655440000', 'booking_number', 'Número da Reserva', 'Código único da reserva', true),
('550e8400-e29b-41d4-a716-446655440000', 'checkin_date', 'Data de Check-in', 'Data de entrada', true),
('550e8400-e29b-41d4-a716-446655440000', 'checkout_date', 'Data de Check-out', 'Data de saída', true),
('550e8400-e29b-41d4-a716-446655440000', 'room_type', 'Tipo de Quarto', 'Categoria da acomodação', true),
('550e8400-e29b-41d4-a716-446655440000', 'guests_count', 'Número de Hóspedes', 'Quantidade de pessoas', true),
('550e8400-e29b-41d4-a716-446655440000', 'total_amount', 'Valor Total', 'Valor total da reserva', true),
('550e8400-e29b-41d4-a716-446655440000', 'hotel_address', 'Endereço do Hotel', 'Endereço completo', true),
('550e8400-e29b-41d4-a716-446655440000', 'hotel_phone', 'Telefone do Hotel', 'Número de contato', true),
('550e8400-e29b-41d4-a716-446655440000', 'hotel_email', 'E-mail do Hotel', 'E-mail de contato', true)
ON CONFLICT (hotel_id, variable_key) DO NOTHING;

-- Inserir alguns logs de exemplo
INSERT INTO email_logs (
    hotel_id,
    template_id,
    recipient_email,
    recipient_name,
    subject,
    status,
    sent_at,
    created_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    (SELECT id FROM email_templates WHERE template_key = 'booking_confirmation' LIMIT 1),
    'joao@email.com',
    'João Silva',
    'Confirmação da sua reserva - Hotel Exemplo',
    'sent',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    (SELECT id FROM email_templates WHERE template_key = 'checkin_reminder' LIMIT 1),
    'maria@email.com',
    'Maria Santos',
    'Lembrete: Seu check-in é amanhã - Hotel Exemplo',
    'sent',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    (SELECT id FROM email_templates WHERE template_key = 'booking_cancellation' LIMIT 1),
    'pedro@email.com',
    'Pedro Costa',
    'Cancelamento da reserva RES-12345 - Hotel Exemplo',
    'failed',
    NULL,
    NOW() - INTERVAL '3 days'
);
