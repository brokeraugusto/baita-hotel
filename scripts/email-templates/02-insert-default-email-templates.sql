-- Inserir templates padrão do sistema
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
-- Template de confirmação de reserva
(
  (SELECT id FROM hotels LIMIT 1),
  'Confirmação de Reserva',
  'Confirmação da sua reserva - {{hotel_name}}',
  'booking_confirmation',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
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
      <p>Olá {{guest_name}},</p>
      <p>Sua reserva foi confirmada com sucesso!</p>
      
      <div class="booking-details">
        <h3>Detalhes da Reserva</h3>
        <p><strong>Número da Reserva:</strong> {{booking_number}}</p>
        <p><strong>Check-in:</strong> {{checkin_date}}</p>
        <p><strong>Check-out:</strong> {{checkout_date}}</p>
        <p><strong>Acomodação:</strong> {{room_type}}</p>
        <p><strong>Hóspedes:</strong> {{guests_count}}</p>
        <p><strong>Valor Total:</strong> {{total_amount}}</p>
      </div>
      
      <p>Aguardamos você em {{hotel_name}}!</p>
      <p>Em caso de dúvidas, entre em contato conosco.</p>
    </div>
    <div class="footer">
      <p>{{hotel_name}} - {{hotel_address}}</p>
      <p>Telefone: {{hotel_phone}} | Email: {{hotel_email}}</p>
    </div>
  </div>
</body>
</html>',
  'Olá {{guest_name}},

Sua reserva foi confirmada com sucesso!

Detalhes da Reserva:
- Número da Reserva: {{booking_number}}
- Check-in: {{checkin_date}}
- Check-out: {{checkout_date}}
- Acomodação: {{room_type}}
- Hóspedes: {{guests_count}}
- Valor Total: {{total_amount}}

Aguardamos você em {{hotel_name}}!

{{hotel_name}}
{{hotel_address}}
Telefone: {{hotel_phone}}
Email: {{hotel_email}}',
  '[
    {"key": "hotel_name", "description": "Nome do hotel"},
    {"key": "guest_name", "description": "Nome do hóspede"},
    {"key": "booking_number", "description": "Número da reserva"},
    {"key": "checkin_date", "description": "Data de check-in"},
    {"key": "checkout_date", "description": "Data de check-out"},
    {"key": "room_type", "description": "Tipo de acomodação"},
    {"key": "guests_count", "description": "Número de hóspedes"},
    {"key": "total_amount", "description": "Valor total"},
    {"key": "hotel_address", "description": "Endereço do hotel"},
    {"key": "hotel_phone", "description": "Telefone do hotel"},
    {"key": "hotel_email", "description": "Email do hotel"}
  ]'::jsonb,
  true
),
-- Template de lembrete de check-in
(
  (SELECT id FROM hotels LIMIT 1),
  'Lembrete de Check-in',
  'Lembrete: Seu check-in é amanhã - {{hotel_name}}',
  'checkin_reminder',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lembrete de Check-in</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .reminder-box { background: #ecfdf5; border: 1px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 5px; }
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
      <p>Olá {{guest_name}},</p>
      <p>Este é um lembrete de que seu check-in está agendado para amanhã!</p>
      
      <div class="reminder-box">
        <h3>Informações Importantes</h3>
        <p><strong>Check-in:</strong> {{checkin_date}} às {{checkin_time}}</p>
        <p><strong>Reserva:</strong> {{booking_number}}</p>
        <p><strong>Acomodação:</strong> {{room_type}}</p>
      </div>
      
      <p>Não esqueça de trazer um documento de identidade válido.</p>
      <p>Estamos ansiosos para recebê-lo!</p>
    </div>
    <div class="footer">
      <p>{{hotel_name}} - {{hotel_address}}</p>
      <p>Telefone: {{hotel_phone}} | Email: {{hotel_email}}</p>
    </div>
  </div>
</body>
</html>',
  'Olá {{guest_name}},

Este é um lembrete de que seu check-in está agendado para amanhã!

Informações Importantes:
- Check-in: {{checkin_date}} às {{checkin_time}}
- Reserva: {{booking_number}}
- Acomodação: {{room_type}}

Não esqueça de trazer um documento de identidade válido.
Estamos ansiosos para recebê-lo!

{{hotel_name}}
{{hotel_address}}
Telefone: {{hotel_phone}}
Email: {{hotel_email}}',
  '[
    {"key": "hotel_name", "description": "Nome do hotel"},
    {"key": "guest_name", "description": "Nome do hóspede"},
    {"key": "booking_number", "description": "Número da reserva"},
    {"key": "checkin_date", "description": "Data de check-in"},
    {"key": "checkin_time", "description": "Horário de check-in"},
    {"key": "room_type", "description": "Tipo de acomodação"},
    {"key": "hotel_address", "description": "Endereço do hotel"},
    {"key": "hotel_phone", "description": "Telefone do hotel"},
    {"key": "hotel_email", "description": "Email do hotel"}
  ]'::jsonb,
  true
),
-- Template de cancelamento
(
  (SELECT id FROM hotels LIMIT 1),
  'Cancelamento de Reserva',
  'Cancelamento da reserva {{booking_number}} - {{hotel_name}}',
  'booking_cancellation',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cancelamento de Reserva</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .cancellation-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
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
      <p>Olá {{guest_name}},</p>
      <p>Sua reserva foi cancelada conforme solicitado.</p>
      
      <div class="cancellation-details">
        <h3>Detalhes do Cancelamento</h3>
        <p><strong>Número da Reserva:</strong> {{booking_number}}</p>
        <p><strong>Data do Cancelamento:</strong> {{cancellation_date}}</p>
        <p><strong>Motivo:</strong> {{cancellation_reason}}</p>
        <p><strong>Valor a ser Reembolsado:</strong> {{refund_amount}}</p>
      </div>
      
      <p>O reembolso será processado em até 5 dias úteis.</p>
      <p>Esperamos vê-lo em uma próxima oportunidade!</p>
    </div>
    <div class="footer">
      <p>{{hotel_name}} - {{hotel_address}}</p>
      <p>Telefone: {{hotel_phone}} | Email: {{hotel_email}}</p>
    </div>
  </div>
</body>
</html>',
  'Olá {{guest_name}},

Sua reserva foi cancelada conforme solicitado.

Detalhes do Cancelamento:
- Número da Reserva: {{booking_number}}
- Data do Cancelamento: {{cancellation_date}}
- Motivo: {{cancellation_reason}}
- Valor a ser Reembolsado: {{refund_amount}}

O reembolso será processado em até 5 dias úteis.
Esperamos vê-lo em uma próxima oportunidade!

{{hotel_name}}
{{hotel_address}}
Telefone: {{hotel_phone}}
Email: {{hotel_email}}',
  '[
    {"key": "hotel_name", "description": "Nome do hotel"},
    {"key": "guest_name", "description": "Nome do hóspede"},
    {"key": "booking_number", "description": "Número da reserva"},
    {"key": "cancellation_date", "description": "Data do cancelamento"},
    {"key": "cancellation_reason", "description": "Motivo do cancelamento"},
    {"key": "refund_amount", "description": "Valor do reembolso"},
    {"key": "hotel_address", "description": "Endereço do hotel"},
    {"key": "hotel_phone", "description": "Telefone do hotel"},
    {"key": "hotel_email", "description": "Email do hotel"}
  ]'::jsonb,
  true
);
