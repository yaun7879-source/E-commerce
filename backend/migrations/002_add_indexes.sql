-- Migration: Add Critical Database Indexes
-- Purpose: Improve query performance for frequently accessed columns
-- Status: For manual execution or integration with migration system

-- Users table indexes
ALTER TABLE users ADD UNIQUE INDEX idx_email (email);

ALTER TABLE users ADD INDEX idx_reset_token (reset_token);

ALTER TABLE users ADD INDEX idx_created_at (created_at);

-- Products table indexes
ALTER TABLE products ADD INDEX idx_category (category);

ALTER TABLE products ADD INDEX idx_price (price);

ALTER TABLE products ADD INDEX idx_tag (tag);

ALTER TABLE products ADD INDEX idx_created_at (created_at);

-- Cart table indexes
ALTER TABLE cart ADD INDEX idx_user_id (user_id);

ALTER TABLE cart ADD INDEX idx_product_id (product_id);

-- Orders table indexes
ALTER TABLE orders ADD INDEX idx_user_id (user_id);

ALTER TABLE orders ADD INDEX idx_payment_status (payment_status);

ALTER TABLE orders ADD INDEX idx_order_status (order_status);

ALTER TABLE orders ADD INDEX idx_address_id (address_id);

ALTER TABLE orders ADD INDEX idx_created_at (created_at);

-- Order items indexes
ALTER TABLE order_items ADD INDEX idx_order_id (order_id);

ALTER TABLE order_items ADD INDEX idx_product_id (product_id);

-- Reviews indexes
ALTER TABLE reviews ADD INDEX idx_product_id (product_id);

ALTER TABLE reviews ADD INDEX idx_created_at (created_at);

-- Addresses indexes
ALTER TABLE addresses ADD INDEX idx_user_id (user_id);

ALTER TABLE addresses ADD INDEX idx_created_at (created_at);

-- Note: These indexes improve:
-- - User login (email lookup)
-- - Product filtering (category, price ranges)
-- - Cart operations (user_id queries)
-- - Order tracking (user_id, status filters)
-- - Review management (product_id queries)