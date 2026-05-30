import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize EmailJS (do this once when component mounts)
    useEffect(() => {
        // Get your public key from https://dashboard.emailjs.com/admin
        emailjs.init('E7MM05woF7fQpR3Hy');
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error when user starts typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Send email using EmailJS
            await emailjs.send(
                'service_rg8icdn',      // Get from EmailJS dashboard
                'template_xp9g32u',     // Get from EmailJS dashboard
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    to_email: 'support@mahasu.co.in' // Your email
                }
            );

            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Reset after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 3000);
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('EmailJS error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* CONTACT HERO */}
            <div className="contact-hero">
                <h1>Get in Touch</h1>
                <p>We'd love to hear from you. Reach out with any questions, orders, or just to share your Mahasu experience.</p>
            </div>

            {/* CONTACT CONTENT */}
            <div className="contact-content">
                {/* CONTACT FORM */}
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form-badge">
                        <span className="contact-form-badge-icon">👉</span>
                        <span>Get in Touch</span>
                    </div>
                    {submitted ? (
                        <div className="success-box">
                            <div className="success-check">✓</div>
                            <h3>Message Sent!</h3>
                            <p>Thank you for reaching out. We'll get back to you soon!</p>
                        </div>
                    ) : (
                        <>
                            {error && <div className="error-box">{error}</div>}

                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="contact-field"
                                disabled={loading}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="contact-field"
                                disabled={loading}
                            />
                            <input
                                type="text"
                                name="subject"
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="contact-field"
                                disabled={loading}
                            />
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="contact-field contact-textarea"
                                disabled={loading}
                            ></textarea>
                            <button
                                type="submit"
                                className="contact-submit"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </>
                    )}
                </form>

                {/* CONTACT INFO */}
                <div className="contact-info">
                    <div className="contact-item">
                        <h3>📍 Location</h3>
                        <p>Indore, Madhya Pradesh<br />India</p>
                    </div>

                    <div className="contact-item">
                        <h3>📞 Phone</h3>
                        <p><a href="tel:+919993107111" className="contact-link">+91 9993107111</a></p>
                    </div>

                    <div className="contact-item">
                        <h3>✉ Email</h3>
                        <p><a href="mailto:support@mahasu.co.in" className="contact-link">support@mahasu.co.in</a></p>
                    </div>

                    <div className="contact-item">
                        <h3>🌐 Website</h3>
                        <p><a href="https://mahasu.co.in" target="_blank" rel="noopener noreferrer" className="contact-link">mahasu.co.in</a></p>
                    </div>

                    <div className="contact-item">
                        <h3>⏰ Business Hours</h3>
                        <p>Monday - Friday: 10:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                    </div>
                </div>
            </div>

            <style>{`
                .contact-hero {
                    padding: clamp(3rem, 7vw, 5rem) clamp(1.2rem, 5vw, 3rem);
                    background: linear-gradient(135deg, rgba(201,169,110,0.14), rgba(250,246,240,0.98));
                    text-align: center;
                    color: var(--char);
                }

                .contact-hero h1 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.4rem, 6vw, 4rem);
                    margin-bottom: 1rem;
                    color: var(--char);
                }

                .contact-hero p {
                    color: var(--muted);
                    font-size: clamp(0.95rem, 1.9vw, 1.1rem);
                    max-width: 780px;
                    margin: 0 auto;
                    line-height: 1.85;
                }

                .contact-content {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: clamp(2rem, 4vw, 3rem);
                    padding: clamp(2rem, 6vw, 4rem) clamp(1rem, 5vw, 3rem);
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .contact-form,
                .contact-info {
                    background: white;
                    border-radius: 24px;
                    padding: clamp(2rem, 4vw, 3rem);
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.06);
                    border: 1px solid rgba(232, 221, 208, 0.8);
                }

                .contact-form {
                    position: relative;
                    overflow: visible;
                    display: flex;
                    flex-direction: column;
                    gap: 3rem;
                }

                .contact-form-badge {
                    position: absolute;
                    top: -18px;
                    left: clamp(1.2rem, 2vw, 2rem);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 1rem;
                    background: #fff;
                    border: 1px solid rgba(201,169,110,0.35);
                    border-radius: 999px;
                    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
                    font-size: 0.95rem;
                    color: #2A1F14;
                    z-index: 2;
                }

                .contact-form-badge-icon {
                    width: 30px;
                    height: 30px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: rgba(201,169,110,0.16);
                    color: #C9A96E;
                    font-size: 1rem;
                }

                .error-box {
                    padding: 1rem 1.2rem;
                    background: #fee5e5;
                    border: 1px solid #f5a5a5;
                    border-radius: 14px;
                    color: #c41e3a;
                    font-size: 0.95rem;
                    margin-bottom: 0.5rem;
                    animation: fadeIn 0.3s ease-in;
                }

                .contact-field {
                    width: 100%;
                    border: 1px solid rgba(184, 147, 106, 0.3);
                    border-radius: 14px;
                    padding: 1rem 1.2rem;
                    font-size: 0.95rem;
                    color: var(--char);
                    background: #fbf7f0;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .contact-field:focus {
                    outline: none;
                    border-color: var(--gold);
                    box-shadow: 0 0 0 4px rgba(201, 169, 110, 0.12);
                }

                .contact-field:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .contact-textarea {
                    min-height: 170px;
                    resize: vertical;
                }

                .contact-submit {
                    background: var(--char);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    padding: 1rem 1.4rem;
                    font-size: 0.95rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease;
                }

                .contact-submit:hover:not(:disabled) {
                    background: var(--gold-dark);
                    transform: translateY(-2px);
                }

                .contact-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .success-box {
                    padding: clamp(2rem, 4vw, 3rem);
                    background: var(--warm);
                    border-radius: 18px;
                    text-align: center;
                    animation: fadeIn 0.5s ease-in;
                    border: 1px solid rgba(201, 169, 110, 0.25);
                }

                .success-check {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .success-box h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(1.3rem, 3vw, 1.8rem);
                    color: var(--char);
                    margin-bottom: 0.5rem;
                }

                .success-box p {
                    font-size: clamp(0.9rem, 1.5vw, 1rem);
                    color: var(--muted);
                }

                .contact-info {
                    display: grid;
                    gap: 1.2rem;
                }

                .contact-item h3 {
                    font-size: clamp(1rem, 1.8vw, 1.2rem);
                    margin-bottom: 0.65rem;
                    color: var(--char);
                }

                .contact-item p {
                    color: var(--muted);
                    line-height: 1.8;
                }

                .contact-link {
                    color: var(--muted);
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .contact-link:hover {
                    color: var(--gold-dark);
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 960px) {
                    .contact-content {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Contact;