import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import products from '../data/products';

const Product = ({ addToCart }) => {
    const { id } = useParams();
    const { token: authToken } = useAuth();
    const product = products.find((item) => item.id === Number(id));
    const [imageLoaded, setImageLoaded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [showAddedNotification, setShowAddedNotification] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState([]);
    const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const loadReviewSummary = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/summary`);
            if (!response.ok) {
                setReviewSummary([]);
                return;
            }
            const data = await response.json();
            setReviewSummary(data);
        } catch (error) {
            console.error('Error loading review summary:', error);
            setReviewSummary([]);
        }
    };

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/reviews/product/${id}`);
                if (!response.ok) {
                    setReviews([]);
                    return;
                }
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error('Error loading reviews:', error);
                setReviews([]);
            }
        };

        loadReviews();
        loadReviewSummary();
    }, [id]);

    const formatReviewDate = (value) => {
        try {
            return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return value;
        }
    };

    const formatAverageRating = (rating) => {
        const parsed = Number(rating);
        if (Number.isFinite(parsed)) {
            return parsed.toFixed(1);
        }
        return '-';
    };

    const handleReviewChange = (field, value) => {
        setNewReview((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmitReview = async (event) => {
        event.preventDefault();
        if (!newReview.name.trim() || !newReview.comment.trim()) {
            setReviewError('Please enter your name and feedback.');
            return;
        }

        if (!authToken) {
            setReviewError('Please sign in to post a review.');
            return;
        }

        setReviewError('');
        setReviewSubmitting(true);

        const parseJsonSafely = async (response) => {
            const text = await response.text();
            if (!text) return null;
            try {
                return JSON.parse(text);
            } catch {
                return null;
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/reviews/product/${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify(newReview),
            });

            if (!response.ok) {
                const errorData = await parseJsonSafely(response);
                throw new Error(errorData?.error || 'Unable to submit review');
            }

            const savedReview = await parseJsonSafely(response);
            if (savedReview) {
                setReviews((current) => [savedReview, ...current]);
            }
            setNewReview({ name: '', rating: 5, comment: '' });
            await loadReviewSummary();
        } catch (error) {
            setReviewError(error.message);
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (!product) {
        return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '2rem', color: '#2A1F14', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>Product not found</h2>
                <p style={{ fontSize: '1rem', color: '#7A6855', marginBottom: '2rem' }}>Sorry, we could not find that candle.</p>
                <Link to="/shop" style={{ color: '#B8936A', fontSize: '1rem', textDecoration: 'none', fontWeight: '600', borderBottom: '2px solid #B8936A', paddingBottom: '0.2rem' }}>← Back to shop</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        setShowAddedNotification(true);
        setTimeout(() => setShowAddedNotification(false), 2500);
        setQuantity(1);
    };

    // Replace the relatedProducts logic
    const relatedProducts = (() => {
        const sameCategory = products.filter(
            (p) => p.category === product.category && p.id !== product.id
        );
        const others = products.filter(
            (p) => p.category !== product.category && p.id !== product.id
        );
        return [...sameCategory, ...others].slice(0, 4);
    })();

    const currentProductSummary = reviewSummary.find((item) => item.product_id === product.id) || { review_count: 0, avg_rating: 0 };

    return (
        <div>
            <style>{`
                * { box-sizing: border-box; }

                .product-page {
                    background: linear-gradient(135deg, #FAF6F0 0%, #F0E8DA 100%);
                    min-height: 100vh;
                    padding: clamp(1rem, 5vw, 3rem);
                }

                .product-breadcrumb {
                    max-width: 1400px;
                    margin: 0 auto clamp(2rem, 4vw, 3rem);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.9rem;
                    color: #7A6855;
                    font-family: 'DM Sans', sans-serif;
                }

                .product-breadcrumb a {
                    color: #B8936A;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .product-breadcrumb a:hover {
                    color: #2A1F14;
                }

                .product-panel {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: clamp(2rem, 6vw, 5rem);
                    max-width: 1400px;
                    margin: 0 auto;
                    background: #fff;
                    border-radius: 24px;
                    padding: clamp(2rem, 6vw, 4rem);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
                    animation: panelFadeIn 0.6s ease both;
                }

                @keyframes panelFadeIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .product-image-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .product-image-card {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 4/5;
                    border-radius: 20px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #F5EDE0 0%, #E8DDD0 100%);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-image-card img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0;
                    animation: imageSlideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                @keyframes imageSlideIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .product-image-skeleton {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, #E8DDD0 25%, #F5EDE0 50%, #E8DDD0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .product-image-badge {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: #B8936A;
                    color: #fff;
                    padding: 0.6rem 1.2rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    z-index: 10;
                    box-shadow: 0 8px 20px rgba(184, 147, 106, 0.3);
                }

                .product-thumbnails {
                    display: flex;
                    gap: 0.8rem;
                }

                .thumbnail {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                    opacity: 0.6;
                }

                .thumbnail:hover, .thumbnail.active {
                    opacity: 1;
                    border-color: #B8936A;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-details-column {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: clamp(1.5rem, 3vw, 2.5rem);
                }

                .product-heading {
                    animation: headingFadeIn 0.6s ease both;
                    animation-delay: 0.15s;
                }

                @keyframes headingFadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .product-category {
                    display: inline-block;
                    font-size: 0.75rem;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: #B8936A;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    font-family: 'DM Sans', sans-serif;
                }

                .product-heading h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.8rem, 6vw, 3rem);
                    color: #2A1F14;
                    line-height: 1.2;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .product-heading > p {
                    font-size: 1rem;
                    color: #7A6855;
                    line-height: 1.7;
                    font-weight: 300;
                    font-family: 'DM Sans', sans-serif;
                }

                .product-price-row {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                    padding: 1.5rem 0;
                    border-top: 1px solid #E8DDD0;
                    border-bottom: 1px solid #E8DDD0;
                    animation: pricesFadeIn 0.6s ease both;
                    animation-delay: 0.2s;
                }

                @keyframes pricesFadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .product-price {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2rem, 5vw, 3.5rem);
                    font-weight: 700;
                    color: #A07840;
                    letter-spacing: -0.02em;
                }

                .product-rating {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: #7A6855;
                    font-family: 'DM Sans', sans-serif;
                }

                .product-details-card {
                    background: linear-gradient(135deg, #FAF6F0 0%, #F5EDE0 100%);
                    padding: 2rem;
                    border-radius: 16px;
                    border: 1px solid #E8DDD0;
                    animation: detailsFadeIn 0.6s ease both;
                    animation-delay: 0.3s;
                }

                @keyframes detailsFadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .product-details-header {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.3rem;
                    color: #2A1F14;
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                }

                .product-features {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .product-features li {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.95rem;
                    color: #7A6855;
                    line-height: 1.6;
                    font-family: 'DM Sans', sans-serif;
                }

                .product-features span {
                    color: #B8936A;
                    font-weight: 700;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .quantity-selector {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.2rem;
                    background: #FAF6F0;
                    border-radius: 12px;
                    width: fit-content;
                }

                .qty-label {
                    font-size: 0.85rem;
                    color: #7A6855;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    font-weight: 600;
                    font-family: 'DM Sans', sans-serif;
                }

                .qty-btn {
                    width: 36px;
                    height: 36px;
                    border: 1.5px solid #E8DDD0;
                    background: #fff;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1.1rem;
                    color: #2A1F14;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                }

                .qty-btn:hover {
                    background: #B8936A;
                    color: #fff;
                    border-color: #B8936A;
                }

                .qty-btn:active {
                    transform: scale(0.95);
                }

                .qty-input {
                    width: 50px;
                    height: 36px;
                    border: 1.5px solid #E8DDD0;
                    background: #fff;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 1rem;
                    color: #2A1F14;
                    font-weight: 600;
                    font-family: 'DM Sans', sans-serif;
                }

                .qty-input:focus {
                    outline: none;
                    border-color: #B8936A;
                    box-shadow: 0 0 0 3px rgba(184, 147, 106, 0.1);
                }

                .product-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    animation: actionsFadeIn 0.6s ease both;
                    animation-delay: 0.4s;
                }

                @keyframes actionsFadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .btn-primary {
                    padding: 1rem 2rem;
                    background: #2A1F14;
                    color: #FAF6F0;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: 'DM Sans', sans-serif;
                    box-shadow: 0 8px 24px rgba(42, 31, 20, 0.15);
                }

                .btn-primary:hover {
                    background: #B8936A;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(184, 147, 106, 0.25);
                }

                .btn-primary:active {
                    transform: translateY(0);
                }

                .btn-outline {
                    padding: 1rem 2rem;
                    background: transparent;
                    color: #2A1F14;
                    border: 2px solid #E8DDD0;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: 'DM Sans', sans-serif;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                }

                .btn-outline:hover {
                    border-color: #B8936A;
                    color: #B8936A;
                }

                .notification {
                    position: fixed;
                    top: 80px;
                    right: 2rem;
                    background: #2A1F14;
                    color: #FAF6F0;
                    padding: 1.2rem 1.8rem;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.95rem;
                    z-index: 1000;
                    animation: notificationSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                @keyframes notificationSlide {
                    from { opacity: 0; transform: translateX(400px); }
                    to { opacity: 1; transform: translateX(0); }
                }

/* ═══════════════════════════════════
   CUSTOMER FEEDBACK - MAIN PRODUCT
   ═══════════════════════════════════ */

.feedback-wrap {
    max-width: 1400px;
    margin: 5rem auto 3rem;
    background: linear-gradient(135deg, rgba(250, 246, 240, 0.5), rgba(255, 252, 248, 0.8));
    border-radius: 28px;
    padding: clamp(2rem, 5vw, 3.5rem);
}

.feedback-header-main {
    text-align: center;
    margin-bottom: clamp(3rem, 6vw, 4rem);
}

.feedback-title-main {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    color: #2A1F14;
    margin-bottom: 0.8rem;
    font-weight: 700;
}

.feedback-subtitle-main {
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    color: #7A6855;
    letter-spacing: 0.3px;
}

.feedback-wrapper-main {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: clamp(2rem, 4vw, 3.5rem);
    max-width: 1400px;
    margin: 0 auto;
}

/* REVIEWS SECTION */
.reviews-section-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-title-main {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.4rem, 2.5vw, 1.8rem);
    color: #2A1F14;
    margin-bottom: 0.5rem;
}

.reviews-grid-main {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    align-content: start;
}

.review-card-main {
    background: white;
    border-radius: 20px;
    padding: 1.8rem;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.07);
    border: 1px solid rgba(201, 169, 110, 0.1);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.review-card-main:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 42px rgba(0, 0, 0, 0.12);
    border-color: rgba(201, 169, 110, 0.3);
}

.review-header-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.reviewer-info-main {
    flex: 1;
}

.reviewer-name-main {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    color: #2A1F14;
    margin: 0;
    font-weight: 600;
}

.review-product-main {
    font-size: 0.85rem;
    color: #B8936A;
    margin: 0.3rem 0 0 0;
    font-weight: 500;
}

.review-date-main {
    font-size: 0.8rem;
    color: rgba(139, 123, 112, 0.6);
    white-space: nowrap;
}

.review-rating-main {
    display: flex;
    gap: 0.2rem;
    font-size: 1.1rem;
    color: #c9a96e;
    letter-spacing: 1px;
}

.review-text-main {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #7A6855;
    margin: 0;
}

/* EMPTY STATE */
.feedback-empty-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: white;
    border-radius: 20px;
    border: 1.5px dashed #D4C4AF;
    min-height: 300px;
    grid-column: 1 / -1;
}

.feedback-empty-icon-main {
    font-size: 3.5rem;
    margin-bottom: 1.2rem;
    opacity: 0.7;
}

.feedback-empty-title-main {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    color: #2A1F14;
    margin: 0 0 0.6rem;
    font-weight: 600;
}

.feedback-empty-msg-main {
    font-size: 0.95rem;
    color: #7A6855;
    max-width: 280px;
    line-height: 1.6;
    margin: 0;
}

/* FORM SECTION */
.form-section-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-card-main {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.07);
    border: 1px solid rgba(201, 169, 110, 0.1);
}

.form-header-main {
    margin-bottom: 1.8rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(201, 169, 110, 0.15);
}

.form-title-main {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: #2A1F14;
    margin: 0 0 0.5rem 0;
}

.form-subtitle-main {
    font-size: 0.9rem;
    color: #7A6855;
    margin: 0;
}

.form-group-main {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.form-group-main label {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2A1F14;
}

.form-input-main,
.form-textarea-main {
    border: 1.5px solid rgba(184, 147, 106, 0.25);
    border-radius: 12px;
    padding: 0.9rem 1.1rem;
    font-size: 0.95rem;
    font-family: inherit;
    background: #fbf7f0;
    color: #2A1F14;
    transition: all 0.2s ease;
}

.form-input-main:focus,
.form-textarea-main:focus {
    outline: none;
    border-color: #c9a96e;
    background: white;
    box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.1);
}

.form-textarea-main {
    resize: vertical;
    min-height: 110px;
}

.rating-selector-main {
    display: flex;
    gap: 0.8rem;
}

.rating-btn-main {
    width: 45px;
    height: 45px;
    border: 1.5px solid rgba(184, 147, 106, 0.25);
    background: #fbf7f0;
    border-radius: 10px;
    font-size: 1.5rem;
    cursor: pointer;
    color: rgba(201, 169, 110, 0.4);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.rating-btn-main:hover {
    border-color: #c9a96e;
    color: #c9a96e;
}

.rating-btn-main.active {
    background: #c9a96e;
    color: white;
    border-color: #c9a96e;
}

.submit-btn-main {
    background: #2A1F14;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
}

.submit-btn-main:hover:not(:disabled) {
    background: #c9a96e;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(201, 169, 110, 0.25);
}

.submit-btn-main:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.feedback-error-main {
    background: #fff0f0;
    color: #9d2a2a;
    border: 1px solid #f5c4c4;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-size: 0.88rem;
    margin-bottom: 1.2rem;
}

/* STATS CARD */
.stats-card-main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    text-align: center;
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.07);
    border: 1px solid rgba(201, 169, 110, 0.1);
}

.stat-main {
    padding: 1.5rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(250, 246, 240, 0.5), rgba(255, 252, 248, 0.8));
    border: 1px solid rgba(201, 169, 110, 0.1);
}

.stat-number-main {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    color: #c9a96e;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.stat-label-main {
    font-size: 0.9rem;
    color: #7A6855;
    font-weight: 500;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
    .feedback-wrapper-main {
        grid-template-columns: 1fr;
    }

    .reviews-grid-main {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .stats-card-main {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .reviews-grid-main {
        grid-template-columns: 1fr;
    }

    .rating-selector-main {
        gap: 0.5rem;
    }

    .rating-btn-main {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
    }

    .stats-card-main {
        grid-template-columns: 1fr;
    }
}

                .related-top {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                }

                .related-title {
                    font-size: 2rem;
                    margin: 0;
                    letter-spacing: 0.04em;
                    color: #2A1F14;
                }

                .related-subtitle {
                    margin: 0;
                    font-size: 1rem;
                    color: #7A6855;
                    line-height: 1.7;
                    max-width: 630px;
                }

                .related-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 2.5rem;
                    margin-top: 0.5rem;
                    animation: gridFadeIn 0.8s ease both;
                }

                @keyframes gridFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .related-card-link {
                    text-decoration: none;
                    animation: cardSlideUp 0.6s ease both;
                }

                .related-card-link:nth-child(1) { animation-delay: 0.1s; }
                .related-card-link:nth-child(2) { animation-delay: 0.15s; }
                .related-card-link:nth-child(3) { animation-delay: 0.2s; }
                .related-card-link:nth-child(4) { animation-delay: 0.25s; }

                @keyframes cardSlideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .related-card {
                    border-radius: 18px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    background: #fff;
                    border: 1.5px solid #E8DDD0;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
                }

                .related-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.15);
                    border-color: #B8936A;
                    z-index: 1;
                }

                .related-card-img {
                    width: 100%;
                    height: 300px;
                    background: linear-gradient(135deg, #F5EDE0 0%, #E8DDD0 100%);
                    overflow: hidden;
                    position: relative;
                }

                .related-card-img::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent 0%, rgba(42, 31, 20, 0.08) 100%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }

                .related-card:hover .related-card-img::after {
                    opacity: 1;
                }

                .related-card-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .related-card:hover .related-card-img img {
                    transform: scale(1.15);
                }

                .related-card-content {
                    padding: 2rem 1.8rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    flex-grow: 1;
                    justify-content: space-between;
                }

                .related-card-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.2rem;
                    color: #2A1F14;
                    font-weight: 600;
                    line-height: 1.4;
                    letter-spacing: 0.02em;
                    transition: color 0.3s ease;
                }

                .related-card:hover .related-card-name {
                    color: #B8936A;
                }

                .related-card-price {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    color: #A07840;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    transition: color 0.3s ease;
                }

                .related-card:hover .related-card-price {
                    color: #B8936A;
                }

@media (max-width: 1400px) {
    .related-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
}

                @media (max-width: 1024px) {
                    .product-panel {
                        grid-template-columns: 1fr;
                    }

                    .related-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .product-panel {
                        padding: 1.5rem;
                        gap: 2rem;
                    }

                    .product-image-card {
                        aspect-ratio: 3/4;
                    }

                    .product-heading h1 {
                        font-size: 1.8rem;
                    }

                    .product-price {
                        font-size: 2rem;
                    }

                    .product-actions {
                        flex-direction: column;
                    }

                    .btn-primary, .btn-outline {
                        width: 100%;
                    }

                    .notification {
                        left: 1rem;
                        right: 1rem;
                    }

                    .related-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .related-card-img {
                        height: 250px;
                    }
                }
            `}</style>

            <div className="product-page">
                {/* Main Product Panel */}
                <div className="product-panel">
                    {/* Image Section */}
                    <div className="product-image-section">
                        <div className="product-image-card">
                            {!imageLoaded && <div className="product-image-skeleton" />}
                            <img
                                src={product.img}
                                alt={product.name}
                                onLoad={() => setImageLoaded(true)}
                                style={{ display: imageLoaded ? 'block' : 'none' }}
                            />
                            <div className="product-image-badge">Premium Quality</div>
                        </div>

                        {/* Thumbnails */}
                        <div className="product-thumbnails">
                            {[product.img, product.img, product.img].map((img, idx) => (
                                <div key={idx} className={`thumbnail ${idx === 0 ? 'active' : ''}`}>
                                    <img src={img} alt={`View ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="product-details-column">
                        {/* Heading */}
                        <div className="product-heading">
                            <span className="product-category">{product.category}</span>
                            <h1>{product.name}</h1>
                            <p>{product.description}</p>
                        </div>

                        {/* Price & Rating */}
                        <div className="product-price-row">
                            <div className="product-price">₹{product.price.toLocaleString('en-IN')}</div>
                            <div className="product-rating">⭐ {product.rating} / 5</div>
                        </div>

                        {/* Features */}
                        <div className="product-details-card">
                            <div className="product-details-header">Why you'll love it</div>
                            <ul className="product-features">
                                {product.details.map((line, index) => (
                                    <li key={index}>
                                        <span>•</span>
                                        <p>{line}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quantity Selector */}
                        <div className="quantity-selector">
                            <span className="qty-label">Quantity</span>
                            <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                            <input type="number" className="qty-input" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                            <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button className="btn-primary" onClick={handleAddToCart}>
                                🛒 Add to Cart
                            </button>
                            <Link className="btn-outline" to="/shop">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>


                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <div className="related-top">
                            <h2 className="related-title">You Might Also Like</h2>
                            <p className="related-subtitle">Explore other premium fragrances from our curated collection</p>
                        </div>

                        <div className="related-grid">
                            {relatedProducts.map((relProduct) => (
                                <Link key={relProduct.id} to={`/product/${relProduct.id}`} className="related-card-link">
                                    <div className="related-card">
                                        <div className="related-card-img">
                                            <img src={relProduct.img} alt={relProduct.name} />
                                        </div>
                                        <div className="related-card-content">
                                            <div className="related-card-name">{relProduct.name}</div>
                                            <div className="related-card-price">₹{relProduct.price.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── CUSTOMER FEEDBACK SECTION ── */}
            <div className="feedback-wrap">
                {/* HEADER */}
                <div className="feedback-header-main">
                    <h2 className="feedback-title-main">Customer Stories</h2>
                    <p className="feedback-subtitle-main">Real experiences from people who love Mahasu</p>
                </div>

                <div className="feedback-wrapper-main">
                    {/* REVIEWS SECTION */}
                    <div className="reviews-section-main">
                        <h3 className="section-title-main">Recent Reviews</h3>
                        <div className="reviews-grid-main">
                            {reviews.length === 0 ? (
                                <div className="feedback-empty-main">
                                    <div className="feedback-empty-icon-main">💭</div>
                                    <p className="feedback-empty-title-main">No reviews yet</p>
                                    <p className="feedback-empty-msg-main">Be the first to share your experience with this beautiful candle.</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="review-card-main">
                                        <div className="review-header-main">
                                            <div className="reviewer-info-main">
                                                <h4 className="reviewer-name-main">{review.name}</h4>
                                                <p className="review-product-main">Verified Purchase</p>
                                            </div>
                                            <div className="review-date-main">{formatReviewDate(review.created_at)}</div>
                                        </div>

                                        <div className="review-rating-main">
                                            {'★'.repeat(Number(review.rating))}
                                        </div>

                                        <p className="review-text-main">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* FORM SECTION */}
                    <div className="form-section-main">
                        <div className="form-card-main">
                            <div className="form-header-main">
                                <h3 className="form-title-main">Share Your Experience</h3>
                                <p className="form-subtitle-main">Help others discover Mahasu magic</p>
                            </div>

                            {reviewError && <div className="feedback-error-main">{reviewError}</div>}

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitReview(e); }}>
                                <div className="form-group-main">
                                    <label>Your Name *</label>
                                    <input
                                        type="text"
                                        value={newReview.name}
                                        onChange={(e) => handleReviewChange('name', e.target.value)}
                                        placeholder="e.g. Priya S."
                                        className="form-input-main"
                                    />
                                </div>

                                <div className="form-group-main">
                                    <label>Rating *</label>
                                    <div className="rating-selector-main">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className={`rating-btn-main ${newReview.rating >= star ? 'active' : ''}`}
                                                onClick={() => handleReviewChange('rating', star)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group-main">
                                    <label>Your Review *</label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => handleReviewChange('comment', e.target.value)}
                                        placeholder="What did you love about it?"
                                        className="form-textarea-main"
                                        rows={4}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn-main"
                                    disabled={reviewSubmitting}
                                >
                                    {reviewSubmitting ? 'Posting...' : 'Post Review'}
                                </button>
                            </form>
                        </div>

                        {/* STATS */}
                        <div className="stats-card-main">
                            <div className="stat-main">
                                <div className="stat-number-main">{reviews.length}</div>
                                <div className="stat-label-main">Reviews</div>
                            </div>
                            <div className="stat-main">
                                <div className="stat-number-main">
                                    {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1) : '-'}
                                </div>
                                <div className="stat-label-main">Avg Rating</div>
                            </div>
                            <div className="stat-main">
                                <div className="stat-number-main">100%</div>
                                <div className="stat-label-main">Recommended</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Notification */}
            {showAddedNotification && (
                <div className="notification">
                    ✓ Added {quantity} item{quantity > 1 ? 's' : ''} to cart!
                </div>
            )}
        </div>
    );
};

export default Product;