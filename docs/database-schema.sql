-- ============================================================================
-- VietLedgr Database Schema
-- ============================================================================
-- This file contains the SQL schema for the VietLedgr application database
-- Database: PostgreSQL 12+
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User types enum
CREATE TYPE user_type AS ENUM ('ADMIN', 'MANAGER', 'CASHIER');

-- Account types for general ledger
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users table (updated with foreign keys)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    store_id UUID NOT NULL,
    role_id UUID NOT NULL,
    type user_type NOT NULL DEFAULT 'CASHIER',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- ============================================================================
-- PRODUCT & INVENTORY TABLES
-- ============================================================================

-- Tax details table
CREATE TABLE tax_details (
    tax_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 100),
    tax_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Product categories table
CREATE TABLE product_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tax_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tax_id) REFERENCES tax_details(tax_id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    category_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id) ON DELETE SET NULL
);

-- Warehouses table
CREATE TABLE warehouses (
    warehouse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Batches table (inventory lots)
CREATE TABLE batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    warehouse_id UUID NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    cost DECIMAL(15, 2) NOT NULL CHECK (cost >= 0),
    sale_price DECIMAL(15, 2) NOT NULL CHECK (sale_price >= 0),
    import_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expire_date TIMESTAMP WITH TIME ZONE,
    supplier_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE
);

-- ============================================================================
-- TRANSACTION TABLES
-- ============================================================================

-- Transactions table (sales)
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    user_id UUID NOT NULL,
    device_id VARCHAR(100),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    total_tax DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (total_tax >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Transaction items table (line items)
CREATE TABLE transaction_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    batch_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_sale DECIMAL(15, 2) NOT NULL CHECK (price_at_sale >= 0),
    cost_at_sale DECIMAL(15, 2) NOT NULL CHECK (cost_at_sale >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE RESTRICT
);

-- ============================================================================
-- ACCOUNTING TABLES
-- ============================================================================

-- Expenses table
CREATE TABLE expenses (
    expense_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    user_id UUID NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- General ledger entries table
CREATE TABLE general_ledger_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    account_type account_type NOT NULL,
    transaction_id UUID,
    expense_id UUID,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    debit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (debit_amount >= 0),
    credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (credit_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE CASCADE,
    CONSTRAINT check_debit_or_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (debit_amount = 0 AND credit_amount > 0)
    )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Products indexes
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);

-- Batches indexes
CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_warehouse_id ON batches(warehouse_id);
CREATE INDEX idx_batches_expire_date ON batches(expire_date);
CREATE INDEX idx_batches_stock ON batches(stock) WHERE stock > 0;

-- Transactions indexes
CREATE INDEX idx_transactions_store_id ON transactions(store_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Transaction items indexes
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_batch_id ON transaction_items(batch_id);

-- Expenses indexes
CREATE INDEX idx_expenses_store_id ON expenses(store_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- Ledger indexes
CREATE INDEX idx_ledger_store_id ON general_ledger_entries(store_id);
CREATE INDEX idx_ledger_transaction_id ON general_ledger_entries(transaction_id);
CREATE INDEX idx_ledger_expense_id ON general_ledger_entries(expense_id);
CREATE INDEX idx_ledger_entry_date ON general_ledger_entries(entry_date);
CREATE INDEX idx_ledger_account_type ON general_ledger_entries(account_type);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Stores
COMMENT ON TABLE stores IS 'Stores/branches in the system';
COMMENT ON COLUMN stores.id IS 'Unique store identifier';
COMMENT ON COLUMN stores.name IS 'Store name';

-- Roles
COMMENT ON TABLE roles IS 'User roles and permissions';
COMMENT ON COLUMN roles.role_id IS 'Unique role identifier';
COMMENT ON COLUMN roles.name IS 'Role name (e.g., Admin, Manager, Cashier)';

-- Users
COMMENT ON TABLE users IS 'Stores user authentication and account information';
COMMENT ON COLUMN users.user_id IS 'Unique user identifier (UUID v4)';
COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.password_hash IS 'Argon2 hashed password';
COMMENT ON COLUMN users.store_id IS 'Store that user belongs to';
COMMENT ON COLUMN users.role_id IS 'User role for permissions';
COMMENT ON COLUMN users.type IS 'User role: ADMIN, MANAGER, or CASHIER';

-- Tax Details
COMMENT ON TABLE tax_details IS 'Tax rates and details';
COMMENT ON COLUMN tax_details.tax_rate IS 'Tax percentage (0-100)';

-- Product Categories
COMMENT ON TABLE product_categories IS 'Product classification categories';
COMMENT ON COLUMN product_categories.tax_id IS 'Default tax for this category';

-- Products
COMMENT ON TABLE products IS 'Product master data';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product code';

-- Warehouses
COMMENT ON TABLE warehouses IS 'Storage locations for inventory';

-- Batches
COMMENT ON TABLE batches IS 'Inventory lots/batches with cost and pricing';
COMMENT ON COLUMN batches.stock IS 'Current stock quantity';
COMMENT ON COLUMN batches.cost IS 'Cost price per unit';
COMMENT ON COLUMN batches.sale_price IS 'Selling price per unit';
COMMENT ON COLUMN batches.expire_date IS 'Expiration date (for perishables)';

-- Transactions
COMMENT ON TABLE transactions IS 'Sales transactions (receipts)';
COMMENT ON COLUMN transactions.device_id IS 'POS device identifier';

-- Transaction Items
COMMENT ON TABLE transaction_items IS 'Line items for each transaction';
COMMENT ON COLUMN transaction_items.price_at_sale IS 'Price at time of sale (historical)';
COMMENT ON COLUMN transaction_items.cost_at_sale IS 'Cost at time of sale (for profit calculation)';

-- Expenses
COMMENT ON TABLE expenses IS 'Business expenses (non-inventory costs)';

-- General Ledger
COMMENT ON TABLE general_ledger_entries IS 'Double-entry bookkeeping ledger';
COMMENT ON COLUMN general_ledger_entries.account_type IS 'Account classification: Asset, Liability, Equity, Revenue, Expense';
COMMENT ON COLUMN general_ledger_entries.debit_amount IS 'Debit amount (increases assets/expenses)';
COMMENT ON COLUMN general_ledger_entries.credit_amount IS 'Credit amount (increases liabilities/revenue)';

-- ============================================================================
-- SAMPLE DATA (For Testing)
-- ============================================================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('Admin', 'Full system access'),
    ('Manager', 'Store management access'),
    ('Cashier', 'Point of sale access');

-- Insert sample store
INSERT INTO stores (name, address, phone) VALUES
    ('Main Store', '123 Main St, Ho Chi Minh City', '0123456789');

-- Insert sample tax rates
INSERT INTO tax_details (tax_name, tax_rate, tax_description) VALUES
    ('VAT Standard', 10.00, 'Standard VAT rate'),
    ('VAT Reduced', 5.00, 'Reduced VAT rate'),
    ('No Tax', 0.00, 'Tax exempt items');
-- ============================================================================
-- SETUP INSTRUCTIONS
-- ============================================================================
-- 1. Create database:
--    CREATE DATABASE vietledgr;
--
-- 2. Connect to database:
--    \c vietledgr
--
-- 3. Run this schema file:
--    \i docs/database-schema.sql
--
-- 4. Verify tables created:
--    \dt
--
-- 5. Check relationships:
--    \d users
--    \d products
-- ============================================================================