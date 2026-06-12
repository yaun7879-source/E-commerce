import React from 'react';
import { Link } from 'react-router-dom';

const Wholesale = () => {
    return (
        <div style={{ minHeight: '70vh', padding: '4rem 1.5rem', background: 'linear-gradient(135deg, #faf6f0 0%, #f0e8da 100%)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
                <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: '#b8936a', fontWeight: 700, marginBottom: '0.5rem' }}>Wholesale</p>
                <h1 style={{ fontSize: '2rem', margin: '0 0 1rem', color: '#2a1f14' }}>Partner with Mahasu</h1>
                <p style={{ color: '#6b5b4b', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    We welcome boutique stores, hotels, and gifting brands looking for premium handcrafted fragrances in bulk.
                </p>
                <div style={{ border: '1px solid #f0e8da', borderRadius: '16px', padding: '1rem 1.1rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.4rem', color: '#2a1f14' }}>What we offer</h3>
                    <p style={{ margin: 0, color: '#6b5b4b' }}>Custom bulk pricing, consistent quality, and beautiful packaging options for wholesale orders.</p>
                </div>
                <a href="mailto:support@mahasu.co.in" style={{ display: 'inline-block', marginRight: '1rem', background: '#b8936a', color: '#fff', padding: '0.8rem 1.1rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>Email us</a>
                <Link to="/contact" style={{ display: 'inline-block', color: '#b8936a', fontWeight: 700, textDecoration: 'none' }}>Contact us →</Link>
            </div>
        </div>
    );
};

export default Wholesale;
