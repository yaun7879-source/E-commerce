const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getPool } = require('../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { total_amount, currency = 'INR' } = req.body;

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: 'Total amount is required and must be greater than zero.' });
    }

    const orderOptions = {
      amount: Math.round(total_amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(orderOptions);

    res.json({
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ error: error.message || 'Unable to create Razorpay order' });
  }
};

exports.verifyPayment = async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total_amount,
      shipping_address = '',
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Razorpay payment details are required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required for order creation.' });
    }

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: 'Total amount is required and must be greater than zero.' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid Razorpay signature.' });
    }

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (user_id, total_amount, razorpay_order_id, razorpay_payment_id, payment_status, order_status, payment_method, shipping_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        total_amount,
        razorpay_order_id,
        razorpay_payment_id,
        'paid',
        'confirmed',
        'razorpay',
        shipping_address,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.userId]);
    await connection.commit();

    res.status(201).json({ orderId, message: 'Payment verified and order created successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Payment verification failed:', error);
    res.status(500).json({ error: error.message || 'Payment verification failed' });
  } finally {
    connection.release();
  }
};
