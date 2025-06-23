-- Create RLS policies for financial tables

-- Policy for financial_transactions
CREATE POLICY financial_transactions_policy ON financial_transactions
  USING (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = financial_transactions.hotel_id
  ))
  WITH CHECK (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = financial_transactions.hotel_id
  ));

-- Policy for financial_categories
CREATE POLICY financial_categories_policy ON financial_categories
  USING (temporarily_disable_rls() OR true)
  WITH CHECK (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE role IN ('admin', 'manager', 'finance')
  ));

-- Policy for bank_accounts
CREATE POLICY bank_accounts_policy ON bank_accounts
  USING (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = bank_accounts.hotel_id
  ))
  WITH CHECK (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = bank_accounts.hotel_id AND role IN ('admin', 'manager', 'finance')
  ));

-- Policy for suppliers
CREATE POLICY suppliers_policy ON suppliers
  USING (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = suppliers.hotel_id
  ))
  WITH CHECK (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = suppliers.hotel_id AND role IN ('admin', 'manager', 'finance')
  ));

-- Policy for accounts_payable
CREATE POLICY accounts_payable_policy ON accounts_payable
  USING (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = accounts_payable.hotel_id
  ))
  WITH CHECK (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = accounts_payable.hotel_id AND role IN ('admin', 'manager', 'finance')
  ));

-- Policy for accounts_receivable
CREATE POLICY accounts_receivable_policy ON accounts_receivable
  USING (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = accounts_receivable.hotel_id
  ))
  WITH CHECK (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = accounts_receivable.hotel_id AND role IN ('admin', 'manager', 'finance')
  ));

-- Policy for hotels
CREATE POLICY hotels_policy ON hotels
  USING (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = hotels.id
  ))
  WITH CHECK (temporarily_disable_rls() OR auth.uid() IN (
    SELECT user_id FROM hotel_staff WHERE hotel_id = hotels.id AND role = 'admin'
  ));
