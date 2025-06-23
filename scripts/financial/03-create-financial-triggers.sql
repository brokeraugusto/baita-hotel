-- Criar triggers para atualizar saldos automaticamente

-- Função para atualizar saldo da conta bancária
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Se é uma nova transação
    IF TG_OP = 'INSERT' THEN
        IF NEW.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance + CASE 
                WHEN NEW.type = 'income' THEN NEW.amount 
                ELSE -NEW.amount 
            END,
            updated_at = NOW()
            WHERE id = NEW.bank_account_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Se é uma atualização
    IF TG_OP = 'UPDATE' THEN
        -- Reverter transação antiga se havia conta bancária
        IF OLD.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance - CASE 
                WHEN OLD.type = 'income' THEN OLD.amount 
                ELSE -OLD.amount 
            END,
            updated_at = NOW()
            WHERE id = OLD.bank_account_id;
        END IF;

        -- Aplicar nova transação se há conta bancária
        IF NEW.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance + CASE 
                WHEN NEW.type = 'income' THEN NEW.amount 
                ELSE -NEW.amount 
            END,
            updated_at = NOW()
            WHERE id = NEW.bank_account_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Se é uma exclusão
    IF TG_OP = 'DELETE' THEN
        IF OLD.bank_account_id IS NOT NULL THEN
            UPDATE bank_accounts 
            SET balance = balance - CASE 
                WHEN OLD.type = 'income' THEN OLD.amount 
                ELSE -OLD.amount 
            END,
            updated_at = NOW()
            WHERE id = OLD.bank_account_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para transações financeiras
DROP TRIGGER IF EXISTS trigger_update_bank_balance ON financial_transactions;
CREATE TRIGGER trigger_update_bank_balance
    AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_bank_account_balance();

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_financial_categories_updated_at BEFORE UPDATE ON financial_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON accounts_receivable FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
