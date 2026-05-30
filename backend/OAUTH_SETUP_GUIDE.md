# Google & Facebook OAuth Setup Guide

## 📋 Overview

This guide provides step-by-step instructions to set up Google and Facebook OAuth authentication for your E-commerce backend using Passport.js.

---

## 🔧 Step 1: Install Required Dependencies

Run the following command in your backend directory:

```bash
npm install passport passport-google-oauth20 passport-facebook express-session
```

### Installed Packages:
- **passport**: Authentication middleware for Node.js
- **passport-google-oauth20**: Google OAuth 2.0 authentication strategy
- **passport-facebook**: Facebook OAuth authentication strategy
- **express-session**: Session middleware for Express.js

---

## 🌐 Step 2: Google OAuth Setup

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a new project**:
   - Click on the project dropdown at the top
   - Select "New Project"
   - Enter project name (e.g., "E-commerce OAuth")
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and select "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure consent screen first:
     - Select "External"
     - Fill required fields (App name, User support email, Developer contact)
     - Click "Create"
   - Select "Web application"
   - Add Authorized redirect URIs:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - If deploying to production, also add:
     ```
     https://yourdomain.com/api/auth/google/callback
     ```
   - Click "Create"
   - Copy **Client ID** and **Client Secret**

### 2.2 Add Google Credentials to .env

```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## 👥 Step 3: Facebook OAuth Setup

### 3.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. **Log in or sign up** for a developer account
3. **Create a new app**:
   - Click "My Apps" → "Create App"
   - Choose "Consumer" as app type
   - Fill app name and contact email
   - Click "Create App"

### 3.2 Configure OAuth Settings

1. **Get App ID and App Secret**:
   - Go to "Settings" → "Basic"
   - Copy **App ID** and **App Secret**

2. **Configure Authorized Redirect URIs**:
   - Go to "Settings" → "Basic"
   - Scroll down to "App Domains"
   - Add:
     ```
     localhost:5000
     ```
   - For production:
     ```
     yourdomain.com
     ```

3. **Add Facebook Login Product**:
   - Click "+" next to "Products"
   - Find "Facebook Login"
   - Click "Set Up"
   - Choose "Web"
   - Site URL: `http://localhost:5000` (development)

4. **Configure Redirect URIs in Facebook Login Settings**:
   - Go to "Products" → "Facebook Login" → "Settings"
   - Under "Valid OAuth Redirect URIs", add:
     ```
     http://localhost:5000/api/auth/facebook/callback
     ```
   - For production:
     ```
     https://yourdomain.com/api/auth/facebook/callback
     ```

### 3.2 Add Facebook Credentials to .env

```env
FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
FACEBOOK_APP_SECRET=YOUR_FACEBOOK_APP_SECRET
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

---

## 🔐 Step 4: Configure Session & JWT Secrets

Generate secure secrets:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Add to .env:

```env
JWT_SECRET=your-generated-jwt-secret-here
SESSION_SECRET=your-generated-session-secret-here
```

---

## 📁 Step 5: File Structure

Your backend should now have:

```
backend/
├── config/
│   ├── db.js
│   ├── schema.js
│   └── passport.js          ✅ NEW
├── controllers/
│   ├── authController.js    ✅ NEW
│   ├── cartController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── productController.js
│   ├── reviewController.js
│   └── userController.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js              ✅ NEW
│   ├── cart.js
│   ├── orders.js
│   ├── payment.js
│   ├── products.js
│   ├── reviews.js
│   └── users.js
├── server.js                ✅ UPDATED
├── package.json             ✅ UPDATED
├── .env                     ✅ UPDATED
└── .env.example             ✅ UPDATED
```

---

## 🚀 Step 6: Start Your Backend

```bash
cd backend
npm install
node server.js
```

You should see:
```
✅ Passport configured for Google and Facebook OAuth
🚀 Server running on http://localhost:5000
```

---

## 📲 Step 7: Frontend Integration

### Google OAuth Login Button

```html
<a href="http://localhost:5000/api/auth/google" class="btn btn-google">
  Login with Google
</a>
```

### Facebook OAuth Login Button

```html
<a href="http://localhost:5000/api/auth/facebook" class="btn btn-facebook">
  Login with Facebook
</a>
```

### Handling OAuth Response

After successful OAuth:
- User is redirected to callback URL
- Backend verifies/creates user in database
- JWT token is generated and returned
- Frontend can store token in localStorage

**Expected Response:**

```json
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

---

## 🔌 API Endpoints

### Google OAuth
- **Initiate**: `GET /api/auth/google`
- **Callback**: `GET /api/auth/google/callback`

### Facebook OAuth
- **Initiate**: `GET /api/auth/facebook`
- **Callback**: `GET /api/auth/facebook/callback`

### Additional Endpoints
- **Get Profile**: `GET /api/auth/profile`
- **Logout**: `POST /api/auth/logout`

---

## ✅ Testing OAuth Locally

### Test Google Login
1. Click "Login with Google"
2. Select a Google account
3. Check backend console for `✅ Google OAuth profile received`
4. Verify JWT token in response

### Test Facebook Login
1. Create a test user on Facebook Developer Dashboard:
   - Go to "Roles" → "Test Users"
   - Click "Create Test User"
   - Use test account to login
2. Click "Login with Facebook"
3. Authorize app permissions
4. Check backend console for `✅ Facebook OAuth profile received`
5. Verify JWT token in response

---

## 🔍 Troubleshooting

### Issue: "Invalid Client ID" Error

**Solution**: 
- Verify GOOGLE_CLIENT_ID in .env matches Google Console
- Check NODE_ENV is "development" for localhost

### Issue: "Redirect URI mismatch" Error

**Solution**:
- In Google Console: Exact URI must be `http://localhost:5000/api/auth/google/callback`
- In Facebook App: Domain must be `localhost:5000`
- Check for trailing slashes (they matter!)

### Issue: "Email not provided by OAuth provider" Error

**Solution**:
- In Google: Ensure Google+ API is enabled
- In Facebook: Ensure `email` scope is requested

### Issue: Session not persisting

**Solution**:
- Verify SESSION_SECRET is set in .env
- Check cookies are enabled in browser
- Ensure CORS credentials are allowed

### Issue: Database error during OAuth login

**Solution**:
- Verify users table exists: `SHOW TABLES;`
- Check database connection in .env
- Run: `node initDatabase.js` to initialize tables

---

## 📝 Environment Variables Checklist

Before deploying to production:

- [ ] `JWT_SECRET` - Generated secure key
- [ ] `SESSION_SECRET` - Generated secure key
- [ ] `GOOGLE_CLIENT_ID` - From Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Console
- [ ] `GOOGLE_CALLBACK_URL` - Production URL
- [ ] `FACEBOOK_APP_ID` - From Facebook Developer
- [ ] `FACEBOOK_APP_SECRET` - From Facebook Developer
- [ ] `FACEBOOK_CALLBACK_URL` - Production URL
- [ ] `FRONTEND_URL` - Production frontend URL
- [ ] `NODE_ENV` - Set to "production"

---

## 🔐 Security Best Practices

1. **Never commit .env file** to version control
2. **Rotate secrets** periodically
3. **Use HTTPS in production** (sameSite: 'strict')
4. **Set secure cookie flags** for production
5. **Validate user email** before granting access
6. **Rate limit** OAuth endpoints
7. **Log OAuth events** for debugging
8. **Use strong JWT_SECRET** (minimum 32 characters)

---

## 📚 Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## ✨ Next Steps

1. Test OAuth locally
2. Create logout functionality in frontend
3. Store JWT token in localStorage/sessionStorage
4. Add authorization headers to API requests
5. Implement token refresh mechanism
6. Deploy to production with HTTPS

---

**Happy Coding! 🎉**
