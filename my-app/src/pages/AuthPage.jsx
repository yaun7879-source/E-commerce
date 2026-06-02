import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const EnhancedAuthPage = ({ onLogin }) => {
    const [tab, setTab] = useState('login');
    const [showLoginPw, setShowLoginPw] = useState(false);
    const [showSignupPw, setShowSignupPw] = useState(false);
    const [pwValue, setPwValue] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupFirstName, setSignupFirstName] = useState('');
    const [signupLastName, setSignupLastName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [showResetPanel, setShowResetPanel] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetToken, setResetToken] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        const first_name = params.get('first_name');
        const last_name = params.get('last_name');
        const id = params.get('id');
        const phone = params.get('phone');

        if (token && email) {
            const user = {
                id: id ? Number(id) : null,
                email,
                first_name: first_name || '',
                last_name: last_name || '',
                phone: phone || null,
            };
            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify(user));
            onLogin && onLogin(user, token);
            setAuthMessage('Signed in successfully with Google.');

            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        } else if (email && !token) {
            // OAuth callback that sets an HttpOnly cookie on the backend (no token in URL).
            // Fetch profile from backend using cookie and sync auth state.
            (async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                        credentials: 'include'
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const userFromServer = data.user || data;
                        localStorage.setItem('authUser', JSON.stringify(userFromServer));
                        onLogin && onLogin(userFromServer, null);
                        setAuthMessage('Signed in successfully.');
                        const cleanUrl = window.location.pathname;
                        window.history.replaceState({}, document.title, cleanUrl);
                        return;
                    }

                    // Fallback: if profile endpoint failed, still set a minimal user
                    const fallbackUser = {
                        id: id ? Number(id) : null,
                        email,
                        first_name: first_name || '',
                        last_name: last_name || '',
                        phone: phone || null,
                    };
                    localStorage.setItem('authUser', JSON.stringify(fallbackUser));
                    onLogin && onLogin(fallbackUser, null);
                    setAuthMessage('Signed in successfully.');
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                } catch (e) {
                    console.error('OAuth profile fetch failed:', e);
                }
            })();
        }
    }, [onLogin]);
    const [resetPassword, setResetPassword] = useState('');
    const [resetStep, setResetStep] = useState('request');
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');
    const [particles, setParticles] = useState([]);
    const [floatingHearts, setFloatingHearts] = useState([]);

    useEffect(() => {
        // Ember particles
        const pts = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 12 + 10,
            delay: Math.random() * 8,
            opacity: Math.random() * 0.6 + 0.2,
            driftA: ((Math.random() - 0.5) * 50 * 0.3) + 'px',
            driftB: ((Math.random() - 0.5) * 50 * 0.7) + 'px',
            driftC: ((Math.random() - 0.5) * 50) + 'px',
        }));
        setParticles(pts);

        // Floating hearts
        const hearts = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: Math.random() * 5 + 8,
        }));
        setFloatingHearts(hearts);
    }, []);

    // Prevent the entire page from scrolling while the auth card is displayed (desktop only)
    useEffect(() => {
        const isMobile = window.innerWidth <= 900;
        const originalBodyOverflow = document.body.style.overflow;
        const originalDocOverflow = document.documentElement.style.overflow;
        const originalBodyHeight = document.body.style.height;
        const originalDocHeight = document.documentElement.style.height;

        // Only lock on desktop, allow scrolling on mobile
        if (!isMobile) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.documentElement.style.height = '100vh';
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }

        return () => {
            if (!isMobile) {
                document.body.style.overflow = originalBodyOverflow || 'auto';
                document.documentElement.style.overflow = originalDocOverflow || 'auto';
                document.body.style.height = originalBodyHeight || 'auto';
                document.documentElement.style.height = originalDocHeight || 'auto';
            }
        };
    }, []);

    const getStrength = (val) => {
        let s = 0;
        if (val.length >= 12) s++;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) s++;
        if (/[^A-Za-z0-9]/.test(val)) s++;
        return s;
    };
    const strength = getStrength(pwValue);
    const strengthMeta = [null,
        { label: 'Weak', color: '#d4534f' },
        { label: 'Moderate', color: '#d4a574' },
        { label: 'Strong', color: '#6fa389' },
    ][strength];

    const socialEnabled = true;
    const resetAuth = () => { setAuthError(''); setAuthMessage(''); };
    const resetResetFlow = () => {
        setResetLoading(false);
        setResetError('');
        setResetMessage('');
        setResetEmail('');
        setResetToken('');
        setResetPassword('');
        setResetStep('request');
    };
    const openForgotFlow = () => {
        resetAuth();
        resetResetFlow();
        setShowResetPanel(true);
    };
    const closeForgotFlow = () => {
        resetResetFlow();
        setShowResetPanel(false);
    };

    const requestPasswordReset = async () => {
        if (!resetEmail) {
            setResetError('Please enter your account email.');
            return;
        }
        setResetLoading(true);
        setResetError('');
        setResetMessage('');

        try {
            const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Unable to request password reset');
            setResetStep('confirm');
            setResetMessage('If that email exists, a reset token was initiated. Check your inbox or server logs in development.');
        } catch (e) {
            setResetError(e.message);
        } finally {
            setResetLoading(false);
        }
    };

    const confirmPasswordReset = async () => {
        if (!resetToken || !resetPassword) {
            setResetError('Please enter the reset token and your new password.');
            return;
        }
        setResetLoading(true);
        setResetError('');
        setResetMessage('');

        try {
            const res = await fetch(`${API_BASE_URL}/users/reset-password`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, password: resetPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Unable to reset password');
            setResetMessage(data.message || 'Password reset successful, please sign in.');
            setShowResetPanel(false);
            setAuthMessage('Password reset successful. Please sign in with your new password.');
            resetResetFlow();
        } catch (e) {
            setResetError(e.message);
        } finally {
            setResetLoading(false);
        }
    };

    useEffect(() => {
        if (authMessage && !authError) {
            const timer = setTimeout(() => {
                setAuthMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [authMessage, authError]);

    const handleSocialLogin = (provider) => {
        const providerRoutes = {
            Google: `${API_BASE_URL}/auth/google`,
            Facebook: `${API_BASE_URL}/auth/facebook`
        };
        const authRoute = providerRoutes[provider];

        if (!authRoute) {
            setAuthError(`Unknown social provider: ${provider}`);
            return;
        }

        window.location.href = authRoute;
    };

    useEffect(() => {
        if (authMessage && !authError) {
            const timer = setTimeout(() => {
                setAuthMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [authMessage, authError]);

    const requestUserAuth = async (endpoint, payload) => {
        setAuthLoading(true); setAuthError(''); setAuthMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/users/${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Something went wrong');
            if (endpoint === 'login') {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('authUser', JSON.stringify(data.user));
                onLogin && onLogin(data.user, data.token);
            }
            setAuthMessage(data.message || (endpoint === 'login' ? 'Login successful' : 'Registration successful'));
            return data;
        } catch (e) { setAuthError(e.message); }
        finally { setAuthLoading(false); }
    };

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) { setAuthError('Please enter both email and password.'); return; }
        await requestUserAuth('login', { email: loginEmail, password: loginPassword });
    };
    const handleSignup = async () => {
        if (!signupFirstName || !signupLastName || !signupEmail || !signupPassword) { setAuthError('Please fill in all fields.'); return; }
        if (signupPassword.length < 12) {
            setAuthError('Password must be at least 12 characters');
            return;
        }
        await requestUserAuth('register', { first_name: signupFirstName, last_name: signupLastName, email: signupEmail, password: signupPassword });
    };
    const switchTab = (t) => { resetAuth(); closeForgotFlow(); setTab(t); };

    const GoogleSVG = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
    const FacebookSVG = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );

    return (
        <div style={{ minHeight: '100vh', fontFamily: "'Cormorant Garamond', Georgia, serif", background: '#0a0805' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Cinzel:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
                :root {
                    --rose-red: #a82f2f;
                    --rose-light: #d45353;
                    --gold: #c9a961;
                    --gold-light: #d4b574;
                    --warm-glow: rgba(201,169,97,0.2);
                    --rose-glow: rgba(168,47,47,0.15);
                    --dark-bg: #0a0805;
                    --text-light: #f5f0ed;
                }
                .eau-root { display:flex; min-height:100vh; position:relative; }
                .eau-bg-base { position:fixed; inset:0; background:linear-gradient(135deg,#0a0805 0%,#1a0f05 30%,#2a1410 60%,#1a0f05 100%); z-index:1; }
                .eau-glow-rose { position:fixed; inset:0; background:radial-gradient(ellipse 70% 60% at 30% 50%,rgba(168,47,47,0.12) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 70% 60%,rgba(201,169,97,0.08) 0%,transparent 55%); z-index:2; pointer-events:none; }
                .eau-particle { position:fixed; border-radius:50%; background:radial-gradient(circle,#f4c06a,#e8a44a); z-index:3; pointer-events:none; animation:emberFloat linear infinite; filter:blur(0.6px); box-shadow:0 0 12px rgba(232,164,74,0.6); }
                @keyframes emberFloat {
                    0%   { transform:translateY(0px) translateX(0px) scale(1); opacity:var(--op); }
                    25%  { transform:translateY(-25vh) translateX(var(--dA)) scale(0.9); }
                    50%  { opacity:calc(var(--op)*0.7); }
                    75%  { transform:translateY(-75vh) translateX(var(--dB)) scale(0.6); }
                    100% { transform:translateY(-110vh) translateX(var(--dC)) scale(0.2); opacity:0; }
                }
                .eau-heart-float { position:fixed; font-size:1.5rem; z-index:3; pointer-events:none; animation:heartRise 8s ease-in infinite; opacity:0.3; }
                @keyframes heartRise {
                    0% { transform:translateY(100vh) translateX(0) scale(1); opacity:0; }
                    10% { opacity:0.5; }
                    90% { opacity:0.2; }
                    100% { transform:translateY(-100vh) translateX(var(--drift)) scale(0.6); opacity:0; }
                }
                .eau-layout { position:relative; z-index:10; display:flex; width:100%; min-height:100vh; }
                .eau-left { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem; position:relative; }
                .eau-glow-halo { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(201,169,97,0.06) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; animation:haloPulse 6s ease-in-out infinite; filter:blur(25px); }
                @keyframes haloPulse { 0%,100%{opacity:0.4;transform:translate(-50%,-50%) scale(0.95);} 50%{opacity:0.8;transform:translate(-50%,-50%) scale(1.15);} }
                .eau-candle-icon { display:none; }
                @keyframes candleFlicker {
                    0%,100%{filter:drop-shadow(0 0 25px rgba(201,169,97,0.7)) drop-shadow(0 0 50px rgba(168,47,47,0.3));transform:scaleY(1);}
                    33%{filter:drop-shadow(0 0 35px rgba(212,179,116,0.8)) drop-shadow(0 0 65px rgba(201,169,97,0.4));transform:scaleY(1.02);}
                    66%{filter:drop-shadow(0 0 20px rgba(201,169,97,0.6));transform:scaleY(0.99);}
                }
                .eau-title { font-family:'Cinzel',serif; font-size:3rem; font-weight:500; color:#d4b574; letter-spacing:0.3em; text-shadow:0 0 20px rgba(201,169,97,0.5),0 2px 4px rgba(0,0,0,0.6); margin-bottom:0.3rem; line-height:1; }
                .eau-subtitle { font-family:'Playfair Display',serif; font-style:italic; font-size:1.1rem; color:rgba(212,179,116,0.6); letter-spacing:0.1em; margin-bottom:2rem; }
                .eau-divider { display:flex; align-items:center; gap:0.8rem; margin:0 auto 2rem; width:280px; }
                .eau-div-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(201,169,97,0.4),transparent); }
                .eau-div-gem { width:6px; height:6px; background:#a82f2f; transform:rotate(45deg); }
                .eau-features { display:flex; flex-direction:column; gap:0.8rem; max-width:360px; width:100%; }
                .eau-feat { display:flex; align-items:center; gap:1rem; padding:0.75rem 1rem; background:rgba(168,47,47,0.08); border:1px solid rgba(201,169,97,0.15); border-radius:12px; backdrop-filter:blur(8px); transition:all 0.3s; cursor:default; }
                .eau-feat:hover { background:rgba(201,169,97,0.08); border-color:rgba(201,169,97,0.35); transform:translateX(5px); box-shadow:0 4px 20px rgba(201,169,97,0.1); }
                .eau-feat-ico { width:40px; height:40px; background:rgba(201,169,97,0.12); border:1px solid rgba(201,169,97,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
                .eau-feat-t { font-weight:500; font-size:0.9rem; color:rgba(245,240,237,0.9); display:block; letter-spacing:0.02em; margin-bottom:2px; }
                .eau-feat-s { font-size:0.75rem; color:rgba(212,179,116,0.5); letter-spacing:0.02em; }
                .eau-left-foot { position:absolute; bottom:1.5rem; font-family:'Cinzel',serif; font-size:0.55rem; color:rgba(201,169,97,0.25); letter-spacing:0.3em; text-transform:uppercase; }
                .eau-right { width:500px; flex-shrink:0; display:flex; flex-direction:column; background:rgba(10,8,5,0.75); backdrop-filter:blur(30px) saturate(1.2); -webkit-backdrop-filter:blur(30px) saturate(1.2); border-left:1px solid rgba(201,169,97,0.15); position:relative; height:100vh; overflow-y:auto; overflow-x:hidden; }
                .eau-right::-webkit-scrollbar { width:6px; }
                .eau-right::-webkit-scrollbar-track { background:transparent; }
                .eau-right::-webkit-scrollbar-thumb { background:rgba(201,169,97,0.3); border-radius:3px; }
                .eau-right::-webkit-scrollbar-thumb:hover { background:rgba(201,169,97,0.5); }
                .eau-right-bar { height:3px; background:linear-gradient(90deg,transparent,#c9a961,#d4b574,#c9a961,transparent); animation:barShimmer 5s ease-in-out infinite; }
                @keyframes barShimmer { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
                .eau-right-glow { position:absolute; inset:0; background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(201,169,97,0.08) 0%,transparent 60%); pointer-events:none; }
                .eau-mobile-brand { display:none; padding:1.5rem; text-align:center; border-bottom:1px solid rgba(201,169,97,0.15); }
                .eau-tabs { display:flex; border-bottom:1px solid rgba(201,169,97,0.12); flex-shrink:0; position:relative; z-index:1; }
                .eau-tab { flex:1; padding:1.1rem; background:transparent; border:none; font-family:'Cinzel',serif; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(212,179,116,0.35); cursor:pointer; position:relative; transition:all 0.25s; }
                .eau-tab.active { color:#d4b574; }
                .eau-tab.active::after { content:''; position:absolute; bottom:-1px; left:10%; right:10%; height:2px; background:linear-gradient(90deg,transparent,#c9a961,transparent); border-radius:1px; }
                .eau-tab:hover:not(.active) { color:rgba(212,179,116,0.6); }
                .eau-form { flex:1; padding:2.2rem 2.5rem 2.8rem; display:flex; flex-direction:column; position:relative; z-index:1; opacity:0; animation:formReveal 0.45s ease forwards; }
                @keyframes formReveal { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
                .eau-form-badge { display:inline-flex; align-items:center; gap:0.5rem; background:rgba(168,47,47,0.12); border:1px solid rgba(201,169,97,0.2); border-radius:50px; padding:0.35rem 0.95rem; margin-bottom:1rem; width:fit-content; }
                .eau-badge-pulse { width:6px; height:6px; border-radius:50%; background:#a82f2f; animation:pulse 2s ease infinite; }
                @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.75);} }
                .eau-badge-txt { font-family:'Cinzel',serif; font-size:0.6rem; color:#c9a961; letter-spacing:0.15em; text-transform:uppercase; }
                .eau-form-h { font-weight:300; font-size:2.1rem; color:rgba(245,240,237,0.95); line-height:1.25; margin-bottom:0.35rem; letter-spacing:0.01em; }
                .eau-form-sub { font-family:'Playfair Display',serif; font-style:italic; font-size:0.9rem; color:rgba(212,179,116,0.5); margin-bottom:1.8rem; letter-spacing:0.03em; }
                .eau-social { display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-bottom:1.4rem; }
                .eau-soc-btn { display:flex; align-items:center; justify-content:center; gap:0.6rem; padding:0.8rem; background:rgba(245,240,237,0.04); border:1px solid rgba(201,169,97,0.14); border-radius:12px; color:rgba(212,179,116,0.75); font-family:'Cormorant Garamond',serif; font-size:0.88rem; letter-spacing:0.03em; cursor:pointer; transition:all 0.22s; }
                .eau-soc-btn:hover { background:rgba(201,169,97,0.1); border-color:rgba(201,169,97,0.4); color:#d4b574; transform:translateY(-2px); box-shadow:0 6px 20px rgba(201,169,97,0.12); }
                .eau-soc-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; border-color:rgba(201,169,97,0.1); color:rgba(212,179,116,0.45); }
                .eau-divider { display:flex; align-items:center; gap:0.8rem; margin-bottom:1.4rem; }
                .eau-div-line2 { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(212,179,116,0.15),transparent); }
                .eau-div-txt { font-family:'Playfair Display',serif; font-style:italic; font-size:0.75rem; color:rgba(212,179,116,0.3); white-space:nowrap; letter-spacing:0.04em; }
                .eau-fgroup { margin-bottom:1.1rem; }
                .eau-label { display:flex; align-items:center; gap:0.4rem; font-family:'Cinzel',serif; font-size:0.58rem; letter-spacing:0.18em; text-transform:uppercase; color:rgba(201,169,97,0.6); margin-bottom:0.45rem; }
                .eau-label-line { flex:1; height:1px; background:linear-gradient(90deg,rgba(201,169,97,0.2),transparent); }
                .eau-fw { position:relative; display:flex; align-items:center; }
                .eau-ficon { position:absolute; left:13px; color:rgba(201,169,97,0.45); font-size:14px; pointer-events:none; z-index:1; line-height:1; }
                .eau-input { width:100%; background:rgba(245,240,237,0.04); border:1px solid rgba(212,179,116,0.12); border-radius:12px; padding:0.85rem 0.9rem 0.85rem 2.6rem; font-family:'Cormorant Garamond',serif; font-size:0.92rem; color:rgba(245,240,237,0.9); outline:none; transition:all 0.22s; }
                .eau-input::placeholder { color:rgba(212,179,116,0.25); font-style:italic; font-size:0.86rem; }
                .eau-input:focus { border-color:rgba(201,169,97,0.45); background:rgba(201,169,97,0.08); box-shadow:0 0 0 3px rgba(201,169,97,0.08),0 2px 12px rgba(168,47,47,0.1); }
                .eau-eye { position:absolute; right:12px; background:none; border:none; color:rgba(201,169,97,0.4); font-size:16px; cursor:pointer; padding:2px; transition:color 0.2s; display:flex; align-items:center; }
                .eau-eye:hover { color:#c9a961; }
                .eau-forgot { text-align:right; margin:-0.7rem 0 1.1rem; }
                .eau-forgot-btn { background:none; border:none; font-family:'Cormorant Garamond',serif; font-style:italic; font-size:0.8rem; color:#c9a961; cursor:pointer; padding:0; letter-spacing:0.02em; transition:color 0.2s; text-decoration:underline; text-decoration-color:rgba(201,169,97,0.3); text-underline-offset:2px; }
                .eau-forgot-btn:hover { color:#d4b574; }
                .eau-name-row { display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; }
                .eau-strength { margin:-0.7rem 0 1.1rem; }
                .eau-str-bar { display:flex; gap:4px; margin-bottom:5px; }
                .eau-str-seg { height:3px; flex:1; border-radius:3px; transition:background 0.3s; }
                .eau-str-lbl { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:0.7rem; text-align:right; letter-spacing:0.04em; }
                .eau-msg { display:flex; align-items:center; gap:0.5rem; padding:0.7rem 1rem; border-radius:10px; margin-bottom:1rem; font-family:'Cormorant Garamond',serif; font-size:0.88rem; letter-spacing:0.02em; animation:formReveal 0.3s ease; }
                .eau-msg.err { background:rgba(168,47,47,0.15); border:1px solid rgba(168,47,47,0.3); color:#ff9090; }
                .eau-msg.ok { background:rgba(80,130,100,0.15); border:1px solid rgba(80,130,100,0.3); color:#8fd9a8; }
                .eau-submit { width:100%; padding:1.05rem; background:transparent; border:1.5px solid rgba(201,169,97,0.35); border-radius:12px; color:#d4b574; font-family:'Cinzel',serif; font-size:0.7rem; letter-spacing:0.22em; text-transform:uppercase; cursor:pointer; position:relative; overflow:hidden; transition:all 0.3s; margin-top:auto; }
                .eau-submit::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(201,169,97,0.85),rgba(212,179,116,0.95),rgba(168,47,47,0.7)); opacity:0; transition:opacity 0.3s; }
                .eau-submit:hover::before { opacity:1; }
                .eau-submit:hover { color:#0a0805; border-color:#d4b574; transform:translateY(-2px); box-shadow:0 10px 30px rgba(201,169,97,0.25); }
                .eau-submit:active { transform:translateY(0); }
                .eau-submit:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
                .eau-submit-inner { position:relative; z-index:1; display:flex; align-items:center; justify-content:center; gap:0.6rem; }
                .eau-arr { transition:transform 0.3s; font-size:1rem; }
                .eau-submit:hover .eau-arr { transform:translateX(4px); }
                @keyframes spin { to{transform:rotate(360deg);} }
                .eau-spin { width:14px; height:14px; border:2.5px solid rgba(201,169,97,0.3); border-top-color:currentColor; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
                .eau-terms { text-align:center; font-family:'Cormorant Garamond',serif; font-size:0.76rem; color:rgba(212,179,116,0.3); letter-spacing:0.02em; margin-top:1.2rem; line-height:1.9; }
                .eau-tlink { color:rgba(201,169,97,0.7); background:none; border:none; font-family:inherit; font-size:inherit; cursor:pointer; text-decoration:underline; text-decoration-color:rgba(201,169,97,0.25); text-underline-offset:2px; padding:0; transition:color 0.2s; letter-spacing:inherit; }
                .eau-tlink:hover { color:#d4b574; }
                .eau-ornament { display:flex; align-items:center; justify-content:center; gap:0.8rem; margin-top:1.5rem; opacity:0.2; }
                .eau-orn-line { width:40px; height:1px; background:#c9a961; }
                .eau-orn-txt { font-size:0.5rem; color:#a82f2f; letter-spacing:0.2em; }
                .eau-overlay-lock { position:fixed; inset:0; background:transparent; backdrop-filter:none; z-index:100; pointer-events:none; opacity:0; }
                .eau-success-glow { position:fixed; inset:0; background:radial-gradient(circle at center,rgba(111,163,137,0.15) 0%,transparent 70%); z-index:5; pointer-events:none; animation:successPulse 0.6s ease out; }
                @keyframes successPulse { 0%{opacity:1;} 100%{opacity:0;} }
                @keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @media(max-width:900px){.eau-left{display:none;}.eau-right{width:100%;backdrop-filter:blur(20px);max-height:100vh;height:auto;min-height:100vh;}.eau-mobile-brand{display:block;}}
                @media(max-width:520px){.eau-form{padding:1.6rem 1.4rem 2rem;}.eau-name-row{grid-template-columns:1fr;}}
            `}</style>

            <div className="eau-root">
                <div className="eau-bg-base" />
                <div className="eau-glow-rose" />

                {authLoading && (
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 101,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px',
                        background: 'rgba(10, 8, 5, 0.9)',
                        border: '1px solid rgba(201, 169, 97, 0.4)',
                        borderRadius: '50px',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        animation: 'slideIn 0.3s ease forwards',
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#d4b574',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}></div>
                        <span style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.85rem',
                            color: '#d4b574',
                            letterSpacing: '0.05em',
                        }}>Processing...</span>
                    </div>
                )}

                {authMessage && !authError && (
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 101,
                        padding: '12px 20px',
                        background: 'rgba(80, 130, 100, 0.9)',
                        border: '1px solid rgba(80, 130, 100, 0.5)',
                        borderRadius: '50px',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        color: '#8fd9a8',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.9rem',
                        letterSpacing: '0.02em',
                        animation: 'slideIn 0.3s ease forwards',
                    }}>
                        ✓ {authMessage}
                    </div>
                )}

                {authError && (
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 101,
                        padding: '12px 20px',
                        background: 'rgba(168, 47, 47, 0.9)',
                        border: '1px solid rgba(168, 47, 47, 0.5)',
                        borderRadius: '50px',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        color: '#ff9090',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.9rem',
                        letterSpacing: '0.02em',
                        animation: 'slideIn 0.3s ease forwards',
                    }}>
                        ⚠ {authError}
                    </div>
                )}

                {authMessage && !authError && <div className="eau-success-glow" />}

                {particles.map(p => (
                    <div key={p.id} className="eau-particle" style={{
                        left: p.x + '%', bottom: -(p.size * 2) + 'px',
                        width: p.size, height: p.size,
                        '--op': p.opacity, '--dA': p.driftA, '--dB': p.driftB, '--dC': p.driftC,
                        animationDuration: p.duration + 's',
                        animationDelay: p.delay + 's',
                    }} />
                ))}

                {floatingHearts.map(h => (
                    <div key={h.id} className="eau-heart-float" style={{
                        left: h.left + '%',
                        '--drift': ((Math.random() - 0.5) * 40) + 'px',
                        animationDuration: h.duration + 's',
                        animationDelay: h.delay + 's',
                    }}>❤️</div>
                ))}

                <div className="eau-layout">
                    <div className="eau-left">
                        <div className="eau-glow-halo" />
                        <div style={{ textAlign: 'center', maxWidth: 400 }}>
                            <h1 className="eau-title">Light Up</h1>
                            <p className="eau-subtitle">Love & Celebration</p>
                            <div className="eau-divider">
                                <div className="eau-div-line" />
                                <div className="eau-div-gem" />
                                <div className="eau-div-line" />
                            </div>
                            <div className="eau-features">
                                {[
                                    { i: '🎁', t: 'Perfect for Gifting', s: 'Express your love' },
                                    { i: '🌹', t: 'Rose-Inspired Design', s: 'Luxurious & elegant' },
                                    { i: '✨', t: 'Create Special Moments', s: 'Festival essentials' },
                                    { i: '💝', t: 'Ideal for Loved Ones', s: 'Celebrate together' },
                                ].map((f, idx) => (
                                    <div key={idx} className="eau-feat">
                                        <div className="eau-feat-ico">{f.i}</div>
                                        <div><span className="eau-feat-t">{f.t}</span><span className="eau-feat-s">{f.s}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="eau-left-foot">MAHASU · Premium Candles</p>
                    </div>

                    <div className="eau-right">
                        <div className="eau-right-bar" />
                        <div className="eau-right-glow" />
                        <div className="eau-mobile-brand">
                            <div style={{ fontSize: '2rem' }}>🕯️</div>
                            <p style={{ fontFamily: "'Cinzel',serif", fontSize: '1.3rem', color: '#d4b574', letterSpacing: '0.25em', marginTop: '0.4rem' }}>LIGHT UP</p>
                        </div>
                        <div className="eau-tabs">
                            <button className={"eau-tab" + (tab === 'login' ? ' active' : '')} onClick={() => switchTab('login')}>Sign In</button>
                            <button className={"eau-tab" + (tab === 'signup' ? ' active' : '')} onClick={() => switchTab('signup')}>Create Account</button>
                        </div>

                        {tab === 'login' && (
                            <div className="eau-form" key="login">
                                <div>
                                    <div className="eau-form-badge"><div className="eau-badge-pulse" /><span className="eau-badge-txt">Welcome back</span></div>
                                    <h2 className="eau-form-h">Return to Your<br />Sanctuary</h2>
                                    <p className="eau-form-sub">Your celebration awaits</p>
                                </div>
                                <div className="eau-social">
                                    <button type="button" className="eau-soc-btn" onClick={() => handleSocialLogin('Google')} disabled={!socialEnabled}><GoogleSVG />Google</button>
                                    <button type="button" className="eau-soc-btn" onClick={() => handleSocialLogin('Facebook')} disabled={!socialEnabled}><FacebookSVG />Facebook</button>
                                </div>
                                <div className="eau-divider">
                                    <div className="eau-div-line2" /><span className="eau-div-txt">or sign in with email</span><div className="eau-div-line2" />
                                </div>
                                <div className="eau-fgroup">
                                    <label className="eau-label">Email address<div className="eau-label-line" /></label>
                                    <div className="eau-fw">
                                        <span className="eau-ficon">✉</span>
                                        <input className="eau-input" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                                    </div>
                                </div>
                                <div className="eau-fgroup">
                                    <label className="eau-label">Password<div className="eau-label-line" /></label>
                                    <div className="eau-fw">
                                        <span className="eau-ficon">🔒</span>
                                        <input className="eau-input" type={showLoginPw ? 'text' : 'password'} placeholder="Enter your password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                                        <button className="eau-eye" type="button" onClick={() => setShowLoginPw(p => !p)}>{showLoginPw ? '🙈' : '👁'}</button>
                                    </div>
                                </div>
                                <div className="eau-forgot"><button className="eau-forgot-btn" type="button" onClick={openForgotFlow}>Forgot your password?</button></div>
                                {showResetPanel && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid rgba(201,169,97,0.18)', borderRadius: '18px', background: 'rgba(10,8,5,0.94)' }}>
                                        <p style={{ color: '#d4b574', fontSize: '0.92rem', marginBottom: '0.9rem' }}>
                                            Reset your password securely. Enter your email to receive a reset token.
                                        </p>
                                        {resetStep === 'request' ? (
                                            <>
                                                <div className="eau-fgroup">
                                                    <label className="eau-label">Email address<div className="eau-label-line" /></label>
                                                    <div className="eau-fw">
                                                        <span className="eau-ficon">✉</span>
                                                        <input className="eau-input" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                                                    </div>
                                                </div>
                                                <button className="eau-submit" type="button" onClick={requestPasswordReset} disabled={resetLoading}>
                                                    <div className="eau-submit-inner">{resetLoading ? <><span className="eau-spin" />Sending...</> : <>Send Reset Token<span className="eau-arr">→</span></>}</div>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="eau-fgroup">
                                                    <label className="eau-label">Reset token<div className="eau-label-line" /></label>
                                                    <div className="eau-fw">
                                                        <span className="eau-ficon">🔑</span>
                                                        <input className="eau-input" type="text" placeholder="Enter reset token" value={resetToken} onChange={e => setResetToken(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="eau-fgroup">
                                                    <label className="eau-label">New password<div className="eau-label-line" /></label>
                                                    <div className="eau-fw">
                                                        <span className="eau-ficon">🔒</span>
                                                        <input className="eau-input" type="password" placeholder="Create a new password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} />
                                                    </div>
                                                </div>
                                                <button className="eau-submit" type="button" onClick={confirmPasswordReset} disabled={resetLoading}>
                                                    <div className="eau-submit-inner">{resetLoading ? <><span className="eau-spin" />Resetting...</> : <>Reset Password<span className="eau-arr">→</span></>}</div>
                                                </button>
                                            </>
                                        )}
                                        {resetError && <div className="eau-msg err">⚠ {resetError}</div>}
                                        {resetMessage && <div className="eau-msg ok">✓ {resetMessage}</div>}
                                        <button className="eau-tlink" type="button" onClick={() => resetStep === 'confirm' ? setResetStep('request') : closeForgotFlow()} style={{ marginTop: '0.8rem' }}>
                                            {resetStep === 'confirm' ? 'Request a new token' : 'Cancel reset'}
                                        </button>
                                    </div>
                                )}
                                <button className="eau-submit" type="button" onClick={handleLogin} disabled={authLoading}>
                                    <div className="eau-submit-inner">{authLoading ? <><span className="eau-spin" />Signing in...</> : <>Sign In to Mahasu<span className="eau-arr">→</span></>}</div>
                                </button>
                                <p className="eau-terms">New here? <button className="eau-tlink" onClick={() => switchTab('signup')}>Create a free account</button></p>
                                <div className="eau-ornament"><div className="eau-orn-line" /><span className="eau-orn-txt">❤ ❤ ❤</span><div className="eau-orn-line" /></div>
                            </div>
                        )}

                        {tab === 'signup' && (
                            <div className="eau-form" key="signup">
                                <div>
                                    <div className="eau-form-badge"><div className="eau-badge-pulse" /><span className="eau-badge-txt">Join us</span></div>
                                    <h2 className="eau-form-h">Begin Your<br />Ritual Journey</h2>
                                    <p className="eau-form-sub">Discover warmth in every flame</p>
                                </div>
                                <div className="eau-social">
                                    <button type="button" className="eau-soc-btn" onClick={() => handleSocialLogin('Google')} disabled={!socialEnabled}><GoogleSVG />Google</button>
                                    <button type="button" className="eau-soc-btn" onClick={() => handleSocialLogin('Facebook')} disabled={!socialEnabled}><FacebookSVG />Facebook</button>
                                </div>
                                <div className="eau-divider">
                                    <div className="eau-div-line2" /><span className="eau-div-txt">or sign up with email</span><div className="eau-div-line2" />
                                </div>
                                <div className="eau-name-row">
                                    <div className="eau-fgroup">
                                        <label className="eau-label">First name<div className="eau-label-line" /></label>
                                        <div className="eau-fw"><span className="eau-ficon">👤</span><input className="eau-input" type="text" placeholder="Priya" value={signupFirstName} onChange={e => setSignupFirstName(e.target.value)} /></div>
                                    </div>
                                    <div className="eau-fgroup">
                                        <label className="eau-label">Last name<div className="eau-label-line" /></label>
                                        <div className="eau-fw"><span className="eau-ficon">👤</span><input className="eau-input" type="text" placeholder="Sharma" value={signupLastName} onChange={e => setSignupLastName(e.target.value)} /></div>
                                    </div>
                                </div>
                                <div className="eau-fgroup">
                                    <label className="eau-label">Email address<div className="eau-label-line" /></label>
                                    <div className="eau-fw"><span className="eau-ficon">✉</span><input className="eau-input" type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} /></div>
                                </div>
                                <div className="eau-fgroup">
                                    <label className="eau-label">Password<div className="eau-label-line" /></label>
                                    <div className="eau-fw">
                                        <span className="eau-ficon">🔒</span>
                                        <input className="eau-input" type={showSignupPw ? 'text' : 'password'} placeholder="Create a strong password" value={signupPassword} onChange={e => { setSignupPassword(e.target.value); setPwValue(e.target.value); }} />
                                        <button className="eau-eye" type="button" onClick={() => setShowSignupPw(p => !p)}>{showSignupPw ? '🙈' : '👁'}</button>
                                    </div>
                                </div>
                                {pwValue && (
                                    <div className="eau-strength">
                                        <div className="eau-str-bar">{[1, 2, 3].map(i => <div key={i} className="eau-str-seg" style={{ background: i <= strength ? (strengthMeta ? strengthMeta.color : '#d4b574') : 'rgba(212,179,116,0.1)' }} />)}</div>
                                        {strengthMeta && <div className="eau-str-lbl" style={{ color: strengthMeta.color }}>{strengthMeta.label}</div>}
                                    </div>
                                )}
                                <button className="eau-submit" type="button" onClick={handleSignup} disabled={authLoading}>
                                    <div className="eau-submit-inner">{authLoading ? <><span className="eau-spin" />Creating account...</> : <>Create My Account<span className="eau-arr">→</span></>}</div>
                                </button>
                                <p className="eau-terms">
                                    By joining you agree to our <button className="eau-tlink">Terms</button> &amp; <button className="eau-tlink">Privacy Policy</button>.<br />
                                    Already have an account? <button className="eau-tlink" onClick={() => switchTab('login')}>Sign in</button>
                                </p>
                                <div className="eau-ornament"><div className="eau-orn-line" /><span className="eau-orn-txt">❤ ❤ ❤</span><div className="eau-orn-line" /></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedAuthPage;