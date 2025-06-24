-- Script para criar funções após as tabelas estarem prontas
-- Execute DEPOIS do script 01-create-tables-first.sql

-- Função para verificar se existe Master Admin
CREATE OR REPLACE FUNCTION has_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM master_admins 
        WHERE is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar Master Admin
CREATE OR REPLACE FUNCTION create_first_master_admin(
    p_email VARCHAR(255),
    p_full_name VARCHAR(255),
    p_password VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    new_admin master_admins%ROWTYPE;
BEGIN
    -- Verificar se já existe Master Admin
    IF has_master_admin() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Já existe um Master Admin cadastrado'
        );
    END IF;

    -- Inserir novo Master Admin
    INSERT INTO master_admins (email, full_name, password_hash)
    VALUES (LOWER(TRIM(p_email)), p_full_name, p_password)
    RETURNING * INTO new_admin;

    RETURN json_build_object(
        'success', true,
        'message', 'Master Admin criado com sucesso',
        'admin', json_build_object(
            'id', new_admin.id,
            'email', new_admin.email,
            'full_name', new_admin.full_name,
            'created_at', new_admin.created_at
        )
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Email já está em uso'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões nas funções
GRANT EXECUTE ON FUNCTION has_master_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_first_master_admin(VARCHAR, VARCHAR, VARCHAR) TO anon, authenticated, service_role;

-- Testar as funções
SELECT has_master_admin() as has_admin;
SELECT create_first_master_admin('test@example.com', 'Test User', 'password123') as test_result;
