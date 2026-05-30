# 🚀 OAuth Setup - Quick Start Guide

## ⚡ Quick Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Dependencies added:
# - passport (^0.7.0)
# - passport-google-oauth20 (^2.0.0)
# - passport-facebook (^3.0.0)
# - express-session (^1.19.0)
```

## 📋 One-Time Setup (5 minutes)

### 1️⃣ Copy and Update .env

```bash
cp .env.example .env
```

Then edit `.env` and add:

```env
# Generate these with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<your-generated-key>
SESSION_SECRET=<your-generated-key>

# From Google Console
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# From Facebook Developer App
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
```

### 2️⃣ Create Google OAuth Credentials (5 min)

Go to: https://console.cloud.google.com/

```
1. Create New Project → "E-commerce OAuth"
2. APIs & Services → Library → Search "Google+ API" → Enable
3. Credentials → Create OAuth Client ID
4. Type: Web Application
5. Add Redirect URI: http://localhost:5000/api/auth/google/callback
6. Copy Client ID and Secret → paste in .env
```

### 3️⃣ Create Facebook OAuth Credentials (5 min)

Go to: https://developers.facebook.com/

```
1. My Apps → Create App
2. App Type: Consumer
3. Settings → Basic → Copy App ID & App Secret
4. Products → Add Facebook Login
5. Settings → Valid OAuth URIs: http://localhost:5000/api/auth/facebook/callback
6. Copy App ID and Secret → paste in .env
```

## ✅ Verify Installation

```bash
# Start backend
npm start

# You should see:
# ✅ Passport configured for Google and Facebook OAuth
# 🚀 Server running on http://localhost:5000
```

Test endpoints:
- http://localhost:5000/api/auth/google
- http://localhost:5000/api/auth/facebook
- http://localhost:5000/api/health

## 📁 New Files Created

```
backend/
├── config/passport.js              ← OAuth configuration
├── controllers/authController.js   ← OAuth logic
├── routes/auth.js                  ← OAuth routes
├── .env                            ← Add credentials here
├── .env.example                    ← Template (updated)
└── server.js                       ← Updated with Passport
```

## 🔗 OAuth Routes

### Google OAuth
```
Initiate:  GET /api/auth/google
Callback:  GET /api/auth/google/callback (automatic)
Response:  JWT token + user data
```

### Facebook OAuth
```
Initiate:  GET /api/auth/facebook
Callback:  GET /api/auth/facebook/callback (automatic)
Response:  JWT token + user data
```

## 💻 Frontend Integration Example

```html
<!-- Login with Google -->
<a href="http://localhost:5000/api/auth/google">
  <button>Sign in with Google</button>
</a>

<!-- Login with Facebook -->
<a href="http://localhost:5000/api/auth/facebook">
  <button>Sign in with Facebook</button>
</a>
```

After successful login, you'll receive:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env or kill process using `lsof -ti:5000 \| xargs kill` |
| Redirect URI mismatch | Verify exact URL in Google/Facebook settings matches .env |
| Database error | Run `node initDatabase.js` to create tables |
| Email not provided | Ensure scopes include `email` (already configured) |

## 📚 Full Setup Guide

For detailed setup instructions, see: `OAUTH_SETUP_GUIDE.md`

---

**Ready to go! 🎉**
