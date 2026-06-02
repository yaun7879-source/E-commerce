import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HelpNavbar.css';

export default function HelpNavbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="help-navbar">
            <div className="help-navbar-container">
                <div className="help-navbar-title">
                    <h3>📞 Help & Support</h3>
                </div>

                <button
                    className="help-navbar-toggle"
                    onClick={toggleMenu}
                    aria-label="Toggle help menu"
                >
                    ☰
                </button>

                <nav className={`help-navbar-menu ${isOpen ? 'active' : ''}`}>
                    <Link
                        to="/track-order"
                        className="help-navbar-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="help-icon">📦</span>
                        <span className="help-text">Track Order</span>
                    </Link>

                    <Link
                        to="/return"
                        className="help-navbar-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="help-icon">↩️</span>
                        <span className="help-text">Return</span>
                    </Link>

                    <Link
                        to="/cancellation"
                        className="help-navbar-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="help-icon">❌</span>
                        <span className="help-text">Cancellation</span>
                    </Link>

                    <Link
                        to="/faq"
                        className="help-navbar-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="help-icon">❓</span>
                        <span className="help-text">FAQ</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
