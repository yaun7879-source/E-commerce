import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formatAddress = (address) => {
    if (!address) return '';
    return [
        address.full_name,
        address.street,
        `${address.city}, ${address.state} ${address.zip}`,
        address.country,
        `Phone: ${address.phone}`,
    ]
        .filter(Boolean)
        .join(', ');
};

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const Checkout = ({ authUser, authToken, cartItems, cartTotal, onPayNow, showToast }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        label: 'Home',
        full_name: authUser?.first_name ? `${authUser.first_name} ${authUser.last_name || ''}`.trim() : '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: authUser?.phone || '',
    });
    const navigate = useNavigate();

    const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const addressList = useMemo(() => addresses || [], [addresses]);

    const loadAddresses = async () => {
        if (!authToken) return;
        try {
            const res = await fetch('/api/addresses', { headers: { ...authHeaders } });
            if (!res.ok) throw new Error('Unable to load saved addresses');
            const data = await res.json();
            setAddresses(data);
            if (!selectedAddressId && data.length > 0) setSelectedAddressId(data[0].id);
        } catch (error) {
            showToast(error.message || 'Unable to load addresses');
        }
    };

    useEffect(() => {
        if (!authToken) {
            showToast('Please log in to continue to checkout');
            navigate('/login');
            return;
        }
        loadAddresses();
    }, [authToken]);

    const handleInputChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to save address');
            showToast('Address saved successfully.');
            await loadAddresses();
            setSelectedAddressId(data.id);
            setShowForm(false);
        } catch (error) {
            showToast(error.message || 'Address save failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        const selected = addresses.find((a) => a.id === selectedAddressId);
        if (!selected) {
            showToast('Please select or create a delivery address');
            return;
        }
        await onPayNow({ addressId: selected.id, shippingAddress: formatAddress(selected) });
    };

    return (
        <div className="co-page">

            {/* ── Header ── */}
            <div className="co-header">
                <p className="co-eyebrow">Secure Checkout</p>
                <h1 className="co-title">Complete Your <em>Order</em></h1>
                <p className="co-subtitle">Select a delivery address to proceed with payment</p>
                <div className="co-divider" />
            </div>

            {/* ── Steps ── */}
            <div className="co-steps">
                <div className="co-step co-step--done">
                    <div className="co-step__bubble"><CheckIcon /></div>
                    <span className="co-step__label">Cart</span>
                </div>
                <div className="co-step__line" />
                <div className="co-step co-step--active">
                    <div className="co-step__bubble">2</div>
                    <span className="co-step__label">Delivery</span>
                </div>
                <div className="co-step__line" />
                <div className="co-step">
                    <div className="co-step__bubble">3</div>
                    <span className="co-step__label">Payment</span>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="co-grid">

                {/* LEFT */}
                <div className="co-left">

                    {/* Saved Addresses */}
                    <div className="co-card">
                        <div className="co-card__header">
                            <div className="co-card__icon">📍</div>
                            <div>
                                <h2 className="co-card__title">Saved Addresses</h2>
                                <p className="co-card__meta">Choose where to deliver your order</p>
                            </div>
                        </div>
                        <div className="co-card__body">
                            {addressList.length === 0 ? (
                                <div className="co-empty">
                                    <p>No addresses saved yet.</p>
                                    <span>Add one below to continue.</span>
                                </div>
                            ) : (
                                <div className="co-addr-list">
                                    {addressList.map((address) => (
                                        <label
                                            key={address.id}
                                            className={`co-addr-card ${selectedAddressId === address.id ? 'co-addr-card--selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="selectedAddress"
                                                value={address.id}
                                                checked={selectedAddressId === address.id}
                                                onChange={() => setSelectedAddressId(address.id)}
                                                className="co-addr-radio"
                                            />
                                            <div className="co-addr-info">
                                                <strong className="co-addr-label">{address.label || 'Address'}</strong>
                                                <p className="co-addr-text">
                                                    {address.full_name}<br />
                                                    {address.street}<br />
                                                    {address.city}, {address.state} {address.zip}<br />
                                                    {address.country}
                                                </p>
                                                <span className="co-addr-phone">📞 {address.phone}</span>
                                            </div>
                                            {selectedAddressId === address.id && (
                                                <span className="co-addr-badge">Selected</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Toggle Add Form */}
                            <button
                                type="button"
                                className="co-add-toggle"
                                onClick={() => setShowForm((v) => !v)}
                            >
                                <PlusIcon />
                                {showForm ? 'Cancel' : 'Add New Address'}
                            </button>
                        </div>
                    </div>

                    {/* Add Address Form */}
                    {showForm && (
                        <div className="co-card co-card--form">
                            <div className="co-card__header">
                                <div className="co-card__icon">✦</div>
                                <div>
                                    <h2 className="co-card__title">New Address</h2>
                                    <p className="co-card__meta">Fill in the delivery details below</p>
                                </div>
                            </div>
                            <div className="co-card__body">
                                <form className="co-form" onSubmit={handleAddAddress}>
                                    <div className="co-form__row">
                                        <div className="co-field">
                                            <label className="co-field__label">Address Label</label>
                                            <input
                                                className="co-field__input"
                                                value={form.label}
                                                onChange={(e) => handleInputChange('label', e.target.value)}
                                                placeholder="Home, Office, etc."
                                            />
                                        </div>
                                        <div className="co-field">
                                            <label className="co-field__label">Full Name</label>
                                            <input
                                                className="co-field__input"
                                                value={form.full_name}
                                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                                placeholder="Recipient name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="co-field">
                                        <label className="co-field__label">Street Address</label>
                                        <input
                                            className="co-field__input"
                                            value={form.street}
                                            onChange={(e) => handleInputChange('street', e.target.value)}
                                            placeholder="Street, house number, landmark"
                                            required
                                        />
                                    </div>

                                    <div className="co-form__row">
                                        <div className="co-field">
                                            <label className="co-field__label">City</label>
                                            <input
                                                className="co-field__input"
                                                value={form.city}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                placeholder="City"
                                                required
                                            />
                                        </div>
                                        <div className="co-field">
                                            <label className="co-field__label">State</label>
                                            <input
                                                className="co-field__input"
                                                value={form.state}
                                                onChange={(e) => handleInputChange('state', e.target.value)}
                                                placeholder="State"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="co-form__row">
                                        <div className="co-field">
                                            <label className="co-field__label">PIN / ZIP Code</label>
                                            <input
                                                className="co-field__input"
                                                value={form.zip}
                                                onChange={(e) => handleInputChange('zip', e.target.value)}
                                                placeholder="PIN or ZIP code"
                                                required
                                            />
                                        </div>
                                        <div className="co-field">
                                            <label className="co-field__label">Country</label>
                                            <input
                                                className="co-field__input"
                                                value={form.country}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                placeholder="Country"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="co-field">
                                        <label className="co-field__label">Phone Number</label>
                                        <input
                                            className="co-field__input"
                                            value={form.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Phone number"
                                            type="tel"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="co-save-btn" disabled={loading}>
                                        {loading ? (
                                            <span className="co-save-btn__spinner" />
                                        ) : (
                                            <PlusIcon />
                                        )}
                                        {loading ? 'Saving…' : 'Save Address'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT — Order Summary */}
                <div className="co-right">
                    <div className="co-summary">
                        <div className="co-summary__top">
                            <p className="co-summary__eyebrow">Your Order</p>
                            <p className="co-summary__title">Payment Summary</p>
                        </div>

                        <div className="co-summary__body">
                            {cartItems.length > 0 && (
                                <div className="co-order-items">
                                    {cartItems.map((item, i) => (
                                        <div className="co-order-item" key={item.id || i}>
                                            <div className="co-order-item__thumb">
                                                {item.image
                                                    ? <img src={item.image} alt={item.name} />
                                                    : <span>🧴</span>
                                                }
                                            </div>
                                            <div className="co-order-item__info">
                                                <p className="co-order-item__name">{item.name}</p>
                                                <p className="co-order-item__desc">{item.variant || item.description || ''}</p>
                                            </div>
                                            <p className="co-order-item__price">
                                                ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="co-summary__sep" />

                            <div className="co-summary__rows">
                                <div className="co-summary__row">
                                    <span>Items ({cartItems.length})</span>
                                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="co-summary__row">
                                    <span>Shipping</span>
                                    <span className="co-summary__free">Free</span>
                                </div>
                                <div className="co-summary__row">
                                    <span>GST (18%)</span>
                                    <span>₹{Math.round(cartTotal * 0.18).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="co-summary__total">
                                <span className="co-summary__total-label">Total</span>
                                <span className="co-summary__total-amount">
                                    ₹{Math.round(cartTotal * 1.18).toLocaleString('en-IN')}
                                </span>
                            </div>

                            <button
                                className="co-pay-btn"
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0 || loading}
                            >
                                <LockIcon />
                                Pay Now
                            </button>

                            <div className="co-secure-note">
                                <span className="co-secure-dot" />
                                256-bit SSL encryption
                                <span className="co-secure-dot" />
                                Razorpay secured
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;