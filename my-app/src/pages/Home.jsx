import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [bestsellerSlide, setBestsellerSlide] = useState(0);
    const [activeMood, setActiveMood] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [activeScentIdx, setActiveScentIdx] = useState(null);
    const [showVideo, setShowVideo] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [allReviews, setAllReviews] = useState([]);
    const [loadingAllReviews, setLoadingAllReviews] = useState(false);
    const videoRef = useRef(null);
    const bsTimerRef = useRef(null);

    const images = {
        hero1: '/images/hero1.png',
        hero2: '/images/hero2.png',
        hero3: '/images/hero3.png',
        prod1: '/images/product1.png',
        prod2: '/images/story.png',
        prod3: '/images/product2.png',
        prod4: '/images/product6.png',
        prod5: '/images/product4.png',
        prod6: '/images/category3.png',
        prod7: '/images/product7.png',
        prod8: '/images/product8.png',
        prod9: '/images/product9.png',
        prod10: '/images/product10.png',
        prod11: '/images/product11.png',
        story: '/images/story.png',
        prod12: '/images/category4.png',
        prod13: '/images/product12.png',
        prod14: '/images/category1.png',
        prod15: '/images/product15.png',
    };

    const bestsellers = [
        { name: 'Rose Heart Tealights', desc: 'Set of 9 — Perfect for romantic & festive settings', img: images.prod11, price: '₹349', tag: 'Trending', category: 'Tealights' },
        { name: 'Crystal LED Tealights', desc: 'Set of 6 — Safe, smokeless & long-lasting glow', img: images.prod10, price: '₹699', tag: 'Diwali Pick', category: 'Tealights' },
        { name: 'Mahasu Frankincense Jar', desc: '8-hour burn time — Smokeless & clean fragrance', img: images.prod5, price: '₹599', tag: '8 Hr Burn', category: 'Jar Candles' },
        { name: '"Love" Rose Carved Candle Duo', desc: 'Artisan carved pillar — Ivory & red set', img: images.prod2, price: '₹1199', tag: 'Bestseller', category: 'Pillar Candles' },
        { name: 'Bubble Heart Candle', desc: 'Luxury artisan cube — Red & ivory handcrafted pair', img: images.prod3, price: '₹849', tag: 'Artisan', category: 'Luxury' },
    ];

    const signatureScents = [
        { name: 'Lavender &\nSandalwood', img: images.prod7, note: 'Calming · Floral', color: '#7c5cbf' },
        { name: 'Rose & Lily', img: images.prod11, note: 'Romantic · Fresh', color: '#c9607a' },
        { name: 'Vanilla &\nCoconut', img: images.prod8, note: 'Warm · Sweet', color: '#c9a96e' },
        { name: 'Temple Bloom\n& Mint', img: images.prod9, note: 'Sacred · Refreshing', color: '#4a9e7a' },
        { name: 'Deodar &\nMahogany', img: images.prod10, note: 'Woody · Earthy', color: '#8b6347' },
    ];

    const moodCategories = [
        { mood: 'Romantic', emoji: '🌹', desc: 'Soft, warm & intimate', color: '#c0392b', gradient: 'linear-gradient(135deg,#c0392b22,#e8a0a022)', border: '#c0392b40', shopCategory: 'Tealights', image: images.prod6, products: ['Rose Heart Tealights', '"Love" Rose Carved Candle Duo', 'Romantic Rose Gift Set'], count: 3 },
        { mood: 'Festive', emoji: '✨', desc: 'Bright, joyful & celebratory', color: '#c9a96e', gradient: 'linear-gradient(135deg,#c9a96e22,#f5e6c822)', border: '#c9a96e50', shopCategory: 'Tealights', image: images.hero3, products: ['Crystal LED Tealights', 'Diwali Candle Gift Box', 'Rainbow Gel Candle Set'], count: 3 },
        { mood: 'Relaxation', emoji: '🧘', desc: 'Calm, soothing & peaceful', color: '#5a8a72', gradient: 'linear-gradient(135deg,#5a8a7222,#a8d5bf22)', border: '#5a8a7240', shopCategory: 'Jar Candles', image: images.prod15, products: ['Mahasu Lavender Vanilla Jar', 'French Lavender Pillar', 'Mahasu Sandalwood Jar'], count: 3 },
        { mood: 'Devotion', emoji: '🪔', desc: 'Sacred, spiritual & pure', color: '#e67e22', gradient: 'linear-gradient(135deg,#e67e2222,#fde9ca22)', border: '#e67e2240', shopCategory: 'Pillar Candles', image: images.prod12, products: ['Rose Carved Pillar Duo', '"Love" Rose Carved Duo', 'Diwali Candle Gift Box'], count: 3 },
        { mood: 'Luxury', emoji: '👑', desc: 'Opulent, rich & artisan', color: '#7d3c98', gradient: 'linear-gradient(135deg,#7d3c9822,#d7bde222)', border: '#7d3c9840', shopCategory: 'Luxury', image: images.prod14, products: ['Bubble Heart Candle — Red', 'Bubble Heart Candle — Ivory', 'Mahasu Frankincense Jar'], count: 3 },
        { mood: 'Gifting', emoji: '🎁', desc: 'Curated, elegant & special', color: '#2471a3', gradient: 'linear-gradient(135deg,#2471a322,#aed6f122)', border: '#2471a340', shopCategory: 'Gift Sets', image: images.prod1, products: ['Diwali Candle Gift Box', 'Romantic Rose Gift Set', 'Mahasu Scented Jar Set'], count: 2 },
    ];

    const tagColors = {
        'Trending': '#c9a96e',
        'Diwali Pick': '#c0392b',
        '8 Hr Burn': '#2471a3',
        'Bestseller': '#2c2825',
        'Artisan': '#8b6f47',
    };

    useEffect(() => {
        const t = setInterval(() => setCurrentSlide(p => (p + 1) % 3), 4500);
        return () => clearInterval(t);
    }, []);

    const startBsTimer = () => {
        clearInterval(bsTimerRef.current);
        bsTimerRef.current = setInterval(() => {
            if (!isPaused) setBestsellerSlide(p => (p + 1) % bestsellers.length);
        }, 3200);
    };

    useEffect(() => {
        startBsTimer();
        return () => clearInterval(bsTimerRef.current);
    }, [isPaused]);

    const moveBs = (dir) => {
        setBestsellerSlide(p => (p + dir + bestsellers.length) % bestsellers.length);
        startBsTimer();
    };

    const moveSlide = (dir) => setCurrentSlide(p => (p + dir + 3) % 3);
    const goSlide = (idx) => setCurrentSlide(idx);

    const closeVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setShowVideo(false);
    };

    const formatReviewDate = (value) => {
        try {
            return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return value;
        }
    };

    const loadAllReviews = async () => {
        setLoadingAllReviews(true);
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) {
                setAllReviews([]);
                return;
            }
            const data = await response.json();
            setAllReviews(data);
        } catch (error) {
            console.error('Error loading all reviews:', error);
            setAllReviews([]);
        } finally {
            setLoadingAllReviews(false);
        }
    };

    const toggleAllReviews = async () => {
        const nextState = !showAllReviews;
        if (nextState && allReviews.length === 0) {
            await loadAllReviews();
        }
        setShowAllReviews(nextState);
    };

    const slides = [
        { h1: 'Fill your space', h1_em: 'with memory.', sub: 'Handcrafted soy wax candles — every scent tells a story.' },
        { h1: 'Pure calm,', h1_em: 'bottled in wax.', sub: 'Natural lavender blends for peaceful evenings and mindful moments.' },
        { h1: 'Give the gift', h1_em: 'of fragrance.', sub: 'Curated luxury gift sets for every occasion — Diwali, birthdays & more.' },
    ];

    const reviews = [
        { stars: '★★★★★', text: '"I put just one in my living room and it filled the entire downstairs with a wonderful, long-lasting aroma."', author: '— Priya M., Delhi' },
        { stars: '★★★★★', text: '"Every Diwali we buy candles from their store — always appreciate their quality control and fragrances."', author: '— Ramesh K., Mumbai' },
        { stars: '★★★★★', text: '"These aroma candles lift up any mood instantly. The packaging was gorgeous — a perfect gift right out of the box."', author: '— Ananya S., Bengaluru' },
    ];

    const activeMoodData = activeMood !== null ? moodCategories[activeMood] : null;

    return (
        <div>
            <style>{`
                .bs-section {
                    background: var(--char, #2c2825);
                    padding: clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 3rem);
                    overflow: hidden;
                }

                .bs-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    text-align: center;
                    margin-bottom: clamp(2rem, 4vw, 3rem);
                    gap: 1rem;
                }

                .bs-header-left h2 {
                    font-family: 'Playfair Display', 'Georgia', serif;
                    font-size: clamp(1.8rem, 4vw, 2.8rem);
                    color: var(--cream, #faf7f2);
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    margin: 0 0 0.3rem;
                }

                .bs-header-left p {
                    font-family: 'DM Sans', sans-serif;
                    color: rgba(250,247,242,0.5);
                    font-size: clamp(0.8rem, 1.4vw, 0.92rem);
                    margin: 0;
                }

                .bs-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }

                .bs-ctrl-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(250,247,242,0.08);
                    border: 1.5px solid rgba(250,247,242,0.18);
                    color: var(--cream, #faf7f2);
                    font-size: 1.4rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.22s ease;
                    font-family: 'DM Sans', sans-serif;
                    line-height: 1;
                    flex-shrink: 0;
                }

                .bs-ctrl-btn:hover {
                    background: var(--gold, #c9a96e);
                    border-color: var(--gold, #c9a96e);
                    color: #2c2825;
                    transform: scale(1.08);
                }

                .bs-ctrl-btn:active { transform: scale(0.94); }

                .bs-auto-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.38rem 0.9rem;
                    border-radius: 50px;
                    border: 1px solid rgba(250,247,242,0.18);
                    background: transparent;
                    color: rgba(250,247,242,0.55);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.7rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .bs-auto-pill:hover { border-color: var(--gold, #c9a96e); color: var(--gold, #c9a96e); }
                .bs-auto-pill.paused { color: rgba(250,247,242,0.35); }

                .bs-auto-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: var(--gold, #c9a96e);
                    transition: background 0.3s;
                }
                .bs-auto-pill.paused .bs-auto-dot { background: rgba(250,247,242,0.3); }

                .bs-viewport {
                    position: relative;
                    overflow: hidden;
                    border-radius: 18px;
                    max-width: 860px;
                    margin: 0 auto;
                }

                .bs-track {
                    display: flex;
                    transition: transform 0.52s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: transform;
                }

                .bs-card-new {
                    min-width: 100%;
                    display: flex;
                    align-items: stretch;
                    background: var(--warm, #f5ede0);
                    border-radius: 18px;
                    overflow: hidden;
                }

                .bs-img-side {
                    width: 44%;
                    flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                }

                .bs-img-side img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.55s ease;
                }
                .bs-card-new:hover .bs-img-side img { transform: scale(1.05); }

                .bs-tag-badge {
                    position: absolute;
                    top: 14px; left: 14px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.62rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    padding: 0.22rem 0.7rem;
                    border-radius: 20px;
                    color: #fff;
                    z-index: 2;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
                }

                .bs-content-side {
                    flex: 1;
                    padding: clamp(1.8rem, 4vw, 3rem);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 0.55rem;
                }

                .bs-big-num {
                    font-family: 'Playfair Display', 'Georgia', serif;
                    font-size: clamp(3.5rem, 8vw, 5.5rem);
                    font-weight: 700;
                    color: var(--smoke, #e8e0d5);
                    line-height: 1;
                    letter-spacing: -0.02em;
                    transition: color 0.3s;
                }
                .bs-card-new:hover .bs-big-num { color: rgba(201,169,110,0.35); }

                .bs-cat-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: var(--gold, #c9a96e);
                    font-weight: 700;
                    margin: -0.2rem 0 0;
                }

                .bs-prod-name {
                    font-family: 'Playfair Display', 'Georgia', serif;
                    font-size: clamp(1.1rem, 2.5vw, 1.7rem);
                    font-weight: 700;
                    color: var(--char, #2c2825);
                    line-height: 1.2;
                    transition: color 0.3s;
                }
                .bs-card-new:hover .bs-prod-name { color: #5a3e20; }

                .bs-desc {
                    font-family: 'DM Sans', sans-serif;
                    font-size: clamp(0.75rem, 1.3vw, 0.88rem);
                    color: var(--char, #2c2825);
                    opacity: 0.58;
                    line-height: 1.55;
                }

                .bs-price {
                    font-family: 'DM Sans', sans-serif;
                    font-size: clamp(1.1rem, 2.2vw, 1.35rem);
                    font-weight: 800;
                    color: var(--gold-dark, #a07840);
                    margin: 0.1rem 0;
                }

                .bs-action-row {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-top: 0.4rem;
                    flex-wrap: wrap;
                }

                .bs-add-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.68rem 1.5rem;
                    background: var(--char, #2c2825);
                    color: var(--cream, #faf7f2);
                    border: none;
                    border-radius: 50px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.22s ease;
                    letter-spacing: 0.02em;
                }
                .bs-add-btn:hover {
                    background: var(--gold, #c9a96e);
                    color: #2c2825;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(201,169,110,0.32);
                }
                .bs-add-btn:active { transform: scale(0.97); }

                .bs-progress-wrap {
                    max-width: 860px;
                    margin: 1.2rem auto 0;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .bs-progress-bar {
                    flex: 1;
                    height: 2px;
                    background: rgba(250,247,242,0.1);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .bs-progress-fill {
                    height: 100%;
                    background: var(--gold, #c9a96e);
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }

                .bs-slide-counter {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.72rem;
                    color: rgba(250,247,242,0.4);
                    letter-spacing: 0.06em;
                    flex-shrink: 0;
                }

                .bs-dots-row {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .bs-dot-new {
                    height: 3px;
                    border-radius: 3px;
                    background: rgba(250,247,242,0.2);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    padding: 0;
                    width: 20px;
                }
                .bs-dot-new.active {
                    background: var(--gold, #c9a96e);
                    width: 36px;
                }

                @media (max-width: 600px) {
                    .bs-card-new { flex-direction: column; }
                    .bs-img-side { width: 100%; height: 200px; }
                    .bs-big-num  { font-size: 2.8rem; }
                    .bs-header   { flex-direction: column; gap: 0.8rem; }
                }

                .sig-section {
                    padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 3rem);
                    background: var(--cream, #faf7f2);
                    text-align: center;
                    overflow: hidden;
                }

                .sig-title {
                    font-family: 'Playfair Display', 'Georgia', serif;
                    font-size: clamp(1.6rem, 6vw, 2.8rem);
                    color: var(--char, #2c2825);
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-bottom: 0.8rem;
                }

                .sig-desc {
                    font-family: 'DM Sans', sans-serif;
                    font-size: clamp(0.85rem, 2vw, 1rem);
                    color: var(--muted, #7a6855);
                    margin-bottom: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 300;
                    max-width: 560px;
                    margin-left: auto;
                    margin-right: auto;
                    line-height: 1.7;
                }

                .sig-grid {
                    display: flex;
                    justify-content: center;
                    gap: clamp(1.5rem, 3vw, 3rem);
                    flex-wrap: wrap;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .sig-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.9rem;
                    cursor: pointer;
                    animation: sigFadeUp 0.6s ease both;
                }
                .sig-card:nth-child(1) { animation-delay: 0.06s; }
                .sig-card:nth-child(2) { animation-delay: 0.12s; }
                .sig-card:nth-child(3) { animation-delay: 0.18s; }
                .sig-card:nth-child(4) { animation-delay: 0.24s; }
                .sig-card:nth-child(5) { animation-delay: 0.30s; }

                @keyframes sigFadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .sig-circle-wrap {
                    position: relative;
                    width: clamp(110px, 18vw, 180px);
                    height: clamp(110px, 18vw, 180px);
                }

                .sig-ring {
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    background:
                        linear-gradient(white, white) padding-box,
                        conic-gradient(var(--scent-color, #c9a96e) 0%, transparent 0%) border-box;
                }

                .sig-card.active .sig-ring,
                .sig-card:hover .sig-ring {
                    background:
                        linear-gradient(white, white) padding-box,
                        conic-gradient(var(--scent-color, #c9a96e) 100%, var(--scent-color, #c9a96e) 100%) border-box;
                }

                .sig-circle {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3.5px solid var(--scent-color, #c9a96e);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    z-index: 1;
                }

                .sig-card:hover .sig-circle,
                .sig-card.active .sig-circle {
                    transform: scale(1.1);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.18);
                }

                .sig-circle img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .sig-card:hover .sig-circle img,
                .sig-card.active .sig-circle img {
                    transform: scale(1.12);
                }

                .sig-circle-wrap::after {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border-radius: 50%;
                    border: 1.5px solid var(--scent-color, #c9a96e);
                    opacity: 0;
                    transform: scale(0.9);
                    transition: opacity 0.3s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    pointer-events: none;
                }
                .sig-card:hover .sig-circle-wrap::after,
                .sig-card.active .sig-circle-wrap::after {
                    opacity: 0.4;
                    transform: scale(1.08);
                }

                .sig-num-badge {
                    position: absolute;
                    bottom: 2px; right: 2px;
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    background: var(--scent-color, #c9a96e);
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.62rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .sig-card:hover .sig-num-badge,
                .sig-card.active .sig-num-badge {
                    transform: scale(1.2);
                }

                .sig-name {
                    font-family: 'Playfair Display', 'Georgia', serif;
                    font-size: clamp(0.78rem, 1.8vw, 1rem);
                    color: var(--char, #2c2825);
                    font-weight: 600;
                    line-height: 1.4;
                    white-space: pre-line;
                    text-align: center;
                    transition: color 0.3s;
                }
                .sig-card:hover .sig-name,
                .sig-card.active .sig-name {
                    color: var(--scent-color, #c9a96e);
                }

                .sig-note {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.68rem;
                    color: var(--muted, #7a6855);
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-top: -0.4rem;
                    opacity: 0;
                    transform: translateY(4px);
                    transition: opacity 0.3s, transform 0.3s;
                }
                .sig-card:hover .sig-note,
                .sig-card.active .sig-note {
                    opacity: 1;
                    transform: translateY(0);
                }

                .mood-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: clamp(0.8rem, 2vw, 1.2rem);
                    padding: 0 clamp(1rem, 5vw, 3rem) clamp(2rem, 4vw, 3rem);
                }
                @media (max-width: 768px) { .mood-grid { grid-template-columns: repeat(2,1fr); } }
                @media (max-width: 480px) { .mood-grid { grid-template-columns: 1fr 1fr; gap: 0.6rem; } }

                .mood-card { position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; border: 1.5px solid transparent; transition: all 0.28s ease; aspect-ratio: 4/3; }
                .mood-card:hover, .mood-card.active { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.14); }
                .mood-card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; filter: brightness(0.78); }
                .mood-card:hover .mood-card-img, .mood-card.active .mood-card-img { transform: scale(1.06); filter: brightness(0.65); }
                .mood-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%); }
                .mood-card-body { position: absolute; bottom: 0; left: 0; right: 0; padding: clamp(0.8rem,2vw,1.2rem); z-index: 2; }
                .mood-emoji { font-size: clamp(1.4rem,3vw,2rem); display: block; margin-bottom: 0.3rem; }
                .mood-name  { font-family: 'DM Sans',sans-serif; font-size: clamp(0.9rem,1.8vw,1.15rem); font-weight: 800; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.5); }
                .mood-desc  { font-family: 'DM Sans',sans-serif; font-size: clamp(0.65rem,1.1vw,0.75rem); color: rgba(255,255,255,0.8); margin-top: 0.2rem; }
                .mood-count-badge { position: absolute; top: 10px; right: 10px; font-family: 'DM Sans',sans-serif; font-size: 0.65rem; font-weight: 700; background: rgba(255,255,255,0.92); color: #2c2825; padding: 0.18rem 0.5rem; border-radius: 20px; z-index: 3; }
                .mood-panel { margin: 0 clamp(1rem,5vw,3rem) clamp(1.5rem,3vw,2rem); border-radius: 16px; padding: clamp(1.2rem,3vw,2rem); display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; position: relative; animation: sigFadeUp 0.3s ease both; }
                .mood-panel-left h3 { font-family: 'DM Sans',sans-serif; font-size: clamp(1rem,2vw,1.25rem); font-weight: 800; color: var(--char,#2c2825); margin: 0 0 0.5rem; }
                .mood-panel-products { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
                .mood-panel-products li { font-family: 'DM Sans',sans-serif; font-size: clamp(0.75rem,1.2vw,0.85rem); color: var(--char,#2c2825); opacity: 0.75; display: flex; align-items: center; gap: 0.4rem; }
                .mood-panel-products li::before { content: '→'; opacity: 0.5; font-size: 0.75rem; }
                .mood-panel-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.4rem; border-radius: 50px; border: none; font-family: 'DM Sans',sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; color: #fff; text-decoration: none; transition: opacity 0.2s, transform 0.2s; }
                .mood-panel-btn:hover { opacity: 0.88; transform: translateY(-1px); }
                .mood-panel-img { width: clamp(100px,18vw,160px); height: clamp(100px,18vw,160px); object-fit: cover; border-radius: 12px; flex-shrink: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
                .mood-panel-close { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.08); border: none; border-radius: 50%; width: 28px; height: 28px; font-size: 0.85rem; cursor: pointer; color: var(--char,#2c2825); display: flex; align-items: center; justify-content: center; font-family: 'DM Sans',sans-serif; }

                .video-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    animation: fadeIn 0.25s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .video-modal-inner {
                    position: relative;
                    width: 100%;
                    max-width: 85vw;
                    max-height: 85vh;
                    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }

                .video-modal-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    padding: 0.35rem 0.9rem;
                    border-radius: 50px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: all 0.2s;
                    z-index: 10000;
                }
                .video-modal-close:hover { background: rgba(255,255,255,0.25); }

                .video-modal-inner video {
                    width: 100%;
                    height: auto;
                    max-height: calc(85vh - 50px);
                    border-radius: 12px;
                    display: block;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.8);
                    background: #000;
                }

                .all-reviews-panel {
                    margin-top: 1.75rem;
                    padding: 1.75rem;
                    border-radius: 20px;
                    background: #fff;
                    box-shadow: 0 18px 45px rgba(0,0,0,0.08);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .all-reviews-header {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    margin-bottom: 1.25rem;
                }

                .all-reviews-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    color: #2c2825;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin: 0 0 0.4rem;
}

.all-reviews-header p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #7a6855;
    font-weight: 300;
    margin: 0 0 1.5rem;
}

                .all-reviews-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 1rem;
                }

                .all-review-card {
    padding: 2rem 1.8rem;
    border-radius: 16px;
    background: #F0EBE3;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
    border: none;
}

.all-review-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.all-review-meta strong {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #7A6855;
}

.all-review-product {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #B8936A;
    margin-top: 0.2rem;
}

.all-review-rating {
    color: #c9a96e;
    font-size: 1rem;
    letter-spacing: 2px;
}

.all-review-comment {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    color: #2c2825;
    font-size: clamp(0.88rem, 1.5vw, 1rem);
    line-height: 1.75;
    flex: 1;
    text-align: center;
}

.all-review-date {
    font-family: 'DM Sans', sans-serif;
    color: #7a6855;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    display: block;
}
                @media (max-width: 980px) {
                    .all-reviews-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 640px) {
                    .all-reviews-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .video-modal-close {
                        top: auto;
                        bottom: -50px;
                    }
                    .video-modal-inner {
                        max-width: 95vw;
                        max-height: 90vh;
                    }
                }
            `}</style>

            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero-left">
                    <p className="hero-tag">✦ New Collection</p>
                    <h1 className="hero-h1">
                        {slides[currentSlide].h1}
                        <em>{slides[currentSlide].h1_em}</em>
                    </h1>
                    <p className="hero-sub">{slides[currentSlide].sub}</p>
                    <div className="hero-btns">
                        <Link to="/shop" className="btn-primary">Explore Collection</Link>
                        <button className="btn-ghost" onClick={() => setShowVideo(true)}>▶ Watch Story</button>
                    </div>
                </div>
                <div className="hero-right">
                    <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {['hero1', 'hero2', 'hero3'].map((k, i) => (
                            <div key={i} className="slider-slide"><img src={images[k]} alt={`Hero ${i + 1}`} /></div>
                        ))}
                    </div>
                </div>
                <div className="slider-dots">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`slider-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => goSlide(i)} />
                    ))}
                </div>
                <div className="slider-nav">
                    <button onClick={() => moveSlide(-1)}>←</button>
                    <button onClick={() => moveSlide(1)}>→</button>
                </div>
            </section>

            {/* ── MARQUEE ── */}
            <div className="marquee-wrap">
                <div className="marquee-track">
                    {['✦ NEW COLLECTIONS EVERY MONTH', '100% NATURAL SOY WAX', 'HAND-POURED IN INDIA',
                        '✦ NEW COLLECTIONS EVERY MONTH', '100% NATURAL SOY WAX', 'HAND-POURED IN INDIA'].map((t, i) => (
                            <React.Fragment key={i}>
                                <span>{t}</span>
                                {i % 3 !== 2 && <span className="dot">•</span>}
                            </React.Fragment>
                        ))}
                </div>
            </div>

            {/* ── SHOP BY MOOD ── */}
            <section className="section">
                <div className="section-head">
                    <h2 className="section-title">Shop by Mood</h2>
                    <Link to="/shop" className="see-all">All products →</Link>
                </div>
                <div className="mood-grid">
                    {moodCategories.map((cat, idx) => (
                        <div
                            key={idx}
                            className={`mood-card ${activeMood === idx ? 'active' : ''}`}
                            style={{ borderColor: activeMood === idx ? cat.color : 'transparent', boxShadow: activeMood === idx ? `0 0 0 2px ${cat.color}55` : 'none' }}
                            onClick={() => setActiveMood(activeMood === idx ? null : idx)}
                        >
                            <img src={cat.image} alt={cat.mood} className="mood-card-img" />
                            <div className="mood-card-overlay" />
                            <span className="mood-count-badge">{cat.count} Products</span>
                            <div className="mood-card-body">
                                <span className="mood-emoji">{cat.emoji}</span>
                                <div className="mood-name">{cat.mood}</div>
                                <div className="mood-desc">{cat.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
                {activeMoodData && (
                    <div className="mood-panel" style={{ background: activeMoodData.gradient, border: `1.5px solid ${activeMoodData.border}` }}>
                        <button className="mood-panel-close" onClick={() => setActiveMood(null)}>✕</button>
                        <div className="mood-panel-left">
                            <h3>{activeMoodData.emoji} {activeMoodData.mood} Collection</h3>
                            <ul className="mood-panel-products">
                                {activeMoodData.products.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                            <Link to={`/shop?category=${encodeURIComponent(activeMoodData.shopCategory)}`} className="mood-panel-btn" style={{ background: activeMoodData.color }}>
                                Shop {activeMoodData.mood} →
                            </Link>
                        </div>
                        <img src={activeMoodData.image} alt={activeMoodData.mood} className="mood-panel-img" />
                    </div>
                )}
            </section>

            {/* ── SIGNATURE SCENTS ── */}
            <section className="sig-section">
                <h2 className="sig-title">Signature Scents</h2>
                <p className="sig-desc">Five timeless fragrances — crafted to shape every mood and memory.</p>

                <div className="sig-grid">
                    {signatureScents.map((scent, idx) => (
                        <div
                            key={idx}
                            className={`sig-card ${activeScentIdx === idx ? 'active' : ''}`}
                            style={{ '--scent-color': scent.color }}
                            onClick={() => setActiveScentIdx(activeScentIdx === idx ? null : idx)}
                        >
                            <div className="sig-circle-wrap">
                                <div className="sig-ring" />
                                <div className="sig-circle">
                                    <img src={scent.img} alt={scent.name} />
                                </div>
                                <div className="sig-num-badge">{String(idx + 1).padStart(2, '0')}</div>
                            </div>
                            <p className="sig-name">{scent.name}</p>
                            <p className="sig-note">{scent.note}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── BESTSELLERS ── */}
            <section className="bs-section">
                <div className="bs-header">
                    <div className="bs-header-left">
                        <h2>Best Sellers</h2>
                        <p>Our most-loved candles — chosen by thousands of happy customers.</p>
                    </div>
                    <div className="bs-controls">
                        <button className="bs-ctrl-btn" onClick={() => moveBs(-1)} aria-label="Previous">&#8249;</button>
                        <button
                            className={`bs-auto-pill ${isPaused ? 'paused' : ''}`}
                            onClick={() => setIsPaused(p => !p)}
                        >
                            <span className="bs-auto-dot" />
                            {isPaused ? 'Paused' : 'Auto'}
                        </button>
                        <button className="bs-ctrl-btn" onClick={() => moveBs(1)} aria-label="Next">&#8250;</button>
                    </div>
                </div>

                <div className="bs-viewport">
                    <div className="bs-track" style={{ transform: `translateX(-${bestsellerSlide * 100}%)` }}>
                        {bestsellers.map((item, idx) => (
                            <div key={idx} className="bs-card-new">
                                <div className="bs-img-side">
                                    <img src={item.img} alt={item.name} />
                                    <span className="bs-tag-badge" style={{ background: tagColors[item.tag] || '#2c2825' }}>
                                        {item.tag}
                                    </span>
                                </div>
                                <div className="bs-content-side">
                                    <div className="bs-big-num">0{idx + 1}</div>
                                    <div className="bs-cat-label">{item.category}</div>
                                    <h3 className="bs-prod-name">{item.name}</h3>
                                    <p className="bs-desc">{item.desc}</p>
                                    <div className="bs-price">{item.price}</div>
                                    <div className="bs-action-row">
                                        <button className="bs-add-btn">🛒 Add to Cart</button>
                                        <Link to="/shop" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.78rem', color: 'var(--gold-dark,#a07840)', textDecoration: 'none', letterSpacing: '0.04em' }}>
                                            View all →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bs-progress-wrap">
                    <div className="bs-progress-bar">
                        <div className="bs-progress-fill" style={{ width: `${((bestsellerSlide + 1) / bestsellers.length) * 100}%` }} />
                    </div>
                    <span className="bs-slide-counter">{String(bestsellerSlide + 1).padStart(2, '0')} / {String(bestsellers.length).padStart(2, '0')}</span>
                </div>

                <div className="bs-dots-row">
                    {bestsellers.map((_, idx) => (
                        <button
                            key={idx}
                            className={`bs-dot-new ${idx === bestsellerSlide ? 'active' : ''}`}
                            onClick={() => { setBestsellerSlide(idx); startBsTimer(); }}
                            aria-label={`Slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* ── STORY ── */}
            <section className="story">
                <div className="story-visual"><img src={images.story} alt="Story" /></div>
                <div className="story-content">
                    <p className="story-tag">✦ Our Heritage</p>
                    <h2 className="story-h2">Crafting scent since the beginning</h2>
                    <p className="story-p">Every candle we make carries decades of fragrance tradition. We source the finest wax, the rarest essential oils, and pair them with artisan craftsmanship.</p>
                    <p className="story-p">From tealights for Diwali to luxury pillar candles for everyday indulgence — Mahasu is India's home of authentic fragrances.</p>
                    <div className="story-stats">
                        <div><div className="stat-n">10K+</div><div className="stat-l">Happy Customers</div></div>
                        <div><div className="stat-n">200+</div><div className="stat-l">Scent Varieties</div></div>
                        <div><div className="stat-n">100%</div><div className="stat-l">Natural Wax</div></div>
                    </div>
                </div>
            </section>

            {/* ── REVIEWS ── */}
            <section className="section" style={{ background: '#FAF6F0' }}>
                <div className="section-head">
                    <h2 className="section-title">What customers say</h2>
                    <button type="button" className="see-all" onClick={toggleAllReviews}>
                        {showAllReviews ? 'Hide All Reviews' : 'All reviews →'}
                    </button>
                </div>
                <div className="rev-grid">
                    {reviews.map((rev, idx) => (
                        <div key={idx} className="rev-card">
                            <div className="stars">{rev.stars}</div>
                            <p className="rev-text">{rev.text}</p>
                            <p className="rev-author">{rev.author}</p>
                        </div>
                    ))}
                </div>
                {showAllReviews && (
                    <div className="all-reviews-panel">
                        <div className="all-reviews-header">
                            <h3>All Customer Reviews</h3>
                            <p>Browse the latest feedback from every product in our store.</p>
                        </div>
                        {loadingAllReviews ? (
                            <p className="all-reviews-loading">Loading all reviews...</p>
                        ) : allReviews.length === 0 ? (
                            <p className="all-reviews-empty">No reviews available at the moment.</p>
                        ) : (
                            <div className="all-reviews-grid">
                                {allReviews.map((review) => (
                                    <div key={review.id} className="all-review-card">
                                        <div className="all-review-meta">
                                            <div>
                                                <strong>{review.reviewer}</strong>
                                                <span className="all-review-product">{review.product_name || 'Product'}</span>
                                            </div>
                                            <span className="all-review-rating">{'★'.repeat(Number(review.rating))}{'☆'.repeat(5 - Number(review.rating))}</span>
                                        </div>
                                        <p className="all-review-comment">{review.comment}</p>
                                        <time className="all-review-date">{formatReviewDate(review.created_at)}</time>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* ── NEWSLETTER ── */}
            <div className="newsletter">
                <p className="nl-tag">✦ Join the community</p>
                <h2 className="nl-h2">Scents, stories & offers</h2>
                <p className="nl-sub">Subscribe to get 10% off your first order and early access to new collections.</p>
                <div className="nl-form">
                    <input type="email" placeholder="Enter your email" />
                    <button>Subscribe</button>
                </div>
            </div>

            {/* ── VIDEO MODAL ── */}
            {showVideo && (
                <div className="video-modal-backdrop" onClick={closeVideo}>
                    <div className="video-modal-inner" onClick={e => e.stopPropagation()}>
                        <button className="video-modal-close" onClick={closeVideo}>
                            ✕ Close
                        </button>
                        <video
                            ref={videoRef}
                            controls
                            controlsList="nodownload"
                        >
                            <source src="/videos/Mahasu_Video.mp4" type="video/mp4" />
                            <source src="/videos/Mahasu_Video.webm" type="video/webm" />
                            <p>Your browser doesn't support HTML5 video. Please try another format or update your browser.</p>
                        </video>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;