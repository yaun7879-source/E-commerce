import React, { useState, useEffect } from 'react';
import './BestsellerCarousel.css';

const BestsellerCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const products = [
        {
            id: 1,
            name: 'Lavender Dreams',
            category: 'Relaxation',
            price: '₹449',
            originalPrice: '₹599',
            image: 'https://images.unsplash.com/photo-1615634260174-4ae98e44dc6d?w=500&h=500&fit=crop',
            badge: 'Best Seller',
            rating: 4.8,
            reviews: 324,
            description: 'Handcrafted soy candle with pure lavender essential oil'
        },
        {
            id: 2,
            name: 'Rose Garden',
            category: 'Romantic',
            price: '₹449',
            originalPrice: '₹599',
            image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop',
            badge: 'Most Loved',
            rating: 4.9,
            reviews: 412,
            description: 'Premium rose petal blend with hints of sandalwood'
        },
        {
            id: 3,
            name: 'Citrus Burst',
            category: 'Fresh',
            price: '₹349',
            originalPrice: '₹499',
            image: 'https://images.unsplash.com/photo-1599599810694-e5d34a9a4fad?w=500&h=500&fit=crop',
            badge: 'New Launch',
            rating: 4.7,
            reviews: 156,
            description: 'Energizing blend of lemon, orange & bergamot'
        },
        {
            id: 4,
            name: 'Vanilla Luxe',
            category: 'Comfort',
            price: '₹449',
            originalPrice: '₹599',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
            badge: 'Best Seller',
            rating: 4.8,
            reviews: 298,
            description: 'Rich Madagascar vanilla with creamy sandalwood'
        },
        {
            id: 5,
            name: 'Ocean Breeze',
            category: 'Fresh',
            price: '₹399',
            originalPrice: '₹549',
            image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop',
            badge: 'Trending',
            rating: 4.6,
            reviews: 201,
            description: 'Cool sea salt & driftwood scent for modern spaces'
        },
        {
            id: 6,
            name: 'Spice Warmth',
            category: 'Oriental',
            price: '₹469',
            originalPrice: '₹649',
            image: 'https://images.unsplash.com/photo-1596082927640-36ab4f6f4acd?w=500&h=500&fit=crop',
            badge: 'Luxury',
            rating: 4.9,
            reviews: 187,
            description: 'Exotic spices with amber & musk for evening ambiance'
        }
    ];

    // Mobile: show 1 product, Tablet: show 2, Desktop: show 3
    const getVisibleCount = () => {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    };

    const [visibleCount, setVisibleCount] = useState(getVisibleCount());

    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 768;
            setIsMobile(newIsMobile);
            setVisibleCount(getVisibleCount());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlay) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % (products.length - visibleCount + 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlay, visibleCount, products.length]);

    const handlePrev = () => {
        setIsAutoPlay(false);
        setCurrentIndex((prev) => (prev - 1 + products.length - visibleCount + 1) % (products.length - visibleCount + 1));
    };

    const handleNext = () => {
        setIsAutoPlay(false);
        setCurrentIndex((prev) => (prev + 1) % (products.length - visibleCount + 1));
    };

    const handleDotClick = (index) => {
        setIsAutoPlay(false);
        setCurrentIndex(index);
    };

    const maxDots = products.length - visibleCount + 1;
    const translateAmount = (currentIndex * 100) / visibleCount;

    return (
        <div className="bestseller-wrapper">
            {/* Header */}
            <div className="bestseller-header">
                <div className="header-content">
                    <h2 className="bestseller-heading">
                        Our <span className="highlight">Best Sellers</span>
                    </h2>
                    <p className="bestseller-subtext">
                        Discover the scents loved by thousands. Premium quality, long-lasting fragrance.
                    </p>
                </div>
                <div className="header-badge">⭐ Trusted by 10K+ Customers</div>
            </div>

            {/* Main Carousel */}
            <div className="carousel-container">
                <div className="carousel-track-wrapper">
                    <div
                        className="carousel-track"
                        style={{
                            transform: `translateX(-${translateAmount}%)`,
                        }}
                    >
                        {products.map((product, index) => (
                            <div key={product.id} className="product-slide" style={{ width: `${100 / visibleCount}%` }}>
                                <div className="product-card">
                                    {/* Badge */}
                                    {product.badge && (
                                        <div className={`product-badge badge-${product.badge.toLowerCase().replace(' ', '-')}`}>
                                            {product.badge}
                                        </div>
                                    )}

                                    {/* Image Container */}
                                    <div className="product-image-container">
                                        <img src={product.image} alt={product.name} className="product-image" />
                                        <div className="image-overlay"></div>
                                        <button className="add-to-cart">Add to Cart</button>
                                    </div>

                                    {/* Content */}
                                    <div className="product-content">
                                        <p className="product-category">{product.category}</p>
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-description">{product.description}</p>

                                        {/* Rating */}
                                        <div className="product-rating">
                                            <div className="stars">{'★'.repeat(Math.floor(product.rating))}☆</div>
                                            <span className="rating-text">{product.rating} ({product.reviews})</span>
                                        </div>

                                        {/* Price */}
                                        <div className="product-price-section">
                                            <span className="product-price">{product.price}</span>
                                            <span className="product-original-price">{product.originalPrice}</span>
                                            <span className="discount">
                                                {Math.round(((parseInt(product.originalPrice) - parseInt(product.price)) / parseInt(product.originalPrice)) * 100)}% OFF
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button className="carousel-arrow prev-arrow" onClick={handlePrev} aria-label="Previous">
                    ‹
                </button>
                <button className="carousel-arrow next-arrow" onClick={handleNext} aria-label="Next">
                    ›
                </button>
            </div>

            {/* Dots Navigation */}
            <div className="carousel-dots">
                {Array.from({ length: maxDots }).map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => handleDotClick(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="feature">
                    <div className="feature-icon">🕯️</div>
                    <h4>100% Natural Soy</h4>
                    <p>Eco-friendly & sustainable</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">🌿</div>
                    <h4>Pure Essential Oils</h4>
                    <p>No synthetic fragrances</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">⏱️</div>
                    <h4>Long Lasting</h4>
                    <p>40+ hours burn time</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">🎁</div>
                    <h4>Gift Ready</h4>
                    <p>Premium packaging included</p>
                </div>
            </div>
        </div>
    );
};

export default BestsellerCarousel;