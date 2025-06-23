-- Verificar tabelas existentes relacionadas à manutenção
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'maintenance%';
