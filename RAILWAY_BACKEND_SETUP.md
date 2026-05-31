# Railway Backend Deployment Guide
# Backend is deployed separately on Railway
# Frontend is on Vercel: e-commerce-k5cv-m7fp1qxbt-yaun7879-sources-projects.vercel.app

## Railway Backend Setup Steps

### Step 1: Create .env.railway file with actual values
```bash
DB_HOST=<railway-mysql-host>
DB_USER=<railway-mysql-user>
DB_PASSWORD=<railway-mysql-password>
DB_NAME=<railway-db-name>
DB_PORT=3306

JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

GOOGLE_CLIENT_ID=<your-google-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>
GOOGLE_CALLBACK_URL=https://<railway-backend-url>/api/auth/google/callback

RAZORPAY_KEY_ID=<your-key>
RAZORPAY_KEY_SECRET=<your-secret>

EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>
EMAIL_SERVICE=gmail

FRONTEND_URL=https://e-commerce-k5cv-m7fp1qxbt-yaun7879-sources-projects.vercel.app
NODE_ENV=production
PORT=5001
```

### Step 2: Fix CORS for Vercel Frontend
Update backend/server.js CORS to include Vercel domain

### Step 3: Deploy Backend Dockerfile to Railway
Use backend/Dockerfile (not root Dockerfile)

### Step 4: Configure Railway Variables
Add all .env.railway variables in Railway Dashboard
