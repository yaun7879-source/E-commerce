import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import './Help.css';

export default function Return() {
    const { user: authUser, token: authToken } = useAuth();
    const [selectedOrder, setSelectedOrder] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [userOrders, setUserOrders] = useState([]);

    useEffect(() => {
        if (authUser || authToken) {
            fetchUserOrders();
        }
    }, [authUser, authToken]);

    const fetchUserOrders = async () => {
        try {
            if (!authUser && !authToken) {
                setError('Please login to view your orders');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/orders/user/${authUser.id}`, {
                credentials: 'include',
                headers: {
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserOrders(data);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedOrder || !reason || !description) {
            setError('Please fill all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (!authUser && !authToken) {
                setError('Please login to submit a return request');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/returns`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                },
                body: JSON.stringify({
                    order_id: selectedOrder,
                    reason,
                    description
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit return request');
            }

            setSubmitted(true);
            setSelectedOrder('');
            setReason('');
            setDescription('');
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            setError(err.message || 'Failed to submit return request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="help-page">
            <div className="help-container">
                <h1>↩️ Return Product</h1>
                <p className="help-subtitle">Submit a return request for your order</p>

                {submitted && (
                    <div className="success-message">
                        ✓ Return request submitted successfully! We will review your request within 48 hours.
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <div className="return-info">
                    <h3>Return Policy</h3>
                    <ul>
                        <li>You can return products within <strong>30 days</strong> of delivery</li>
                        <li>Product must be <strong>unused</strong> and in <strong>original packaging</strong></li>
                        <li>Refunds are processed within <strong>5-7 business days</strong></li>
                        <li>Free return shipping for eligible items</li>
                    </ul>
                </div>

                <p className="help-tip">If you are not sure which order ID to use, visit the <Link to="/track-order">Track Order</Link> page to see your recent orders.</p>
                <form onSubmit={handleSubmit} className="return-form">
                    <div className="form-group">
                        <label htmlFor="order">Select Order:</label>
                        <select
                            id="order"
                            value={selectedOrder}
                            onChange={(e) => setSelectedOrder(e.target.value)}
                            className="form-input"
                        >
                            <option value="">-- Choose an order --</option>
                            {userOrders.length > 0 ? userOrders.map(order => (
                                <option key={order.id} value={order.id}>
                                    Order #{order.id} - ₹{parseFloat(order.total_amount).toFixed(2)} ({new Date(order.order_date).toLocaleDateString()})
                                </option>
                            )) : (
                                <option disabled>No orders found</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">Return Reason:</label>
                        <select
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="form-input"
                        >
                            <option value="">-- Select reason --</option>
                            <option value="defective">Product is defective</option>
                            <option value="damaged">Product arrived damaged</option>
                            <option value="not_as_described">Not as described</option>
                            <option value="wrong_item">Wrong item received</option>
                            <option value="changed_mind">Changed my mind</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Additional Details:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide additional details about your return..."
                            className="form-textarea"
                            rows="5"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
