const { getPool } = require('../config/db');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const pool = await getPool();
        const [products] = await pool.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;
        const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const pool = await getPool();
        const { name, price, category, description, image_url, rating, tag } = req.body;
        const [result] = await pool.query(
            'INSERT INTO products (name, price, category, description, image_url, rating, tag) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, price, category, description, image_url, rating, tag]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;
        const { name, price, category, description, image_url, rating, tag } = req.body;
        await pool.query(
            'UPDATE products SET name = ?, price = ?, category = ?, description = ?, image_url = ?, rating = ?, tag = ? WHERE id = ?',
            [name, price, category, description, image_url, rating, tag, id]
        );
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
