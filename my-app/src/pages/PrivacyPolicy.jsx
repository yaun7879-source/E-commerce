import React from 'react';
import { Link } from 'react-router-dom';
import './Help.css';

export default function PrivacyPolicy() {
    return (
        <div className="help-page">
            <div className="help-container">
                <h1>🔒 Privacy Policy</h1>
                <p className="help-subtitle">Your privacy matters to Mahasu. Here’s how we protect your data.</p>

                <div className="help-card" style={{ textAlign: 'left', maxWidth: '900px', margin: '0 auto' }}>
                    <h3>What we collect</h3>
                    <p>
                        We only collect the information necessary to process orders, manage your account, and respond to support requests.
                        This may include your name, email, shipping address, phone number, and order history.
                    </p>

                    <h3>How we use your information</h3>
                    <p>
                        Your data is used to deliver orders, provide customer service, and improve your experience on our site.
                        We do not sell your personal information to third parties.
                    </p>

                    <h3>Security</h3>
                    <p>
                        We take reasonable technical and organizational steps to protect your personal information.
                        If you have questions about account security, please contact support@mahasu.co.in.
                    </p>

                    <h3>Contact us</h3>
                    <p>
                        If you would like to update, correct, or delete your information, email us at{' '}
                        <a href="mailto:support@mahasu.co.in" style={{ color: 'var(--gold, #c9a96e)' }}>
                            support@mahasu.co.in
                        </a>.
                    </p>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Link to="/help" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        Back to Help & Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
