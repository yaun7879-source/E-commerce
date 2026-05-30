import React from 'react';

const About = () => {
    return (
        <div>
            {/* ABOUT HERO */}
            <div className="about-hero">
                <h1>About Mahasu</h1>
                <p>A legacy of fragrance craftsmanship spanning generations, rooted in India's rich aromatic traditions.</p>
            </div>

            {/* OUR STORY */}
            <div className="about-section">
                <h2>Our Story</h2>

                {/* FOUNDER CIRCULAR PHOTO */}
                <div className="founder-profile">
                    <div className="founder-circle-wrap">
                        <div className="founder-circle">
                            <img
                                src="/images/sir-photo.jpeg"
                                alt="Founder of Mahasu"
                            />
                        </div>
                        <div className="founder-ring" />
                    </div>
                    <div className="founder-info">
                        <span className="founder-label">Our Founder</span>
                        <h3 className="founder-name">Rahul Udhwani</h3>
                        <p className="founder-title">Master Perfumer & Visionary</p>
                    </div>
                </div>

                <p>Founded with a passion for authentic fragrances, Mahasu has been committed to creating handcrafted candles and aromatic products that transform spaces into sanctuaries of peace and memory.</p>
                <p>Every candle tells a story. We believe in honoring traditions while embracing innovation, sourcing the finest natural ingredients from sustainable suppliers across India.</p>
                <p>What started as a small family venture has blossomed into a beloved brand serving thousands of happy customers across the country. Our journey is defined by dedication to quality, sustainability, and the art of fragrance.</p>
            </div>

            {/* OUR MISSION */}
            <div className="about-section">
                <h2>Our Mission</h2>
                <p>To make luxury fragrances accessible to everyone by creating premium, 100% natural soy wax candles and diffusers that nurture wellbeing and celebrate life's precious moments.</p>
                <p>We're dedicated to sustainable practices, ethical sourcing, and supporting artisan communities. Each purchase supports fair-trade practices and helps preserve India's fragrance heritage.</p>
            </div>

            {/* WHY CHOOSE US */}
            <div className="about-section">
                <h2>Why Choose Mahasu?</h2>
                <div className="about-grid">
                    <div className="about-card">
                        <div className="about-card-icon">♻️</div>
                        <h3>100% Natural Soy Wax</h3>
                        <p>Clean burning and eco-friendly.</p>
                    </div>
                    <div className="about-card">
                        <div className="about-card-icon">✨</div>
                        <h3>Hand-Poured</h3>
                        <p>Crafted in small batches for quality.</p>
                    </div>
                    <div className="about-card">
                        <div className="about-card-icon">🌿</div>
                        <h3>Premium Oils</h3>
                        <p>From trusted sustainable sources.</p>
                    </div>
                    <div className="about-card">
                        <div className="about-card-icon">📦</div>
                        <h3>Elegant Packaging</h3>
                        <p>Designed with care and sustainability.</p>
                    </div>
                    <div className="about-card">
                        <div className="about-card-icon">🤝</div>
                        <h3>Supporting Communities</h3>
                        <p>Fair-trade and artisan partnerships.</p>
                    </div>
                    <div className="about-card">
                        <div className="about-card-icon">🇮🇳</div>
                        <h3>Made in India</h3>
                        <p>Preserving heritage and traditions.</p>
                    </div>
                </div>
            </div>

            {/* STATS SECTION */}
            <div className="about-stats-section">
                <h2>By The Numbers</h2>
                <div className="about-stats">
                    <div className="about-stat">
                        <div className="about-stat-number">10K+</div>
                        <p className="about-stat-label">Happy Customers</p>
                    </div>
                    <div className="about-stat">
                        <div className="about-stat-number">200+</div>
                        <p className="about-stat-label">Scent Varieties</p>
                    </div>
                    <div className="about-stat">
                        <div className="about-stat-number">100%</div>
                        <p className="about-stat-label">Natural Wax</p>
                    </div>
                </div>
            </div>

            <style>{`
                /* ── FOUNDER PROFILE ── */
                .founder-profile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 1.2rem;
                    margin: clamp(1.5rem, 3vw, 2.5rem) 0 clamp(1.8rem, 3.5vw, 2.8rem);
                }

                .founder-circle-wrap {
                    position: relative;
                    flex-shrink: 0;
                    display: inline-block;
                }

                .founder-circle {
                    width: clamp(150px, 20vw, 220px);
                    height: clamp(150px, 20vw, 220px);
                    border-radius: 50%;
                    overflow: hidden;
                    border: clamp(3px, 0.5vw, 5px) solid #C9A96E;
                    box-shadow: 0 clamp(6px, 1.5vw, 12px) clamp(20px, 3vw, 36px) rgba(201, 169, 110, 0.3);
                    position: relative;
                    z-index: 1;
                }

                .founder-circle img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center top;
                    display: block;
                }

                /* Decorative outer ring */
                .founder-ring {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    border-radius: 50%;
                    border: 1.5px dashed rgba(201, 169, 110, 0.45);
                    animation: founder-spin 18s linear infinite;
                }

                @keyframes founder-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                .founder-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.3rem;
                }

                .founder-label {
                    font-size: clamp(0.6rem, 1.2vw, 0.68rem);
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: var(--gold-dark);
                    font-weight: 500;
                }

                .founder-name {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.3rem, 3vw, 1.9rem);
                    color: var(--char);
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.2;
                }

                .founder-title {
                    font-size: clamp(0.8rem, 1.6vw, 0.92rem);
                    color: var(--muted);
                    font-style: italic;
                    font-family: 'Playfair Display', serif;
                    margin: 0;
                }

                /* ── EXISTING STYLES ── */
                .about-hero {
                    padding: clamp(3rem, 7vw, 5rem) clamp(1.2rem, 5vw, 3rem);
                    background: linear-gradient(135deg, rgba(201,169,110,0.12), rgba(250,246,240,0.95));
                    text-align: center;
                    color: var(--char);
                }

                .about-hero h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.4rem, 6vw, 4rem);
                    margin-bottom: 1rem;
                    letter-spacing: -0.05em;
                    color: var(--char);
                }

                .about-hero p {
                    max-width: 760px;
                    margin: 0 auto;
                    font-size: clamp(0.95rem, 2vw, 1.1rem);
                    color: var(--muted);
                    line-height: 1.9;
                }

                .about-section {
                    padding: clamp(2rem, 6vw, 4rem) clamp(1rem, 5vw, 3rem);
                    max-width: 1200px;
                    margin: 0 auto;
                    color: var(--char);
                }

                .about-section h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.8rem, 4vw, 2.6rem);
                    color: var(--char);
                    margin-bottom: 1rem;
                }

                .about-section p {
                    color: var(--muted);
                    font-size: clamp(0.95rem, 1.9vw, 1.05rem);
                    line-height: 1.85;
                    margin-bottom: 1rem;
                }

                .about-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(clamp(220px, 26vw, 280px), 1fr));
                    gap: clamp(1.5rem, 2.5vw, 2.5rem);
                    margin-top: clamp(1.5rem, 3vw, 2.5rem);
                }

                .about-card {
                    padding: clamp(1.5rem, 2vw, 2rem);
                    border-radius: 20px;
                    background: rgba(240, 232, 218, 0.96);
                    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.06);
                    text-align: center;
                    border: 1px solid rgba(201, 169, 110, 0.18);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .about-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
                }

                .about-card-icon {
                    font-size: clamp(2rem, 4vw, 2.5rem);
                    margin-bottom: 1rem;
                }

                .about-card h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.05rem, 2vw, 1.25rem);
                    color: var(--char);
                    margin-bottom: 0.6rem;
                }

                .about-card p {
                    color: var(--muted);
                    line-height: 1.8;
                }

                .about-stats-section {
                    background: linear-gradient(180deg, rgba(249, 241, 227, 0.95), rgba(250, 246, 240, 0.98));
                    padding: clamp(3rem, 8vw, 4.5rem) clamp(1rem, 5vw, 3rem);
                    text-align: center;
                }

                .about-stats-section h2 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.8rem, 4vw, 2.8rem);
                    color: var(--char);
                    margin-bottom: clamp(1.5rem, 3vw, 2rem);
                }

                .about-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: clamp(1.4rem, 2vw, 2rem);
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .about-stat {
                    background: white;
                    border-radius: 18px;
                    padding: clamp(1.5rem, 2vw, 2rem);
                    box-shadow: 0 18px 35px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(233, 213, 174, 0.25);
                }

                .about-stat-number {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.2rem, 5vw, 3.4rem);
                    color: var(--gold-dark);
                    margin-bottom: 0.65rem;
                    font-weight: 700;
                }

                .about-stat-label {
                    font-size: clamp(0.85rem, 1.5vw, 1rem);
                    color: var(--muted);
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                }

                @media (max-width: 480px) {
                    .founder-profile {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default About;