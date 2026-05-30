-- Migration: Add Account Lockout Mechanism
-- Purpose: Enable brute force attack prevention through account lockout
-- Status: For manual execution or integration with migration system

-- Add lockout columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL;

-- Document the lockout mechanism
-- Usage:
-- 1. On failed login: UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?;
-- 2. After 5 failed attempts: UPDATE users SET locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?;
-- 3. On successful login: UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?;
-- 4. Check before login: SELECT locked_until FROM users WHERE id = ? AND locked_until > NOW();