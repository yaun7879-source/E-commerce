import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import './Help.css';

export default function FAQ() {
    const [faqs, setFaqs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/faqs`);

            if (response.ok) {
                const data = await response.json();
                setFaqs(data);
            } else {
                throw new Error('Failed to fetch FAQs');
            }
        } catch (err) {
            setError(err.message || 'Failed to load FAQs');
            // Fallback FAQs if API fails
            setFaqs([
                {
                    id: 1,
                    question: 'How can I track my order?',
                    answer: 'You can track your order using the "Track Order" page. Enter your order ID and you will see the current status and estimated delivery date.',
                    category: 'Orders'
                },
                {
                    id: 2,
                    question: 'What is your return policy?',
                    answer: 'We currently do not accept returns. Please contact our support team at +91 9993107161 for assistance with any order concerns.',
                    category: 'Returns'
                },
                {
                    id: 3,
                    question: 'How long does delivery take?',
                    answer: 'Standard delivery takes 5-7 business days. Express delivery is available for 2-3 business days within selected cities.',
                    category: 'Shipping'
                },
                {
                    id: 4,
                    question: 'Can I cancel my order?',
                    answer: 'You can cancel your order within 24 hours of placing it. Go to the "Cancellation" page to request a cancellation.',
                    category: 'Orders'
                },
                {
                    id: 5,
                    question: 'What payment methods are accepted?',
                    answer: 'We accept all major credit cards, debit cards, UPI, and digital wallets through Razorpay.',
                    category: 'Payment'
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

    const filteredFaqs = (selectedCategory === 'all'
        ? faqs
        : faqs.filter(faq => faq.category === selectedCategory)).filter((faq) => !/refund/i.test(faq.question || '') && !/refund/i.test(faq.answer || ''));

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="help-page">
            <div className="help-container">
                <h1>❓ Frequently Asked Questions</h1>
                <p className="help-subtitle">Find answers to common questions</p>

                {loading && <p className="loading">Loading FAQs...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && (
                    <>
                        <div className="faq-categories">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="faq-list">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map(faq => (
                                    <div
                                        key={faq.id}
                                        className={`faq-item ${expandedId === faq.id ? 'expanded' : ''}`}
                                        onClick={() => toggleExpand(faq.id)}
                                    >
                                        <div className="faq-question">
                                            <h3>{faq.question}</h3>
                                            <span className="faq-toggle">{expandedId === faq.id ? '−' : '+'}</span>
                                        </div>
                                        {expandedId === faq.id && (
                                            <div className="faq-answer">
                                                <p>{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="no-results">No FAQs found for this category</p>
                            )}
                        </div>
                    </>
                )}

                <div className="faq-footer">
                    <h3>Still have questions?</h3>
                    <p>Contact our support team at <strong>support@mahasu.com</strong> or call us at <strong>1-800-MAHASU-1</strong></p>
                </div>
            </div>
        </div>
    );
}
