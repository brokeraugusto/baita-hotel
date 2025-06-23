-- Verificar tabelas e dados do módulo de limpeza
SELECT 
  (SELECT COUNT(*) FROM cleaning_personnel) AS personnel_count,
  (SELECT COUNT(*) FROM cleaning_tasks) AS tasks_count,
  (SELECT COUNT(*) FROM rooms) AS rooms_count;
