# 🔐 OAuth 2.0 Authentication System

## 📌 Overview

This backend now includes complete OAuth 2.0 authentication support for:
- ✅ **Google OAuth 2.0**
- ✅ **Facebook OAuth**
- ✅ **JWT Token Generation**
- ✅ **User Auto-Signup**

Compatible with your existing Express backend and MySQL database.

---

## 📚 Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| **OAUTH_QUICKSTART.md** | 5-minute setup guide | You want to get started NOW |
| **OAUTH_SETUP_GUIDE.md** | Complete detailed guide | You need step-by-step instructions |
| **OAUTH_IMPLEMENTATION_SUMMARY.md** | Technical overview | You want to understand the architecture |

**Start here:** `OAUTH_QUICKSTART.md` ⚡

---

## 🎯 What You Can Do Now

### 1. Google OAuth Login
```
User clicks → Redirects to Google → User logs in → 
Backend creates user → Returns JWT token
```

### 2. Facebook OAuth Login
```
User clicks → Redirects to Facebook → User logs in → 
Backend creates user → Returns JWT token
```

### 3. Automatic User Creation
- First OAuth login automatically creates user
- Subsequent logins return existing user
- No password required

### 4. JWT Token System
- All OAuth logins return JWT token
- Token valid for 24 hours
- Same token format as regular login

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

### Step 3: Add Credentials
Generate secrets:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Then add to `.env`:
```env
JWT_SECRET=your-generated-secret-here
SESSION_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=get-from-google-console
GOOGLE_CLIENT_SECRET=get-from-google-console
FACEBOOK_APP_ID=get-from-facebook-developer
FACEBOOK_APP_SECRET=get-from-facebook-developer
```

### Step 4: Get OAuth Credentials

**Google**: https://console.cloud.google.com/
- Create project → Enable Google+ API → Create OAuth Client ID
- Add redirect: `http://localhost:5000/api/auth/google/callback`

**Facebook**: https://developers.facebook.com/
- Create app → Add Facebook Login → Get App ID & Secret
- Add redirect: `http://localhost:5000/api/auth/facebook/callback`

### Step 5: Start Backend
```bash
npm start
```

You should see:
```
✅ Passport configured for Google and Facebook OAuth
🚀 Server running on http://localhost:5000
```

---

## 📁 New Backend Structure

```
backend/
├── config/passport.js              ← OAuth configuration
├── controllers/authController.js   ← OAuth logic
├── routes/auth.js                  ← OAuth endpoints
├── server.js                       ← Updated with Passport
├── .env.example                    ← Updated template
└── Documentation/
    ├── OAUTH_QUICKSTART.md
    ├── OAUTH_SETUP_GUIDE.md
    └── OAUTH_IMPLEMENTATION_SUMMARY.md
```

---

## 🔌 API Endpoints

### Google OAuth
```
GET /api/auth/google
├─ Initiates Google login flow
├─ Frontend redirects user here
└─ Returns: Redirects to Google login

GET /api/auth/google/callback
├─ Google OAuth callback URL
├─ Automatic (user doesn't visit directly)
└─ Returns: JWT token + user data
```

### Facebook OAuth
```
GET /api/auth/facebook
├─ Initiates Facebook login flow
├─ Frontend redirects user here
└─ Returns: Redirects to Facebook login

GET /api/auth/facebook/callback
├─ Facebook OAuth callback URL
├─ Automatic (user doesn't visit directly)
└─ Returns: JWT token + user data
```

### Other Auth Endpoints
```
GET /api/auth/profile
├─ Get authenticated user profile
└─ Returns: User data

POST /api/auth/logout
├─ Logout user
└─ Returns: Success message
```

---

## 💻 Frontend Integration

### HTML: Login Buttons

```html
<!-- Google Login -->
<a href="http://localhost:5000/api/auth/google" class="btn btn-google">
  Sign in with Google
</a>

<!-- Facebook Login -->
<a href="http://localhost:5000/api/auth/facebook" class="btn btn-facebook">
  Sign in with Facebook
</a>
```

### JavaScript: Handle OAuth Response

```javascript
// After successful OAuth, user is returned to your frontend
// The JWT token is included in the response
// Store it for future API calls

const loginWithGoogle = async () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

const loginWithFacebook = async () => {
  window.location.href = 'http://localhost:5000/api/auth/facebook';
};

// OAuth callback response (from backend):
{
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": null
  }
}
```

### React Example

```jsx
import { useEffect } from 'react';

function LoginPage() {
  useEffect(() => {
    // Check if returned from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('authToken', token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div>
      <h2>Login Options</h2>
      
      <a href="http://localhost:5000/api/auth/google">
        <button>Google Login</button>
      </a>
      
      <a href="http://localhost:5000/api/auth/facebook">
        <button>Facebook Login</button>
      </a>
    </div>
  );
}

export default LoginPage;
```

---

## 🔒 Security Features

✅ **Session Security**
- HTTP-only cookies (can't be accessed by JavaScript)
- Secure flag for production (HTTPS only)
- SameSite protection against CSRF

✅ **JWT Security**
- 32-character secrets (minimum recommended)
- HS256 encryption algorithm
- 24-hour expiration time
- User ID + email in token payload

✅ **Database Security**
- Email uniqueness constraint
- SQL parameterized queries (no SQL injection)
- Automatic user creation with OAuth provider

✅ **OAuth Security**
- CORS protection with whitelisted domains
- Credentials support enabled
- Specific HTTP methods allowed

---

## 📊 Database Integration

### Users Table
OAuth users are stored in your existing users table:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),          -- Set to 'oauth' for OAuth users
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  zip_code VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**OAuth User Creation Flow:**
1. User logs in via OAuth
2. Backend receives OAuth profile with email
3. Check if email exists in users table
4. If not, INSERT new user with:
   - Email from OAuth provider
   - First/last name from OAuth profile
   - Password = 'oauth' (not used)
5. Return user + JWT token

---

## 🧪 Testing

### Test Google OAuth Locally
1. Click "Sign in with Google"
2. Authenticate with your Google account
3. Check browser console for token
4. Verify JWT is stored

### Test Facebook OAuth Locally
1. Create test user in Facebook Developer Dashboard
2. Click "Sign in with Facebook"
3. Authenticate with test account
4. Check browser console for token
5. Verify JWT is stored

### Verify Backend is Working
```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"Backend is running!","timestamp":"2024-01-01T..."}
```

---

## 🐛 Troubleshooting

### "Redirect URI mismatch" Error
- Verify exact URI in provider settings
- Check for trailing slashes
- Ensure protocol matches (http/https)

### "Email not provided" Error
- Google: Ensure Google+ API is enabled
- Facebook: Ensure email scope is requested

### Session Not Working
- Verify SESSION_SECRET is set in .env
- Check if cookies are enabled in browser

### Database Error
- Run `node initDatabase.js`
- Verify database credentials in .env

See **OAUTH_SETUP_GUIDE.md** for complete troubleshooting.

---

## 📋 Deployment Checklist

Before going to production:

- [ ] Generate strong JWT_SECRET and SESSION_SECRET
- [ ] Update Google Console with production redirect URI
- [ ] Update Facebook Developer with production redirect URI
- [ ] Set NODE_ENV=production in .env
- [ ] Enable HTTPS (secure cookies require it)
- [ ] Update FRONTEND_URL in .env
- [ ] Test OAuth with production domain
- [ ] Setup SSL/TLS certificate
- [ ] Monitor logs for OAuth errors

---

## 📚 File Reference

### config/passport.js
- Passport strategy configuration
- Google OAuth 2.0 setup
- Facebook OAuth setup
- User serialization

### controllers/authController.js
- `findOrCreateUser()` - User creation logic
- `generateToken()` - JWT token generation
- `googleCallback()` - Google OAuth handler
- `facebookCallback()` - Facebook OAuth handler
- `getUserProfile()` - Get user info
- `logout()` - User logout

### routes/auth.js
- OAuth initialization routes
- OAuth callback routes
- Profile and logout endpoints

### server.js
- Session middleware configuration
- Passport middleware setup
- CORS configuration
- Auth route registration

---

## 🎓 How It Works (Technical)

### 1. User Clicks "Login with Google"
```
Frontend → /api/auth/google (backend)
```

### 2. Passport Redirects to Google
```
Backend → https://accounts.google.com/o/oauth2/v2/auth?...
```

### 3. Google Redirects Back to Callback
```
Google → /api/auth/google/callback (backend with auth code)
```

### 4. Backend Exchanges Code for Profile
```
Passport Strategy exchanges code for access token
Gets user profile (email, name, etc.)
```

### 5. Backend Processes Profile
```
authController.googleCallback() is called
Calls findOrCreateUser(profile, 'google')
Checks if user exists by email
If not: INSERTs new user into database
```

### 6. Backend Generates JWT
```
generateToken() creates JWT
Signed with JWT_SECRET
Includes userId and email
Expires in 24 hours
```

### 7. Backend Returns Response
```
{
  token: "eyJhbGc...",
  user: { id, email, first_name, last_name }
}
```

### 8. Frontend Stores Token
```
localStorage.setItem('authToken', token)
Send with future API requests: Authorization: Bearer {token}
```

---

## 🔄 Mixing OAuth with Regular Login

Your backend supports BOTH:
- Regular login/signup (with username/password)
- OAuth login (Google/Facebook)

Same JWT token format, can be used interchangeably.

---

## 📞 Support Resources

1. **OAUTH_QUICKSTART.md** - Get started in 5 minutes
2. **OAUTH_SETUP_GUIDE.md** - Complete detailed guide
3. **OAUTH_IMPLEMENTATION_SUMMARY.md** - Technical reference
4. This file - Quick overview

---

## ✅ Ready to Deploy!

Your OAuth system is production-ready. Follow **OAUTH_QUICKSTART.md** to get started in 5 minutes!

**Questions?** Check the relevant documentation file above.

---

**Happy coding! 🎉**
