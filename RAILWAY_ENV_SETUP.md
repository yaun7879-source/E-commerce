# 🔧 Railway Backend Environment Variables Setup

## Required Variables for Railway Dashboard

Copy these and set them in Railway dashboard under **Variables**:

```
# Database (Railway MySQL Plugin)
DB_HOST=mysql.railway.internal
DB_USER=<from railway mysql plugin>
DB_PASSWORD=<from railway mysql plugin>
DB_NAME=<from railway mysql plugin>
DB_PORT=3306

# CRITICAL FOR OAUTH REDIRECT - Set these!
NODE_ENV=production
FRONTEND_URL=https://e-commerce-k5cv.vercel.app
PORT=5001

# JWT & Session Secrets (generate new ones)
JWT_SECRET=<run: openssl rand -base64 32>
SESSION_SECRET=<run: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=https://<your-railway-backend-url>/api/auth/google/callback

# Payment
RAZORPAY_KEY_ID=<from Razorpay dashboard>
RAZORPAY_KEY_SECRET=<from Razorpay dashboard>

# Email
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<app-specific password>
EMAIL_SERVICE=gmail
```

## Key Points:
1. **FRONTEND_URL** = Your Vercel frontend URL (e.g., https://e-commerce-k5cv.vercel.app)
2. This redirects user after OAuth login
3. Frontend's App.jsx handles query parameters automatically
4. Token is set in HttpOnly cookie by backend

## How to Set in Railway:
1. Go to Railway Dashboard
2. Select your Backend service
3. Click "Variables"
4. Add/Update all variables above
5. Railway automatically redeploys

## After Deployment:
1. Try Google OAuth login
2. User should redirect to Vercel frontend
3. Frontend extracts user data from query params
4. Token is in HttpOnly cookie (automatic)
