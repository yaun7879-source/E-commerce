import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
    return (
        <div style={{ minHeight: '70vh', padding: '4rem 1.5rem', background: 'linear-gradient(135deg, #faf6f0 0%, #f0e8da 100%)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
                <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b8936a', fontWeight: 700, marginBottom: '0.5rem' }}>Mahasu Journal</p>
                <h1 style={{ fontSize: '2rem', margin: '0 0 1rem', color: '#2a1f14' }}>Our latest fragrance stories</h1>
                <p style={{ color: '#6b5b4b', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    Discover candle care tips, seasonal fragrance picks, and the inspiration behind our handcrafted collections.
                </p>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ border: '1px solid #f0e8da', borderRadius: '16px', padding: '1rem 1.1rem' }}>
                        <h3 style={{ margin: '0 0 0.4rem', color: '#2a1f14' }}>How to make your candle last longer</h3>
                        <p style={{ margin: 0, color: '#6b5b4b' }}>Simple care habits that help your fragrance glow beautifully at home.</p>
                    </div>
                    <div style={{ border: '1px solid #f0e8da', borderRadius: '16px', padding: '1rem 1.1rem' }}>
                        <h3 style={{ margin: '0 0 0.4rem', color: '#2a1f14' }}>Best scents for cozy evenings</h3>
                        <p style={{ margin: 0, color: '#6b5b4b' }}>A curated guide for warm, relaxing fragrances that turn every room into a retreat.</p>
                    </div>
                </div>
                <Link to="/shop" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#b8936a', fontWeight: 700, textDecoration: 'none' }}>Browse candles →</Link>
            </div>
        </div>
    );
};

export default Blog;
