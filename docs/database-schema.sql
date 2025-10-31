-- Create enum type for user types
CREATE TYPE user_type AS ENUM ('ADMIN', 'MANAGER', 'SALER');

-- Create users table with type column
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    type user_type NOT NULL DEFAULT 'SALER',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_type ON users(type);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user authentication and account information';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID v4)';
COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.password_hash IS 'Argon2 hashed password';
COMMENT ON COLUMN users.type IS 'User role: ADMIN, MANAGER, or SALER';
COMMENT ON COLUMN users.last_login IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
