import React from 'react';
import { Link } from 'react-router-dom';
import './Help.css';

export default function HelpHub() {
    return (
        <div className="help-page">
            <div className="help-container">
                <h1>📞 Help & Support</h1>
                <p className="help-subtitle">How can we help you today?</p>

                <div className="help-grid">
                    <Link to="/track-order" className="help-card">
                        <div className="help-card-icon">📦</div>
                        <h3>Track Order</h3>
                        <p>Track your shipment and see delivery status in real-time</p>
                    </Link>

                    <Link to="/cancellation" className="help-card">
                        <div className="help-card-icon">❌</div>
                        <h3>Cancel Order</h3>
                        <p>Cancel your order within 24 hours of placement</p>
                    </Link>

                    <Link to="/privacy-policy" className="help-card">
                        <div className="help-card-icon">🔒</div>
                        <h3>Privacy Policy</h3>
                        <p>Learn how Mahasu protects your data and privacy.</p>
                    </Link>
                </div>

                <div className="help-contact-section">
                    <h2>Can't find what you need?</h2>
                    <p>Contact our support team</p>
                    <div className="contact-info">
                        <div className="contact-item">
                            <span className="contact-icon">📧</span>
                            <div>
                                <strong>Email</strong>
                                <p>support@mahasu.com</p>
                            </div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <div>
                                <strong>Phone</strong>
                                <p>+91 9993107161</p>
                            </div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">⏰</span>
                            <div>
                                <strong>Hours</strong>
                                <p>Mon-Fri, 9AM-6PM IST</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
