const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: emailUser && emailPassword ? {
        user: emailUser,
        pass: emailPassword,
    } : undefined,
});

const sendMail = async ({ to, subject, html }) => {
    if (!emailUser || !emailPassword) {
        const message = 'Email service is not configured. Set EMAIL_USER and EMAIL_PASSWORD (or EMAIL_PASS) in backend/.env';
        console.error(`⚠️ ${message}`);
        throw new Error(message);
    }

    return transporter.sendMail({
        from: process.env.EMAIL_FROM || emailUser,
        to,
        subject,
        html,
    });
};

module.exports = { sendMail };
