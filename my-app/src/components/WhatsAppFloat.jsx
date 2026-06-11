import React from 'react';
import './WhatsAppFloat.css';

const WhatsAppFloat = () => {
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919993107111';
    const message = encodeURIComponent("Hi I'm interested in your candles");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    const handleClick = (event) => {
        event.preventDefault();
        const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer,width=420,height=700');

        if (!popup) {
            window.location.href = whatsappUrl;
        }
    };

    return (
        <a
            href={whatsappUrl}
            className="wa-float"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            onClick={handleClick}
        >
            <span className="wa-float__tooltip">Chat with us</span>
            <span className="wa-float__icon" aria-hidden="true">
                <i className="fab fa-whatsapp"></i>
            </span>
        </a>
    );
};

export default WhatsAppFloat;
