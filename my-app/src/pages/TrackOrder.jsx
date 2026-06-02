import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import './Help.css';

export default function TrackOrder() {
    const { user: authUser, token: authToken } = useAuth();
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [error, setError] = useState('');

    const fetchOrderDetails = async (id) => {
        if (!id || !id.toString().trim()) {
            setError('Please enter an order ID');
            return;
        }

        setLoading(true);
        setError('');
        setOrderData(null);

        try {
            if (!authToken && !authUser) {
                throw new Error('Please login to track your order');
            }

            const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                credentials: 'include',
                headers: {
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || 'Order not found');
            }

            const data = await response.json();
            const order = data.order || data;
            setOrderData(order);
            setOrderItems(data.items || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        await fetchOrderDetails(orderId);
    };

    const handleTrackOrder = async (selectedId) => {
        setOrderId(selectedId);
        await fetchOrderDetails(selectedId);
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#FFA500',
            'confirmed': '#3498db',
            'shipped': '#9b59b6',
            'delivered': '#27ae60',
            'cancelled': '#e74c3c'
        };
        return colors[status] || '#95a5a6';
    };

    useEffect(() => {
        const loadOrders = async () => {
            if (!authToken && !authUser) {
                setUserOrders([]);
                return;
            }

            setLoadingOrders(true);
            try {
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
                console.error('Error loading user orders:', err);
            } finally {
                setLoadingOrders(false);
            }
        };

        loadOrders();
    }, [authUser, authToken]);

    return (
        <div className="help-page">
            <div className="help-container">
                <h1>📦 Track Your Order</h1>
                <p className="help-subtitle">Enter your order ID to track your shipment</p>

                <form onSubmit={handleSearch} className="track-form">
                    <div className="form-group">
                        <label htmlFor="orderId">Order ID:</label>
                        <input
                            type="text"
                            id="orderId"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="e.g., #12345"
                            className="form-input"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Searching...' : 'Track Order'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {!authUser && (
                    <p className="help-tip">Sign in to see your recent orders and order IDs for tracking, returns, and cancellations.</p>
                )}

                {authUser && (
                    <div className="recent-orders">
                        <h2>Your Recent Orders</h2>
                        {loadingOrders ? (
                            <p>Loading your orders...</p>
                        ) : userOrders.length > 0 ? (
                            <div className="order-list">
                                {userOrders.map((order) => (
                                    <div key={order.id} className="order-card">
                                        <div>
                                            <strong>Order #{order.id}</strong>
                                            <div className="order-meta">
                                                ₹{parseFloat(order.total_amount).toFixed(2)} · {new Date(order.order_date || order.created_at || order.createdAt).toLocaleDateString()} · {order.order_status}
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-secondary" onClick={() => handleTrackOrder(order.id)}>
                                            Track this order
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No orders found yet. Place an order to track it here.</p>
                        )}
                    </div>
                )}

                {orderData && (
                    <div className="order-details">
                        <h2>Order Details</h2>
                        <div className="order-info">
                            <div className="info-item">
                                <span className="label">Order ID:</span>
                                <span className="value">#{orderData.id}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Order Date:</span>
                                <span className="value">{new Date(orderData.order_date || orderData.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Total Amount:</span>
                                <span className="value">₹{parseFloat(orderData.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Payment Status:</span>
                                <span className="value" style={{ color: getStatusColor(orderData.payment_status) }}>
                                    {orderData.payment_status.toUpperCase()}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Order Status:</span>
                                <span className="value" style={{ color: getStatusColor(orderData.order_status) }}>
                                    {orderData.order_status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="status-timeline">
                            <h3>Shipment Timeline</h3>
                            <div className="timeline">
                                {['pending', 'confirmed', 'shipped', 'delivered'].map((status, idx) => (
                                    <div key={idx} className={`timeline-item ${orderData.order_status === status ||
                                        (['pending', 'confirmed', 'shipped', 'delivered'].indexOf(orderData.order_status) >= idx) ? 'completed' : ''}`}>
                                        <div className="timeline-marker">
                                            {['pending', 'confirmed', 'shipped', 'delivered'].indexOf(orderData.order_status) >= idx ? '✓' : ''}
                                        </div>
                                        <div className="timeline-label">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {orderItems.length > 0 && (
                            <div className="order-details" style={{ marginTop: '25px' }}>
                                <h3>Items in this order</h3>
                                <div className="order-info" style={{ gridTemplateColumns: '1fr' }}>
                                    {orderItems.map((item) => (
                                        <div key={item.id || `${item.product_id}-${item.quantity}`} className="info-item">
                                            <div>
                                                <span className="label">{item.name || 'Product'}</span>
                                                <div className="value">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="value">₹{parseFloat(item.price).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
