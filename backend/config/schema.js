const { getPool } = require('./db');

// Create Products Table
const createProductsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      image_url VARCHAR(255),
      rating FLOAT,
      tag VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
    try {
        const pool = await getPool();
        await pool.query(query);
        console.log('✅ Products table created/exists');
    } catch (error) {
        console.error('❌ Error creating products table:', error);
    }
};

const seedProducts = async () => {
    try {
        const pool = await getPool();
        const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM products');
        if (count > 0) {
            console.log('✅ Products already seeded');
            return;
        }

        const products = [
            ['Bubble Heart Candle -Duo', 849, 'Luxury', 'Bold red artisan candle shaped like a bubble heart for romantic décor.', '/images/category1.png', 4.9, 'Artisan'],
            ['Ocean Breeze Candle', 449, 'Gel Candles', 'Cool ocean-inspired gel candle with a soothing, calming glow.', '/images/product3.png', 4.7, null],
            ['Rose Pillar Candle', 399, 'Gel Candles', 'Warm amber and spice candles with a rich, glowing finish.', '/images/product1.png', 4.6, null],
            ['Round Shape Tealights', 349, 'Tealights', 'A romantic tealight set shaped like roses, made for intimate celebrations.', '/images/product6.png', 4.9, 'Trending'],
            ['Crystal LED Tealights (Set of 6)', 699, 'Tealights', 'LED crystal tealights for safe, long-lasting decorative lighting.', '/images/product12.png', 4.8, 'Diwali Special'],
            ['French Lavender Pillar Candle', 549, 'Pillar Candles', 'Classic lavender pillar candle for calm, restful evenings.', '/images/product4.png', 4.7, null],
            ['Rose Love Pillar Duo', 899, 'Pillar Candles', 'A pair of rose-carved pillar candles with a romantic, textured finish.', '/images/category3.png', 4.8, 'New'],
            ['Heart Shape Pink Candle', 599, 'Jar Candles', 'Smooth lavender vanilla jar candle for tranquil, cozy moments.', '/images/product15.png', 4.7, null],
            ['Mahasu Sandalwood Jar Candle', 599, 'Jar Candles', 'A warm sandalwood candle in a reusable jar, crafted for gentle grounding.', '/images/story.png', 4.8, null],
            ['Bubble Heart Candle — Ivory', 849, 'Luxury', 'Elegant ivory bubble heart candle with a subtle, velvety fragrance.', '/images/category1.png', 4.9, 'Artisan'],
            ['Diwali Candle Gift Box', 1499, 'Gift Sets', 'A premium Diwali gift box with a curated candle selection and festive packaging.', '/images/product12.png', 4.9, 'Limited'],
            ['Romantic Rose Gift Set', 1799, 'Gift Sets', 'A romantic rose-themed gift set crafted for special evenings and thoughtful surprises.', '/images/category3.png', 5.0, 'Curated']
        ];

        await pool.query(
            'INSERT INTO products (name, price, category, description, image_url, rating, tag) VALUES ? ',
            [products]
        );

        console.log('✅ Seeded products into database');
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
};

// Create Reviews Table
const createReviewsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      rating TINYINT NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    try {
        const pool = await getPool();
        await pool.query(query);
        console.log('✅ Reviews table created/exists');
    } catch (error) {
        console.error('❌ Error creating reviews table:', error);
    }
};

// Create Users Table
const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone VARCHAR(20),
      address TEXT,
      city VARCHAR(100),
      zip_code VARCHAR(20),
      role VARCHAR(50) DEFAULT 'customer',
      reset_token VARCHAR(255),
      reset_token_expiry DATETIME,
      failed_login_attempts INT DEFAULT 0,
      locked_until DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
    try {
        const pool = await getPool();
        await pool.query(query);

        const [resetTokenColumn] = await pool.query("SHOW COLUMNS FROM users LIKE 'reset_token'");
        if (resetTokenColumn.length === 0) {
            await pool.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
        }

        const [resetExpiryColumn] = await pool.query("SHOW COLUMNS FROM users LIKE 'reset_token_expiry'");
        if (resetExpiryColumn.length === 0) {
            await pool.query('ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL');
        }

        const [roleColumn] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
        if (roleColumn.length === 0) {
            await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer'");
        }

        const [failedLoginColumn] = await pool.query("SHOW COLUMNS FROM users LIKE 'failed_login_attempts'");
        if (failedLoginColumn.length === 0) {
            await pool.query('ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0');
        }

        const [lockedUntilColumn] = await pool.query("SHOW COLUMNS FROM users LIKE 'locked_until'");
        if (lockedUntilColumn.length === 0) {
            await pool.query('ALTER TABLE users ADD COLUMN locked_until DATETIME NULL');
        }

        console.log('✅ Users table created/updated with password reset fields, role, and account lockout');
    } catch (error) {
        console.error('❌ Error creating users table:', error);
    }
};

// Create Addresses Table
const createAddressesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      label VARCHAR(100),
      full_name VARCHAR(100) NOT NULL,
      street VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      zip VARCHAR(20) NOT NULL,
      country VARCHAR(100) NOT NULL DEFAULT 'India',
      phone VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
    try {
        const pool = await getPool();
        await pool.query(query);
        console.log('✅ Addresses table created/exists');
    } catch (error) {
        console.error('❌ Error creating addresses table:', error);
    }
};

// Create Orders Table
const createOrdersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      address_id INT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total_amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(100),
      razorpay_order_id VARCHAR(255),
      razorpay_payment_id VARCHAR(255),
      payment_status VARCHAR(50) DEFAULT 'pending',
      order_status VARCHAR(50) DEFAULT 'pending',
      shipping_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
    )
  `;
    try {
        const pool = await getPool();
        await pool.query(query);

        const [columns] = await pool.query("SHOW COLUMNS FROM orders LIKE 'razorpay_order_id'");
        if (columns.length === 0) {
            await pool.query(`ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255)`);
        }

        const [paymentIdColumns] = await pool.query("SHOW COLUMNS FROM orders LIKE 'razorpay_payment_id'");
        if (paymentIdColumns.length === 0) {
            await pool.query(`ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(255)`);
        }

        const [paymentStatusColumns] = await pool.query("SHOW COLUMNS FROM orders LIKE 'payment_status'");
        if (paymentStatusColumns.length === 0) {
            await pool.query(`ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'`);
        }

        const [orderStatusColumns] = await pool.query("SHOW COLUMNS FROM orders LIKE 'order_status'");
        if (orderStatusColumns.length === 0) {
            await pool.query(`ALTER TABLE orders ADD COLUMN order_status VARCHAR(50) DEFAULT 'pending'`);
        }

        const [shippingAddressColumns] = await pool.query("SHOW COLUMNS FROM orders LIKE 'shipping_address'");
        if (shippingAddressColumns.length === 0) {
            await pool.query(`ALTER TABLE orders ADD COLUMN shipping_address TEXT`);
        }

        const [addressIdColumns] = await pool.query("SHOW COLUMNS FROM orders LIKE 'address_id'");
        if (addressIdColumns.length === 0) {
            await pool.query(`ALTER TABLE orders ADD COLUMN address_id INT NULL`);
        }

        console.log('✅ Orders table created/updated with payment columns');
    } catch (error) {
        console.error('❌ Error creating or updating orders table:', error);
    }
};

// Create Order Items Table
const createOrderItemsTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `;
    try {
        const pool = await getPool();
        await pool.query(query);
        console.log('✅ Order Items table created/exists');
    } catch (error) {
        console.error('❌ Error creating order items table:', error);
    }
};

// Create Cart Table
const createCartTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_cart_item (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `;
    try {
        const pool = await getPool();
        await pool.query(query);
        console.log('✅ Cart table created/exists');
    } catch (error) {
        console.error('❌ Error creating cart table:', error);
    }
};

// Initialize all tables
const initializeDatabase = async () => {
    console.log('\n📊 Initializing database tables...\n');
    await createProductsTable();
    await seedProducts();
    await createReviewsTable();
    await createUsersTable();
    await createAddressesTable();
    await createOrdersTable();
    await createOrderItemsTable();
    await createCartTable();
    console.log('\n✅ All tables initialized!\n');
};

module.exports = { initializeDatabase };
