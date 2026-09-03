-- ============================================
-- EXPENSE VOUCHER MANAGEMENT SYSTEM
-- Database Schema for Supabase (PostgreSQL)
-- ============================================

-- 1. Users Table
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(100)  NOT NULL UNIQUE,
    password        VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL
                    CHECK (role IN ('employee', 'director', 'accounts')),
    department      VARCHAR(100),
    employee_id     VARCHAR(50),
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- 2. Vouchers Table
CREATE TABLE vouchers (
    id                   SERIAL PRIMARY KEY,
    voucher_number       VARCHAR(20)    NOT NULL UNIQUE,
    created_by           INT            NOT NULL REFERENCES users(id),

    -- Basic Info
    voucher_date         DATE           NOT NULL,
    expense_date         DATE           NOT NULL,
    department           VARCHAR(100)   NOT NULL,
    expense_title        VARCHAR(200)   NOT NULL,
    expense_category     VARCHAR(100)   NOT NULL,
    expense_description  TEXT,
    amount               DECIMAL(10,2)  NOT NULL CHECK (amount > 0),

    -- Status & Approval
    status               VARCHAR(20)    NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','submitted','pending_approval','approved','rejected')),
    employee_signature   TEXT,
    director_signature   TEXT,
    approved_by          INT            REFERENCES users(id),
    approval_date        TIMESTAMPTZ,
    rejection_reason     TEXT,

    -- Audit
    created_at           TIMESTAMPTZ    DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    DEFAULT NOW()
);

-- 3. Indexes for faster lookups
CREATE INDEX idx_vouchers_created_by ON vouchers(created_by);
CREATE INDEX idx_vouchers_status     ON vouchers(status);

-- 4. Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vouchers_updated_at
    BEFORE UPDATE ON vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 5. Seed Users (password for all = "password123")
-- bcrypt hash generated with 10 salt rounds
INSERT INTO users (name, email, password, role, department, employee_id) VALUES
    ('Shravan Patel',  'shravan@company.com', '$2a$10$xPPLfD8kQHGmqOIaFhjKruGtMQDEeJVSDaGWMPcirv08GQHBF5bSS', 'employee',  'Engineering', 'EMP001'),
    ('Rajesh Sharma',  'rajesh@company.com',  '$2a$10$xPPLfD8kQHGmqOIaFhjKruGtMQDEeJVSDaGWMPcirv08GQHBF5bSS', 'director',  'Management',  NULL),
    ('Priya Verma',    'priya@company.com',   '$2a$10$xPPLfD8kQHGmqOIaFhjKruGtMQDEeJVSDaGWMPcirv08GQHBF5bSS', 'accounts',  'Finance',     NULL);
