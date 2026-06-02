import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import './Help.css';

export default function Cancellation() {
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
                // Filter orders that are not yet delivered
                const cancellableOrders = data.filter(order =>
                    order.order_status !== 'delivered' && order.order_status !== 'cancelled'
                );
                setUserOrders(cancellableOrders);
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
                setError('Please login to submit a cancellation request');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/cancellations`, {
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
                throw new Error('Failed to submit cancellation request');
            }

            setSubmitted(true);
            setSelectedOrder('');
            setReason('');
            setDescription('');
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            setError(err.message || 'Failed to submit cancellation request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="help-page">
            <div className="help-container">
                <h1>❌ Cancel Order</h1>
                <p className="help-subtitle">Request to cancel your order</p>

                {submitted && (
                    <div className="success-message">
                        ✓ Cancellation request submitted! We will process it within 24 hours.
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <div className="cancellation-info">
                    <h3>Cancellation Policy</h3>
                    <ul>
                        <li>You can cancel orders within <strong>24 hours</strong> of placement</li>
                        <li>Orders that are already <strong>shipped or delivered</strong> cannot be cancelled</li>
                        <li>Full refund will be credited to your original payment method</li>
                        <li>Refund processing takes <strong>5-7 business days</strong></li>
                    </ul>
                </div>

                <p className="help-tip">If you need your order ID, visit the <Link to="/track-order">Track Order</Link> page to view your recent orders before cancelling.</p>
                <form onSubmit={handleSubmit} className="cancellation-form">
                    <div className="form-group">
                        <label htmlFor="order">Select Order to Cancel:</label>
                        <select
                            id="order"
                            value={selectedOrder}
                            onChange={(e) => setSelectedOrder(e.target.value)}
                            className="form-input"
                        >
                            <option value="">-- Choose an order --</option>
                            {userOrders.length > 0 ? userOrders.map(order => (
                                <option key={order.id} value={order.id}>
                                    Order #{order.id} - ₹{parseFloat(order.total_amount).toFixed(2)} (Status: {order.order_status})
                                </option>
                            )) : (
                                <option disabled>No cancellable orders found</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">Cancellation Reason:</label>
                        <select
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="form-input"
                        >
                            <option value="">-- Select reason --</option>
                            <option value="changed_mind">Changed my mind</option>
                            <option value="found_elsewhere">Found elsewhere at lower price</option>
                            <option value="no_longer_needed">No longer needed</option>
                            <option value="duplicate_order">Duplicate order</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Additional Details:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide additional details about your cancellation..."
                            className="form-textarea"
                            rows="5"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Submitting...' : 'Cancel Order'}
                    </button>
                </form>

                <div className="cancellation-warning">
                    <p><strong>⚠️ Note:</strong> Cancelling your order cannot be undone. Please ensure this is what you want to do.</p>
                </div>
            </div>
        </div>
    );
}
