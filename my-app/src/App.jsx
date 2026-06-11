import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { apiFetch, API_BASE_URL } from './utils/api';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import About from './pages/About';
import Contact from './pages/Contact';
import AuthPage from './pages/AuthPage';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Return from './pages/Return';
import Cancellation from './pages/Cancellation';
import FAQ from './pages/FAQ';
import HelpHub from './pages/HelpHub';
import PrivacyPolicy from './pages/PrivacyPolicy';
import products from './data/products';
import WhatsAppFloat from './components/WhatsAppFloat';
import './App.css';
const catalog = products;
function App() {
  const { user: authUser, token: authToken, login: authLogin, logout: authLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Search state ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // ── Auth state ──


  // ── Cart state ──
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);
  // ── Likes / Wishlist ──
  const [likedItems, setLikedItems] = useState([]);
  const [likesOpen, setLikesOpen] = useState(false);
  const likesRef = useRef(null);

  // ── Subscription state ──
  const [subscription, setSubscription] = useState({ isSubscribed: false, discountPercentage: 0 });

  // ── Toast ──
  const [toast, setToast] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const getAuthHeaders = () => {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  };

  const clearAuth = () => {
    authLogout();
    setCartItems([]);
  };

  const handleUnauthorized = () => {
    clearAuth();
    showToast('Session expired. Please sign in again.');
  };

  useEffect(() => {
    const hydrateCookieAuth = async () => {
      if (authUser || authToken) return;

      try {
        const response = await apiFetch('/auth/profile');

        if (!response.ok) return;

        const data = await response.json();
        const user = data.user || data;
        authLogin(user, null);
      } catch (error) {
        console.error('Unable to hydrate cookie auth:', error);
      }
    };

    hydrateCookieAuth();
  }, [authUser, authToken, authLogin]);

  const loadCart = async () => {
    if (!authToken && !authUser) {
      setCartItems([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        credentials: 'include',
        headers: { ...getAuthHeaders() },
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Unable to load cart:', error);
    }
  };

  const checkSubscription = async () => {
    if (!authToken && !authUser) {
      setSubscription({ isSubscribed: false, discountPercentage: 0 });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/status`, {
        credentials: 'include',
        headers: { ...getAuthHeaders() },
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        setSubscription({ isSubscribed: false, discountPercentage: 0 });
        return;
      }
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Unable to check subscription:', error);
      setSubscription({ isSubscribed: false, discountPercentage: 0 });
    }
  };

  const loadRazorpayScript = async () => {
    return new Promise((resolve) => {
      const existingScript = document.getElementById('razorpay-script');
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyRazorpayPayment = async (paymentResponse, addressId = null, shippingAddress = '') => {
    // Calculate final amount with discount
    const gst = Math.round(cartTotal * 0.18);
    const subtotalWithGST = cartTotal + gst;
    const discountAmount = subscription.isSubscribed ? Math.round(subtotalWithGST * (subscription.discountPercentage / 100)) : 0;
    const finalAmount = subtotalWithGST - discountAmount;

    const payload = {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
      total_amount: finalAmount,
      base_amount: cartTotal,
      gst_amount: gst,
      discount_applied: subscription.isSubscribed,
      discount_percentage: subscription.discountPercentage,
      discount_amount: discountAmount,
      shipping_address: shippingAddress || authUser?.address || '',
      address_id: addressId,
    };

    const response = await fetch(`${API_BASE_URL}/payment/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment verification failed');
    }

    const data = await response.json();
    await loadCart();
    setCartItems([]);
    return data;
  };

  const handlePayNow = async ({ addressId = null, shippingAddress = '' } = {}) => {
    if (!authUser && !authToken) {
      showToast('Please log in to checkout');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty');
      return;
    }

    setPaymentLoading(true);

    try {
      // Calculate final amount with discount if subscribed
      const gst = Math.round(cartTotal * 0.18);
      const subtotalWithGST = cartTotal + gst;
      const discountAmount = subscription.isSubscribed ? Math.round(subtotalWithGST * (subscription.discountPercentage / 100)) : 0;
      const finalAmount = subtotalWithGST - discountAmount;

      const createResponse = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          total_amount: finalAmount,
          currency: 'INR',
          discountApplied: subscription.isSubscribed,
          discountPercentage: subscription.discountPercentage,
          discountAmount: discountAmount
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Unable to create payment order');
      }

      const { order, key_id } = await createResponse.json();
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load');
      }

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'MahaSu',
        description: 'Secure payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            const result = await verifyRazorpayPayment(response, addressId, shippingAddress);
            setPaymentLoading(false);
            setLastOrderId(result.orderId);
            showToast(`Payment successful! Order #${result.orderId} created.`);
          } catch (verifyError) {
            console.error('Verification failed:', verifyError);
            setPaymentLoading(false);
            showToast('Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
        prefill: {
          name: `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim(),
          email: authUser.email,
        },
        theme: {
          color: '#B8936A',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Checkout failed:', error);
      showToast(error.message || 'Unable to start payment');
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const handle = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Handle OAuth callback from login page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const email = params.get('email');
    const token = params.get('token');
    const firstName = params.get('first_name');
    const lastName = params.get('last_name');

    if (id && email) {
      // User coming from OAuth callback
      const userData = {
        id: id ? parseInt(id) : null,
        email,
        first_name: firstName || '',
        last_name: lastName || '',
      };

      authLogin(userData, token);

      // Clear query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to home after successful login
      setTimeout(() => {
        navigate('/');
        showToast(`Welcome back, ${firstName || 'User'}!`);
      }, 500);
    }
  }, [navigate]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
    else { setSearchQuery(''); setSearchResults([]); }
  }, [searchOpen]);

  useEffect(() => {
    loadCart();
    checkSubscription();
  }, [authToken, authUser]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('likedItems');
      if (stored) setLikedItems(JSON.parse(stored));
    } catch (e) {
      console.warn('Could not load liked items', e);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('likedItems', JSON.stringify(likedItems));
    } catch (e) {
      console.warn('Could not persist liked items', e);
    }
  }, [likedItems]);

  const toggleLike = (productId, productName = '') => {
    setLikedItems(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? `${productName || 'Item'} removed from likes` : `${productName || 'Item'} added to likes`);
      return next;
    });
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const low = q.toLowerCase();
    setSearchResults(catalog.filter(p =>
      p.name.toLowerCase().includes(low) || p.category.toLowerCase().includes(low)
    ));
  };

  const goToProduct = (id) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/product/${id}`);
  };

  const handleLogin = (user, token) => {
    authLogin(user, token);
  };

  const addToCart = async (product) => {
    if (!authUser && !authToken) {
      showToast('Please log in to save your cart');
      return false;
    }

    try {
      const productId = Number(product.id);
      if (Number.isNaN(productId)) {
        throw new Error('Invalid product ID');
      }

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return false;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Unable to add item');
      }

      await loadCart();
      showToast(`✦ ${product.name} added`);
      setSearchOpen(false);
      return true;
    } catch (error) {
      console.error('Add to cart failed:', error);
      showToast('Unable to add item to cart');
      return false;
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!authUser && !authToken) {
      setCartItems(prev => prev.filter(i => i.id !== cartItemId));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...getAuthHeaders() },
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      await loadCart();
    } catch (error) {
      console.error('Remove from cart failed:', error);
    }
  };

  const changeQty = async (cartItemId, delta) => {
    if (!authUser && !authToken) {
      setCartItems(prev => prev
        .map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0)
      );
      return;
    }

    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      return removeFromCart(cartItemId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      await loadCart();
    } catch (error) {
      console.error('Update cart quantity failed:', error);
    }
  };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  const handleNavClick = () => { setMobileMenuOpen(false); window.scrollTo(0, 0); };

  return (
    <>
      <style>{`
        /* ── Search dropdown ── */
        .sd-wrap { position: relative; }
        .search-dropdown {
          position: absolute; top: calc(100% + 14px); right: 0;
          width: 340px; background: #fff;
          border: 1px solid rgba(184,147,106,0.25); border-radius: 10px;
          box-shadow: 0 12px 40px rgba(44,36,22,0.10);
          z-index: 2000; overflow: hidden;
          opacity: 0; transform: translateY(-6px); pointer-events: none;
          transition: opacity .2s, transform .2s;
        }
        .search-dropdown.open { opacity: 1; transform: translateY(0); pointer-events: all; }
        .sd-input-row {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; border-bottom: 1px solid rgba(184,147,106,0.15);
        }
        .sd-input-row svg { width:15px; height:15px; flex-shrink:0; stroke:#b0a090; fill:none; }
        .sd-input-row input {
          flex:1; border:none; outline:none;
          font-size:13px; font-family:inherit; color:#2C2416; background:transparent;
        }
        .sd-input-row input::placeholder { color:#c5b8a8; }
        .sd-clear { background:none; border:none; cursor:pointer; color:#c5b8a8; font-size:18px; line-height:1; padding:0; }
        .sd-results { max-height:260px; overflow-y:auto; }
        .sd-results::-webkit-scrollbar { width:3px; }
        .sd-results::-webkit-scrollbar-thumb { background:rgba(184,147,106,0.3); border-radius:3px; }
        .sd-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 16px; border-bottom:1px solid rgba(184,147,106,0.08); transition:background .15s;
        }
        .sd-row:last-child { border-bottom:none; }
        .sd-row:hover { background:#fdf9f5; }
        .sd-name { font-size:13px; color:#2C2416; }
        .sd-cat { font-size:11px; color:#8a7060; margin-top:1px; }
        .sd-price { font-size:14px; color:#B8936A; margin-right:10px; font-weight:500; }
        .sd-view {
          background:#B8936A; color:#fff; border:none; border-radius:16px;
          font-size:11px; padding:5px 12px; cursor:pointer; transition:background .15s;
          white-space:nowrap; font-family:inherit;
        }
        .sd-view:hover { background:#2C2416; }
        .sd-empty { padding:24px 16px; text-align:center; font-size:13px; color:#8a7060; }
        .sd-hints { padding:14px 16px; }
        .sd-hint-label { font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#8a7060; margin-bottom:8px; }
        .sd-pills { display:flex; flex-wrap:wrap; gap:6px; }
        .sd-pill {
          padding:4px 11px; border:1px solid rgba(184,147,106,0.25); border-radius:20px;
          font-size:12px; color:#8a7060; cursor:pointer; transition:all .15s;
          font-family:inherit; background:none;
        }
        .sd-pill:hover { background:#B8936A; color:#fff; border-color:#B8936A; }

        /* ── Cart dropdown ── */
        .cd-wrap { position: relative; }
        .cart-dropdown {
          position: absolute; top: calc(100% + 14px); right: 0;
          width: 320px; background: #fff;
          border: 1px solid rgba(184,147,106,0.25); border-radius: 10px;
          box-shadow: 0 12px 40px rgba(44,36,22,0.10);
          z-index: 2000; overflow: hidden;
          opacity: 0; transform: translateY(-6px); pointer-events: none;
          transition: opacity .2s, transform .2s;
        }
        .cart-dropdown.open { opacity: 1; transform: translateY(0); pointer-events: all; }
        .cd-head {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 18px 12px; border-bottom:1px solid rgba(184,147,106,0.15);
        }
        .cd-head h3 { font-size:16px; font-weight:500; color:#2C2416; letter-spacing:.03em; }
        .cd-badge { background:#B8936A; color:#fff; font-size:10px; padding:2px 8px; border-radius:10px; }
        .cd-body { max-height:260px; overflow-y:auto; }
        .cd-body::-webkit-scrollbar { width:3px; }
        .cd-body::-webkit-scrollbar-thumb { background:rgba(184,147,106,0.3); border-radius:3px; }
        .cd-empty { padding:32px 18px; text-align:center; font-size:13px; color:#8a7060; }
        .cd-item {
          display:flex; align-items:center; gap:10px;
          padding:10px 18px; border-bottom:1px solid rgba(184,147,106,0.08);
        }
        .cd-item:last-child { border-bottom:none; }
        .cd-info { flex:1; }
        .cd-iname { font-size:13px; color:#2C2416; line-height:1.4; }
        .cd-iprice { font-size:13px; color:#B8936A; margin-top:2px; }
        .cd-qty { display:flex; align-items:center; gap:5px; }
        .cd-qbtn {
          width:20px; height:20px; border:1px solid rgba(184,147,106,0.3); background:none;
          border-radius:50%; font-size:13px; cursor:pointer; display:flex;
          align-items:center; justify-content:center; color:#6B5A47;
          transition:all .15s; line-height:1;
        }
        .cd-qbtn:hover { background:#B8936A; color:#fff; border-color:#B8936A; }
        .cd-qnum { font-size:13px; color:#2C2416; min-width:14px; text-align:center; }
        .cd-rm { background:none; border:none; cursor:pointer; color:#ccc; font-size:18px; transition:color .15s; padding:0; }
        .cd-rm:hover { color:#e07070; }
        .cd-foot { padding:14px 18px; border-top:1px solid rgba(184,147,106,0.15); background:#fdf9f5; }
        .cd-total { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .cd-total-label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#8a7060; }
        .cd-total-price { font-size:20px; color:#2C2416; font-weight:500; }
        .cd-checkout {
          width:100%; padding:11px; background:#2C2416; color:#F7F2EA;
          border:none; border-radius:7px; font-size:11px; letter-spacing:.1em;
          text-transform:uppercase; cursor:pointer; transition:background .18s; font-family:inherit;
        }
        .cd-checkout:hover { background:#B8936A; }

        /* ── Cart badge on icon ── */
        .nav-icon-btn { position:relative; background:none; border:none; cursor:pointer; padding:8px; color:#2C2416; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:color .2s; }
        .nav-icon-btn:hover { color:#B8936A; }
        .nav-icon-btn svg { width:20px; height:20px; stroke:currentColor; fill:none; stroke-width:1.5; display:block; }
        .nav-icon-btn .cart-badge {
          position:absolute; top:2px; right:2px;
          background:#B8936A; color:#fff; font-size:9px; font-weight:700;
          width:15px; height:15px; border-radius:50%;
          display:flex; align-items:center; justify-content:center; pointer-events:none;
          line-height:1;
        }

        /* ── Toast ── */
        .mahasu-toast {
          position:fixed; bottom:28px; left:50%;
          transform:translateX(-50%) translateY(8px);
          background:#2C2416; color:#F7F2EA;
          font-size:12px; padding:10px 22px; border-radius:22px;
          letter-spacing:.04em; z-index:9999; pointer-events:none;
          opacity:0; transition:opacity .25s, transform .25s;
        }
        .mahasu-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
      `}</style>

      <div className="app-container">
        {/* ── NAVIGATION ── */}
        <nav className="nav">
          <Link to="/" className="logo" onClick={handleNavClick}>
            Maha<span>su</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Nav Links */}
          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" onClick={handleNavClick}>Home</Link>
            <Link to="/shop" onClick={handleNavClick}>Shop</Link>
            <Link to="/about" onClick={handleNavClick}>About</Link>
            <Link to="/contact" onClick={handleNavClick}>Contact</Link>
            <Link to="/help" onClick={handleNavClick}>Help & Support</Link>
            <Link
              to="/login"
              className="auth-pill-btn"
              onClick={handleNavClick}
              aria-label="Login / Signup"
            >
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3" />
                <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
              </svg>
              <div className="auth-pill-text">
                <span className="auth-pill-label">Account</span>
                <span className="auth-pill-main">Login / Signup</span>
              </div>
            </Link>
          </div>

          {/* Nav Icons — single source of truth, no duplicates */}
          <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {/* SEARCH */}
            <div className="sd-wrap" ref={searchRef}>
              <button
                className="nav-icon-btn"
                onClick={() => setSearchOpen(o => !o)}
                aria-label="Search"
              >
                <svg viewBox="0 0 24 24" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              <div className={`search-dropdown ${searchOpen ? 'open' : ''}`}>
                <div className="sd-input-row">
                  <svg viewBox="0 0 24 24" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search candles, diffusers…"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        goToProduct(searchResults[0].id);
                      }
                    }}
                  />
                  {searchQuery && (
                    <button className="sd-clear" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>×</button>
                  )}
                </div>
                <div className="sd-results">
                  {!searchQuery && (
                    <div className="sd-hints">
                      <div className="sd-hint-label">Popular</div>
                      <div className="sd-pills">
                        {['Candles', 'Diffuser', 'Gift Sets', 'Lavender', 'Diwali'].map(t => (
                          <button key={t} className="sd-pill" onClick={() => handleSearch(t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchQuery && searchResults.length === 0 && (
                    <div className="sd-empty">No results for "{searchQuery}"</div>
                  )}
                  {searchResults.map(item => (
                    <div key={item.id} className="sd-row">
                      <div>
                        <div className="sd-name">{item.name}</div>
                        <div className="sd-cat">{item.category}</div>
                      </div>
                      <span className="sd-price">₹{item.price.toLocaleString('en-IN')}</span>
                      <button className="sd-view" onClick={() => goToProduct(item.id)}>View</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WISHLIST / Likes */}
            <div className="cd-wrap" ref={likesRef} style={{ marginRight: 6 }}>
              <button
                type="button"
                className="nav-icon-btn"
                aria-label="Wishlist"
                onClick={() => setLikesOpen(o => !o)}
              >
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likedItems.length > 0 && <span className="cart-badge">{likedItems.length}</span>}
              </button>

              <div className={`cart-dropdown ${likesOpen ? 'open' : ''}`} style={{ width: 380 }}>
                <div className="cd-head">
                  <h3>Liked Items</h3>
                  {likedItems.length > 0 && <span className="cd-badge">{likedItems.length} saved</span>}
                </div>
                <div className="cd-body">
                  {likedItems.length === 0 ? (
                    <div className="cd-empty">No liked items yet</div>
                  ) : (
                    likedItems.map(id => {
                      const p = catalog.find(x => x.id === Number(id));
                      if (!p) return null;
                      return (
                        <div key={p.id} className="cd-item">
                          <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                            <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div className="cd-info">
                            <div className="cd-iname">{p.name}</div>
                            <div className="cd-iprice">₹{Number(p.price).toLocaleString('en-IN')}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="cd-qbtn" onClick={() => navigate(`/product/${p.id}`)}>View</button>
                            <button className="cd-rm" onClick={() => toggleLike(p.id, p.name)}>×</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* CART */}
            <div className="cd-wrap" ref={cartRef}>
              <button
                className="nav-icon-btn"
                onClick={() => setCartOpen(o => !o)}
                aria-label="Cart"
              >
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </button>

              <div className={`cart-dropdown ${cartOpen ? 'open' : ''}`}>
                <div className="cd-head">
                  <h3>Your Cart</h3>
                  {totalItems > 0 && <span className="cd-badge">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>}
                </div>
                <div className="cd-body">
                  {cartItems.length === 0 ? (
                    <div className="cd-empty">Your cart is empty</div>
                  ) : cartItems.map(item => (
                    <div key={item.id} className="cd-item">
                      <div className="cd-info">
                        <div className="cd-iname">{item.name}</div>
                        <div className="cd-iprice">₹{item.price.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="cd-qty">
                        <button className="cd-qbtn" onClick={() => changeQty(item.id, -1)}>−</button>
                        <span className="cd-qnum">{item.quantity}</span>
                        <button className="cd-qbtn" onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>
                      <button className="cd-rm" onClick={() => removeFromCart(item.id)}>×</button>
                    </div>
                  ))}
                </div>
                {cartItems.length > 0 && (
                  <div className="cd-foot">
                    <div className="cd-total">
                      <span className="cd-total-label">Total</span>
                      <span className="cd-total-price">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      className="cd-checkout"
                      onClick={() => navigate('/checkout')}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? 'Processing...' : 'Checkout'}
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home authUser={authUser} addToCart={addToCart} likedItems={likedItems} toggleLike={toggleLike} />} />
            <Route path="/shop" element={<Shop authUser={authUser} addToCart={addToCart} likedItems={likedItems} toggleLike={toggleLike} />} />
            <Route path="/product/:id" element={<Product authUser={authUser} addToCart={addToCart} likedItems={likedItems} toggleLike={toggleLike} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpHub />} />
            <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<AuthPage onLogin={handleLogin} />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/return" element={<Return />} />
            <Route path="/cancellation" element={<Cancellation />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/checkout"
              element={
                <Checkout
                  authUser={authUser}
                  authToken={authToken}
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  onPayNow={handlePayNow}
                  lastOrderId={lastOrderId}
                  showToast={showToast}
                  subscription={subscription}
                  onSubscribe={checkSubscription}
                />
              }
            />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-brand">
            <div className="footer-logo">Maha<span>su</span></div>
            <p>India's home of fragrances. Handcrafted candles and niche home scents curated with love.</p>
            <div className="footer-contact">
              <div>📞 +91 9993107111</div>
              <div>✉ support@mahasu.co.in</div>
              <div>🌐 mahasu.co.in</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop" onClick={handleNavClick}>Candles</Link>
            <Link to="/shop" onClick={handleNavClick}>Tealights</Link>
            <Link to="/shop" onClick={handleNavClick}>Gift Sets</Link>
            <Link to="/shop" onClick={handleNavClick}>Diffusers</Link>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <Link to="/track-order" onClick={handleNavClick}>Track Order</Link>
            <Link to="/return" onClick={handleNavClick}>Returns</Link>
            <Link to="/faq" onClick={handleNavClick}>FAQ</Link>
            <Link to="/cancellation" onClick={handleNavClick}>Cancellation</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about" onClick={handleNavClick}>Our Story</Link>
            <Link to="/privacy-policy" onClick={handleNavClick}>Privacy Policy</Link>
            <a href="#blog">Blog</a>
            <a href="#wholesale">Wholesale</a>
          </div>
        </footer>

        <div className="footer-bottom">
          <p>© 2026 Mahasu. All rights reserved.</p>

          <p>
            Designed & Developed by Yash Patel
          </p>

          <p>Made with love in India 🇮🇳</p>
        </div>
      </div>

      <WhatsAppFloat />

      {/* Toast — rendered once at app level */}
      <div className={`mahasu-toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  );
}

export default App;