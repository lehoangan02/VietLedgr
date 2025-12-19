-- ============================================================================
-- VietLedgr Database Schema (MATCH models.py)
-- PostgreSQL 12+
-- ============================================================================

-- ============================================================================
-- EXTENSIONS (để dùng gen_random_uuid())
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    store_id UUID NOT NULL,
    role_id UUID NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- ============================================================================
-- PRODUCT & INVENTORY TABLES
-- ============================================================================

CREATE TABLE tax_details (
    tax_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100)
);

CREATE TABLE product_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    tax_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tax_id) REFERENCES tax_details(tax_id) ON DELETE SET NULL
);

CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    category_id UUID,
    name VARCHAR(255) NOT NULL,
    retail_category VARCHAR(50) NOT NULL,
    image_base64 TEXT NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id) ON DELETE SET NULL
);

CREATE TABLE warehouses (
    warehouse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    warehouse_id UUID NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(15, 2) NOT NULL,
    sale_price DECIMAL(15, 2) NOT NULL,
    import_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expire_date TIMESTAMP WITH TIME ZONE,
    supplier_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,

    CONSTRAINT batches_stock_check CHECK (stock >= 0),
    CONSTRAINT batches_cost_check CHECK (cost >= 0),
    CONSTRAINT batches_sale_price_check CHECK (sale_price >= 0)
);

-- ============================================================================
-- TRANSACTION TABLES
-- ============================================================================

CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    user_id UUID NOT NULL,
    device_id VARCHAR(100),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,

    CONSTRAINT transactions_total_amount_check CHECK (total_amount >= 0),
    CONSTRAINT transactions_total_tax_check CHECK (total_tax >= 0)
);

CREATE TABLE transaction_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    batch_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_sale DECIMAL(15, 2) NOT NULL,
    cost_at_sale DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE RESTRICT,

    CONSTRAINT transaction_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT transaction_items_price_check CHECK (price_at_sale >= 0),
    CONSTRAINT transaction_items_cost_check CHECK (cost_at_sale >= 0)
);

-- ============================================================================
-- ACCOUNTING TABLES
-- ============================================================================

CREATE TABLE expenses (
    expense_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    user_id UUID NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,

    CONSTRAINT expenses_amount_check CHECK (amount >= 0)
);

CREATE TABLE general_ledger_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    account_type account_type NOT NULL,
    transaction_id UUID,
    expense_id UUID,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    debit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id) ON DELETE CASCADE,

    CONSTRAINT ledger_debit_check CHECK (debit_amount >= 0),
    CONSTRAINT ledger_credit_check CHECK (credit_amount >= 0),
    CONSTRAINT check_debit_or_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR
        (debit_amount = 0 AND credit_amount > 0)
    )
);

-- ============================================================================
-- INDEXES (MATCH models.py)
-- ============================================================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_role_id ON users(role_id);

CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);

CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_warehouse_id ON batches(warehouse_id);
CREATE INDEX idx_batches_expire_date ON batches(expire_date);
CREATE INDEX idx_batches_stock ON batches(stock) WHERE stock > 0;

CREATE INDEX idx_transactions_store_id ON transactions(store_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_batch_id ON transaction_items(batch_id);

CREATE INDEX idx_expenses_store_id ON expenses(store_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

CREATE INDEX idx_ledger_store_id ON general_ledger_entries(store_id);
CREATE INDEX idx_ledger_transaction_id ON general_ledger_entries(transaction_id);
CREATE INDEX idx_ledger_expense_id ON general_ledger_entries(expense_id);
CREATE INDEX idx_ledger_entry_date ON general_ledger_entries(entry_date);
CREATE INDEX idx_ledger_account_type ON general_ledger_entries(account_type);

-- ============================================================================
-- SEED DATA
-- ============================================================================
INSERT INTO roles (name, description) VALUES
    ('Admin', 'Full system access'),
    ('Manager', 'Store management access'),
    ('Cashier', 'Point of sale access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO stores (name, address, phone) VALUES
    ('Main Store', '123 Main St, Ho Chi Minh City', '0123456789')
ON CONFLICT DO NOTHING;

INSERT INTO tax_details (tax_name, tax_rate, tax_description) VALUES
    ('VAT Standard', 10.00, 'Standard VAT rate'),
    ('VAT Reduced', 5.00, 'Reduced VAT rate'),
    ('No Tax', 0.00, 'Tax exempt items')
ON CONFLICT DO NOTHING;
