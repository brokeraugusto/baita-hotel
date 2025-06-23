-- Inserir templates padrão do sistema

-- Primeiro, vamos inserir um hotel de exemplo se não existir
INSERT INTO hotels (id, name, email, phone, address, city, state, country, postal_code, created_at, updated_at)
VALUES (
    'hotel-uuid'::uuid,
    'Hotel Exemplo',
    'contato@hotelexemplo.com',
    '(11) 99999-9999',
    'Rua Exemplo, 123',
    'São Paulo',
    'SP',
    'Brasil',
    '01234-567',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir variáveis padrão do sistema
INSERT INTO email_variables (hotel_id, variable_key, variable_name, variable_description, default_value, variable_type, is_required, is_system) VALUES
('hotel-uuid'::uuid, 'hotel_name', 'Nome do Hotel', 'Nome do estabelecimento', 'Hotel Exemplo', 'text', true, true),
('hotel-uuid'::uuid, 'hotel_address', 'Endereço do Hotel', 'Endereço completo do hotel', 'Rua Exemplo, 123', 'text', false, true),
('hotel-uuid'::uuid, 'hotel_phone', 'Telefone do Hotel', 'Telefone de contato', '(11) 99999-9999', 'text', false, true),
('hotel-uuid'::uuid, 'hotel_email', 'E-mail do Hotel', 'E-mail de contato', 'contato@hotelexemplo.com', 'email', false, true),
('hotel-uuid'::uuid, 'hotel_website', 'Website do Hotel', 'Site oficial do hotel', 'https://hotelexemplo.com', 'url', false, true),
('hotel-uuid'::uuid, 'guest_name', 'Nome do Hóspede', 'Nome completo do hóspede', '', 'text', true, true),
('hotel-uuid'::uuid, 'guest_email', 'E-mail do Hóspede', 'E-mail do hóspede', '', 'email', true, true),
('hotel-uuid'::uuid, 'booking_number', 'Número da Reserva', 'Código de identificação da reserva', '', 'text', true, true),
('hotel-uuid'::uuid, 'checkin_date', 'Data de Check-in', 'Data de entrada', '', 'date', true, true),
('hotel-uuid'::uuid, 'checkout_date', 'Data de Check-out', 'Data de saída', '', 'date', true, true),
('hotel-uuid'::uuid, 'room_type', 'Tipo de Quarto', 'Categoria do quarto reservado', '', 'text', true, true),
('hotel-uuid'::uuid, 'room_number', 'Número do Quarto', 'Número do quarto atribuído', '', 'text', false, true),
('hotel-uuid'::uuid, 'guests_count', 'Número de Hóspedes', 'Quantidade de pessoas', '1', 'number', false, true),
('hotel-uuid'::uuid, 'total_amount', 'Valor Total', 'Valor total da reserva', 'R$ 0,00', 'text', false, true),
('hotel-uuid'::uuid, 'nights_count', 'Número de Noites', 'Quantidade de diárias', '1', 'number', false, true),
('hotel-uuid'::uuid, 'current_date', 'Data Atual', 'Data de hoje', '', 'date', false, true),
('hotel-uuid'::uuid, 'current_year', 'Ano Atual', 'Ano corrente', '2024', 'text', false, true);

-- Template: Confirmação de Reserva
INSERT INTO email_templates (hotel_id, name, subject, template_key, html_content, text_content, variables, is_active, is_system) VALUES
('hotel-uuid'::uuid, 'Confirmação de Reserva', 'Confirmação da sua reserva - {{hotel_name}}', 'booking_confirmation', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
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
                <p><strong>Tipo de Quarto:</strong> {{room_type}}</p>
                <p><strong>Número de Hóspedes:</strong> {{guests_count}}</p>
                <p><strong>Número de Noites:</strong> {{nights_count}}</p>
                <p><strong>Valor Total:</strong> {{total_amount}}</p>
            </div>
            
            <p>Estamos ansiosos para recebê-lo(a)!</p>
            
            <p>Se tiver alguma dúvida, entre em contato conosco:</p>
            <p>📧 {{hotel_email}}<br>
               📞 {{hotel_phone}}<br>
               📍 {{hotel_address}}</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{current_year}} {{hotel_name}}. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>',

'{{hotel_name}}
Confirmação de Reserva

Olá, {{guest_name}}!

Sua reserva foi confirmada com sucesso. Abaixo estão os detalhes:

DETALHES DA RESERVA
Número da Reserva: {{booking_number}}
Check-in: {{checkin_date}}
Check-out: {{checkout_date}}
Tipo de Quarto: {{room_type}}
Número de Hóspedes: {{guests_count}}
Número de Noites: {{nights_count}}
Valor Total: {{total_amount}}

Estamos ansiosos para recebê-lo(a)!

Se tiver alguma dúvida, entre em contato conosco:
E-mail: {{hotel_email}}
Telefone: {{hotel_phone}}
Endereço: {{hotel_address}}

© {{current_year}} {{hotel_name}}. Todos os direitos reservados.',

'[
    {"key": "hotel_name", "required": true},
    {"key": "guest_name", "required": true},
    {"key": "booking_number", "required": true},
    {"key": "checkin_date", "required": true},
    {"key": "checkout_date", "required": true},
    {"key": "room_type", "required": true},
    {"key": "guests_count", "required": false},
    {"key": "nights_count", "required": false},
    {"key": "total_amount", "required": false},
    {"key": "hotel_email", "required": false},
    {"key": "hotel_phone", "required": false},
    {"key": "hotel_address", "required": false},
    {"key": "current_year", "required": false}
]'::jsonb, true, true);

-- Template: Lembrete de Check-in
INSERT INTO email_templates (hotel_id, name, subject, template_key, html_content, text_content, variables, is_active, is_system) VALUES
('hotel-uuid'::uuid, 'Lembrete de Check-in', 'Seu check-in é amanhã - {{hotel_name}}', 'checkin_reminder',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lembrete de Check-in</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #16a34a; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
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
            <p>Este é um lembrete amigável de que seu check-in está programado para amanhã.</p>
            
            <div class="info-box">
                <h3>Informações da sua Reserva</h3>
                <p><strong>Reserva:</strong> {{booking_number}}</p>
                <p><strong>Check-in:</strong> {{checkin_date}} (a partir das 14h)</p>
                <p><strong>Check-out:</strong> {{checkout_date}} (até às 12h)</p>
                <p><strong>Quarto:</strong> {{room_type}}</p>
            </div>
            
            <h3>Informações Importantes:</h3>
            <ul>
                <li>Check-in: a partir das 14h00</li>
                <li>Traga um documento de identidade válido</li>
                <li>Estacionamento disponível (consulte taxas)</li>
                <li>Wi-Fi gratuito em todo o hotel</li>
            </ul>
            
            <p>Mal podemos esperar para recebê-lo(a)!</p>
            
            <p><strong>Contato:</strong><br>
               📧 {{hotel_email}}<br>
               📞 {{hotel_phone}}<br>
               📍 {{hotel_address}}</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{current_year}} {{hotel_name}}. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>',

'{{hotel_name}}
Lembrete de Check-in

Olá, {{guest_name}}!

Este é um lembrete amigável de que seu check-in está programado para amanhã.

INFORMAÇÕES DA SUA RESERVA
Reserva: {{booking_number}}
Check-in: {{checkin_date}} (a partir das 14h)
Check-out: {{checkout_date}} (até às 12h)
Quarto: {{room_type}}

INFORMAÇÕES IMPORTANTES:
- Check-in: a partir das 14h00
- Traga um documento de identidade válido
- Estacionamento disponível (consulte taxas)
- Wi-Fi gratuito em todo o hotel

Mal podemos esperar para recebê-lo(a)!

Contato:
E-mail: {{hotel_email}}
Telefone: {{hotel_phone}}
Endereço: {{hotel_address}}

© {{current_year}} {{hotel_name}}. Todos os direitos reservados.',

'[
    {"key": "hotel_name", "required": true},
    {"key": "guest_name", "required": true},
    {"key": "booking_number", "required": true},
    {"key": "checkin_date", "required": true},
    {"key": "checkout_date", "required": true},
    {"key": "room_type", "required": true},
    {"key": "hotel_email", "required": false},
    {"key": "hotel_phone", "required": false},
    {"key": "hotel_address", "required": false},
    {"key": "current_year", "required": false}
]'::jsonb, true, true);

-- Template: Agradecimento pós Check-out
INSERT INTO email_templates (hotel_id, name, subject, template_key, html_content, text_content, variables, is_active, is_system) VALUES
('hotel-uuid'::uuid, 'Agradecimento pós Check-out', 'Obrigado pela sua estadia - {{hotel_name}}', 'checkout_thanks',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agradecimento</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .highlight { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .stars { font-size: 24px; color: #fbbf24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{hotel_name}}</h1>
            <p>Obrigado pela sua estadia!</p>
        </div>
        
        <div class="content">
            <h2>Olá, {{guest_name}}!</h2>
            <p>Esperamos que tenha tido uma estadia maravilhosa conosco!</p>
            
            <div class="highlight">
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <h3>Avalie sua experiência</h3>
                <p>Sua opinião é muito importante para nós. Que tal compartilhar como foi sua estadia?</p>
            </div>
            
            <p>Alguns destaques da sua visita:</p>
            <ul>
                <li>Reserva: {{booking_number}}</li>
                <li>Período: {{checkin_date}} a {{checkout_date}}</li>
                <li>Quarto: {{room_type}}</li>
            </ul>
            
            <p>Esperamos vê-lo(a) novamente em breve! Para futuras reservas ou dúvidas:</p>
            
            <p><strong>Contato:</strong><br>
               📧 {{hotel_email}}<br>
               📞 {{hotel_phone}}<br>
               🌐 {{hotel_website}}</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{current_year}} {{hotel_name}}. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>',

'{{hotel_name}}
Obrigado pela sua estadia!

Olá, {{guest_name}}!

Esperamos que tenha tido uma estadia maravilhosa conosco!

⭐⭐⭐⭐⭐
AVALIE SUA EXPERIÊNCIA
Sua opinião é muito importante para nós. Que tal compartilhar como foi sua estadia?

Alguns destaques da sua visita:
- Reserva: {{booking_number}}
- Período: {{checkin_date}} a {{checkout_date}}
- Quarto: {{room_type}}

Esperamos vê-lo(a) novamente em breve! Para futuras reservas ou dúvidas:

Contato:
E-mail: {{hotel_email}}
Telefone: {{hotel_phone}}
Website: {{hotel_website}}

© {{current_year}} {{hotel_name}}. Todos os direitos reservados.',

'[
    {"key": "hotel_name", "required": true},
    {"key": "guest_name", "required": true},
    {"key": "booking_number", "required": true},
    {"key": "checkin_date", "required": true},
    {"key": "checkout_date", "required": true},
    {"key": "room_type", "required": true},
    {"key": "hotel_email", "required": false},
    {"key": "hotel_phone", "required": false},
    {"key": "hotel_website", "required": false},
    {"key": "current_year", "required": false}
]'::jsonb, true, true);

-- Inserir configurações padrão de e-mail
INSERT INTO email_settings (hotel_id, from_email, from_name, reply_to_email, provider, is_active) VALUES
('hotel-uuid'::uuid, 'noreply@hotelexemplo.com', 'Hotel Exemplo', 'contato@hotelexemplo.com', 'smtp', true);
