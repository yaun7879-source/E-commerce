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

// Create product - admin only
exports.createProduct = async (req, res) => {
    try {
        const pool = await getPool();
        const { name, price, category, description, image_url, rating, tag } = req.body;

        // Validate required fields
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }

        // Validate price
        const parsedPrice = parseFloat(price);
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0 || parsedPrice > 999999) {
            return res.status(400).json({ error: 'Price must be a positive number between 0.01 and 999,999' });
        }

        // Validate rating if provided
        if (rating !== undefined && rating !== null) {
            const parsedRating = parseFloat(rating);
            if (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5) {
                return res.status(400).json({ error: 'Rating must be between 0 and 5' });
            }
        }

        // Validate name length
        if (name.length > 255 || name.length < 3) {
            return res.status(400).json({ error: 'Product name must be between 3 and 255 characters' });
        }

        const [result] = await pool.query(
            'INSERT INTO products (name, price, category, description, image_url, rating, tag) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, parsedPrice, category, description, image_url, rating, tag]
        );
        res.status(201).json({ id: result.insertId, name, price: parsedPrice, category, description, image_url, rating, tag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update product - admin only
exports.updateProduct = async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;
        const { name, price, category, description, image_url, rating, tag } = req.body;

        // Validate price if provided
        if (price !== undefined && price !== null) {
            const parsedPrice = parseFloat(price);
            if (!Number.isFinite(parsedPrice) || parsedPrice <= 0 || parsedPrice > 999999) {
                return res.status(400).json({ error: 'Price must be a positive number between 0.01 and 999,999' });
            }
        }

        // Validate rating if provided
        if (rating !== undefined && rating !== null) {
            const parsedRating = parseFloat(rating);
            if (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5) {
                return res.status(400).json({ error: 'Rating must be between 0 and 5' });
            }
        }

        // Validate name if provided
        if (name !== undefined && (name.length > 255 || name.length < 3)) {
            return res.status(400).json({ error: 'Product name must be between 3 and 255 characters' });
        }

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
