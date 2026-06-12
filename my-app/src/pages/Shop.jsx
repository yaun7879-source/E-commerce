import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import products from '../data/products';

const Shop = ({ addToCart, likedItems = [], toggleLike = () => { } }) => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState([0, 3000]);

    const allProducts = products;

    const categories = [
        { key: 'all', label: 'All', icon: '✦' },
        { key: 'Tealights', label: 'Tealights', icon: '🕯️' },
        { key: 'Gel Candles', label: 'Gel Candles', icon: '🌈' },
        { key: 'Pillar Candles', label: 'Pillar Candles', icon: '🏛️' },
        { key: 'Jar Candles', label: 'Jar Candles', icon: '🫙' },
        { key: 'Luxury', label: 'Luxury', icon: '👑' },
        { key: 'Gift Sets', label: 'Gift Sets', icon: '🎁' },
    ];

    const MAX_PRICE = 3000;

    const filteredProducts = allProducts.filter(p => {
        const inCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const inPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
        return inCategory && inPrice;
    });

    const handleMinChange = (e) => {
        const val = Math.min(Number(e.target.value), priceRange[1] - 100);
        setPriceRange([val, priceRange[1]]);
    };


    const handleMaxChange = (e) => {
        const val = Math.max(Number(e.target.value), priceRange[0] + 100);
        setPriceRange([priceRange[0], val]);
    };

    const minPercent = (priceRange[0] / MAX_PRICE) * 100;
    const maxPercent = (priceRange[1] / MAX_PRICE) * 100;

    const tagStyles = {
        'Bestseller': { background: '#2c2825', color: '#f5ede0' },
        'Trending': { background: '#c9a96e', color: '#fff' },
        'New': { background: '#5a8a72', color: '#fff' },
        'Diwali Special': { background: '#c0392b', color: '#fff' },
        'Artisan': { background: '#8b6f47', color: '#fff' },
        'Limited': { background: '#7d3c98', color: '#fff' },
        'Curated': { background: '#e67e22', color: '#fff' },
        '8 Hr Burn': { background: '#2471a3', color: '#fff' },
    };

    return (
        <div>
            <style>{`
                .shop-filters-wrapper {
                    background: var(--cream, #faf7f2);
                    border-bottom: 1px solid var(--smoke, #e8e0d5);
                    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 5vw, 3rem);
                    display: flex;
                    flex-direction: column;
                    gap: 1.8rem;
                }

                .category-pills {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: clamp(0.5rem, 1.2vw, 0.75rem);
                }

                .cat-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: clamp(0.5rem, 0.9vw, 0.7rem) clamp(0.8rem, 1.6vw, 1.15rem);
                    border-radius: 50px;
                    border: 1.5px solid var(--smoke, #e8e0d5);
                    background: transparent;
                    color: var(--char, #2c2825);
                    font-family: 'DM Sans', sans-serif;
                    font-size: clamp(0.73rem, 1.1vw, 0.83rem);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .cat-pill:hover {
                    border-color: var(--gold, #c9a96e);
                    background: rgba(201,169,110,0.07);
                    transform: translateY(-1px);
                }

                .cat-pill.active {
                    border-color: var(--gold, #c9a96e);
                    background: var(--warm, #f5ede0);
                    font-weight: 700;
                    box-shadow: 0 3px 12px rgba(201,169,110,0.2);
                    transform: translateY(-1px);
                }

                .cat-count {
                    background: #e8e0d5;
                    color: #2c2825;
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.1rem 0.38rem;
                    border-radius: 20px;
                    min-width: 16px;
                    text-align: center;
                    transition: all 0.2s;
                }

                .cat-pill.active .cat-count {
                    background: var(--gold, #c9a96e);
                    color: #fff;
                }

                .price-filter {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.85rem;
                    max-width: 480px;
                    margin: 0 auto;
                    width: 100%;
                }

                .price-filter-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.72rem;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: var(--char, #2c2825);
                    font-weight: 700;
                    opacity: 0.55;
                }

                .price-range-display {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                }

                .price-badge {
                    background: var(--char, #2c2825);
                    color: var(--cream, #faf7f2);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 700;
                    padding: 0.28rem 0.8rem;
                    border-radius: 20px;
                    letter-spacing: 0.02em;
                }

                .slider-track-container {
                    position: relative;
                    width: 100%;
                    height: 36px;
                    display: flex;
                    align-items: center;
                }

                .slider-track-bg {
                    position: absolute;
                    width: 100%;
                    height: 4px;
                    background: var(--smoke, #e8e0d5);
                    border-radius: 2px;
                }

                input[type="range"].price-thumb {
                    position: absolute;
                    width: 100%;
                    appearance: none;
                    -webkit-appearance: none;
                    background: transparent;
                    pointer-events: none;
                    height: 4px;
                }

                input[type="range"].price-thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--char, #2c2825);
                    border: 3px solid var(--gold, #c9a96e);
                    cursor: pointer;
                    pointer-events: all;
                    box-shadow: 0 2px 8px rgba(44,40,37,0.22);
                    transition: transform 0.15s;
                }

                input[type="range"].price-thumb::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }

                input[type="range"].price-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--char, #2c2825);
                    border: 3px solid var(--gold, #c9a96e);
                    cursor: pointer;
                    pointer-events: all;
                }

                .results-count {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.78rem;
                    color: var(--char, #2c2825);
                    opacity: 0.45;
                    letter-spacing: 0.04em;
                }

                /* ── Product Grid ── */
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 2rem;
                    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 3rem);
                    background: white;
                }

                /* ── Product Card with Fixed Heights ── */
                .product-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: all 0.3s ease;
                }

                .product-card {
                    animation: fadeUp 0.75s ease both;
                }

                .product-card:hover {
                    box-shadow: 0 10px 24px rgba(0,0,0,0.16);
                    transform: translateY(-6px) scale(1.03);
                }

                .shop-header {
                    padding: clamp(2rem, 6vw, 3.2rem) clamp(1rem, 5vw, 3rem);
                    text-align: center;
                    animation: fadeIn 0.9s ease both;
                }

                .shop-header h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2rem, 5vw, 3rem);
                    color: var(--char, #2c2825);
                    margin-bottom: 0.6rem;
                }

                .shop-header p {
                    font-size: clamp(0.95rem, 2vw, 1.08rem);
                    color: var(--muted, #7a6855);
                    max-width: 820px;
                    margin: 0 auto;
                    line-height: 1.75;
                }

                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(18px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* ── Product Image Wrapper ── */
                .product-img-wrapper {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1;
                    overflow: hidden;
                    background: #f5f5f5;
                    flex-shrink: 0;
                }

                .product-like-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.9);
                    border: 1px solid rgba(0,0,0,0.06);
                    cursor: pointer;
                    transition: transform 0.15s, background 0.15s, color 0.15s;
                    flex-shrink: 0;
                }
                .product-like-btn:hover { transform: translateY(-2px); }
                .product-like-btn.liked { background: rgba(255,235,237,0.95); color: #d32f2f; border-color: rgba(211,47,47,0.12); }

                .product-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                .product-card:hover .product-img {
                    transform: scale(1.12);
                }

                /* ── Product Info Section (Flex Grow) ── */
                .product-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    padding: clamp(0.75rem, 2vw, 1.2rem);
                    gap: 0.3rem;
                }

                /* ── Category Label ── */
                .product-category-label {
                    font-size: clamp(0.62rem, 0.9vw, 0.7rem);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--gold, #c9a96e);
                    font-weight: 700;
                    font-family: 'DM Sans', sans-serif;
                    margin-bottom: 0.2rem;
                }

                /* ── Product Name ── */
                .product-name {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(0.95rem, 1.4vw, 1.15rem);
                    font-weight: 700;
                    color: var(--char, #2c2825);
                    line-height: 1.3;
                    margin-bottom: 0.4rem;
                }

                /* ── Price ── */
                .product-price {
                    font-family: 'DM Sans', sans-serif;
                    font-size: clamp(0.85rem, 1.2vw, 1rem);
                    font-weight: 700;
                    color: var(--gold, #c9a96e);
                    margin-bottom: 0.35rem;
                }

                /* ── Rating ── */
                .product-rating {
                    font-family: 'DM Sans', sans-serif;
                    font-size: clamp(0.75rem, 1vw, 0.85rem);
                    color: var(--char, #2c2825);
                    margin-bottom: 0.6rem;
                }

                /* ── Add to Cart Button (Push to Bottom) ── */
                .product-btn {
                    margin-top: auto;
                    width: 100%;
                    padding: clamp(0.6rem, 1.2vw, 0.8rem);
                    background: var(--char, #2c2825);
                    color: var(--cream, #faf7f2);
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: clamp(0.75rem, 1.2vw, 0.85rem);
                    font-weight: 500;
                    transition: background 0.2s;
                    font-family: "'DM Sans', sans-serif";
                    flex-shrink: 0;
                }

                .product-btn:hover {
                    background: var(--gold-dark, #a07840);
                }

                .product-btn-secondary {
                    background: transparent;
                    color: var(--char, #2c2825);
                    border: 1px solid rgba(184,147,106,0.45);
                    transition: background .2s, color .2s;
                }

                .product-btn-secondary:hover {
                    background: #B8936A;
                    color: #fff;
                }

                .product-btn:active,
                .product-btn-secondary:active {
                    transform: scale(0.98);
                }

                /* ── Product tag badge (absolute over image) ── */
                .product-tag-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.62rem;
                    font-weight: 800;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    padding: 0.22rem 0.6rem;
                    border-radius: 20px;
                    z-index: 2;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
                }

                /* ── Empty state ── */
                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 4rem 2rem;
                    font-family: 'DM Sans', sans-serif;
                    color: var(--char, #2c2825);
                    opacity: 0.45;
                }

                .empty-state-icon {
                    font-size: 2.8rem;
                    display: block;
                    margin-bottom: 0.8rem;
                }
            `}</style>

            {/* SHOP HEADER */}
            <div className="shop-header">
                <h1>Our Collection</h1>
                <p>Discover our curated selection of premium candles, diffusers, and fragrance essentials. Each product is handcrafted with love using 100% natural soy wax.</p>
            </div>

            {/* FILTERS */}
            <div className="shop-filters-wrapper">

                {/* Category Pills */}
                <div className="category-pills">
                    {categories.map(cat => {
                        const count = cat.key === 'all'
                            ? allProducts.length
                            : allProducts.filter(p => p.category === cat.key).length;
                        return (
                            <button
                                key={cat.key}
                                className={`cat-pill ${selectedCategory === cat.key ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.key)}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                                <span className="cat-count">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Price Range */}
                <div className="price-filter">
                    <span className="price-filter-label">Price Range</span>

                    <div className="price-range-display">
                        <span className="price-badge">₹{priceRange[0].toLocaleString()}</span>
                        <span className="price-badge">₹{priceRange[1].toLocaleString()}</span>
                    </div>

                    <div className="slider-track-container">
                        <div className="slider-track-bg" />
                        <div style={{
                            position: 'absolute',
                            height: '4px',
                            background: 'linear-gradient(90deg, var(--gold,#c9a96e), #a07840)',
                            borderRadius: '2px',
                            left: `${minPercent}%`,
                            width: `${maxPercent - minPercent}%`,
                        }} />
                        <input type="range" className="price-thumb"
                            min={0} max={MAX_PRICE} step={50}
                            value={priceRange[0]} onChange={handleMinChange}
                            style={{ zIndex: priceRange[0] > MAX_PRICE - 200 ? 5 : 3 }}
                        />
                        <input type="range" className="price-thumb"
                            min={0} max={MAX_PRICE} step={50}
                            value={priceRange[1]} onChange={handleMaxChange}
                            style={{ zIndex: 4 }}
                        />
                    </div>

                    <span className="results-count">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </span>
                </div>

            </div>

            {/* PRODUCT GRID */}
            <div className="product-grid">
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                    <div key={product.id} className="product-card">

                        <div className="product-img-wrapper">
                            <img src={product.img} alt={product.name} className="product-img" />
                            <button
                                className={`product-like-btn ${likedItems.includes(product.id) ? 'liked' : ''}`}
                                aria-label={likedItems.includes(product.id) ? 'Remove like' : 'Like'}
                                onClick={() => toggleLike(product.id, product.name)}
                            >
                                {likedItems.includes(product.id) ? '♥' : '♡'}
                            </button>
                            {product.tag && (
                                <span
                                    className="product-tag-badge"
                                    style={tagStyles[product.tag] || { background: '#2c2825', color: '#fff' }}
                                >
                                    {product.tag}
                                </span>
                            )}
                        </div>

                        <div className="product-info">
                            <div className="product-category-label">{product.category}</div>
                            <div className="product-name">{product.name}</div>
                            <div className="product-price">₹{product.price.toLocaleString()}</div>
                            <div className="product-rating">⭐ {product.rating}</div>
                            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                                <button className="product-btn" onClick={() => addToCart && addToCart(product)} disabled={!user}>
                                    🛒 {user ? 'Add to Cart' : 'Login to add'}
                                </button>
                                <Link to={`/product/${product.id}`} className="product-btn product-btn-secondary">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <span className="empty-state-icon">🕯️</span>
                        <p>Koi product nahi mila is filter mein.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
                            Price range ya category change karein.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;