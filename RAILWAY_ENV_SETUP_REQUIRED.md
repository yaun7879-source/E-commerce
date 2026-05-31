# Railway Backend Production Setup - REQUIRED ENVIRONMENT VARIABLES

## ⚠️ CRITICAL: Set These Variables in Railway Dashboard

### Frontend URL Configuration
This is the **MISSING** variable causing CORS failures:

```
FRONTEND_URL=https://e-commerce-k5cv.vercel.app
```

**Location**: Go to Railway Dashboard → Your Project → Backend Service → Variables

**Why**: The backend uses this to determine which origins are allowed to make cross-origin requests. Without it, requests from your Vercel frontend are blocked with a 401 CORS error.

---

## Complete Railway Environment Variables Checklist

### Database Configuration
```
DB_HOST=<railway-mysql-host>
DB_USER=<mysql-username>
DB_PASSWORD=<mysql-password>
DB_NAME=E-commerce
DB_PORT=3306
DATABASE_URL=mysql+pymysql://user:password@host:port/E-commerce
```

### Server Configuration
```
PORT=5001
NODE_ENV=production
```

### Security Keys (Keep Secret!)
```
JWT_SECRET=<generate-long-random-string>
SESSION_SECRET=<generate-long-random-string>
```

### Frontend Connection
```
FRONTEND_URL=https://e-commerce-k5cv.vercel.app
```

### OAuth (Google)
```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://e-commerce-production-1f1f.up.railway.app/api/auth/google/callback
```

### OAuth (Facebook) - Optional
```
FACEBOOK_APP_ID=<your-facebook-app-id>
FACEBOOK_APP_SECRET=<your-facebook-app-secret>
FACEBOOK_CALLBACK_URL=https://e-commerce-production-1f1f.up.railway.app/api/auth/facebook/callback
```

### Payment Gateway (Razorpay)
```
RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

---

## How to Set Variables in Railway

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Select Your Project** → Select Backend Service
3. **Click "Variables"** tab
4. **Click "Add Variable"** for each required variable
5. **Copy-paste exact values** (no extra spaces)
6. **Deploy will auto-restart** after variables are saved

---

## Verification Steps

### After Setting FRONTEND_URL

1. **Test CORS Preflight**:
```bash
curl -X OPTIONS https://e-commerce-production-1f1f.up.railway.app/api/users/login \
  -H "Origin: https://e-commerce-k5cv.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Expected response headers:
```
Access-Control-Allow-Origin: https://e-commerce-k5cv.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token
Access-Control-Allow-Credentials: true
```

2. **Test Actual Login**:
```bash
curl -X POST https://e-commerce-production-1f1f.up.railway.app/api/users/login \
  -H "Origin: https://e-commerce-k5cv.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
```

3. **Check Frontend**: Try logging in from your Vercel app
   - Should see login successful message
   - Token should be saved in localStorage
   - Should redirect to home page

---

## If Login Still Fails

### Check Backend Logs
In Railway Dashboard → Logs tab, look for:

**Expected (Good)**:
```
Server running on port 5001
Database initialized successfully
✅ Request from https://e-commerce-k5cv.vercel.app allowed
```

**Bad (CORS Error)**:
```
⚠️ CORS blocked origin: https://e-commerce-k5cv.vercel.app
```

If you see CORS blocked, the FRONTEND_URL variable isn't set correctly.

### Check Frontend Logs
In browser DevTools → Console, look for:

**Expected (Good)**:
```
Response {status: 200, statusText: "OK"}
```

**Bad**:
```
Response {status: 401, statusText: "Unauthorized"}
Access to fetch at 'https://e-commerce-...' from origin 'https://e-commerce-k5cv.vercel.app' 
has been blocked by CORS policy
```

---

## Common Mistakes

❌ **Wrong**: Setting `FRONTEND_URL=localhost:3000` (local development URL)
✅ **Right**: `FRONTEND_URL=https://e-commerce-k5cv.vercel.app` (production URL)

❌ **Wrong**: Forgetting to redeploy after changing variables
✅ **Right**: Railway automatically redeploys on variable changes

❌ **Wrong**: Setting `NODE_ENV=development` in production
✅ **Right**: `NODE_ENV=production` (enables trust proxy, secure cookies)

---

## Recent Code Changes

The backend code has been updated to:

1. ✅ Apply CORS middleware **before** Helmet security headers
2. ✅ Add explicit preflight handler: `app.options('*', cors(corsOptions))`
3. ✅ Configure Helmet to allow cross-origin requests
4. ✅ Expose Authorization header in CORS response
5. ✅ Add 24-hour preflight caching

The frontend code has been updated to:

1. ✅ Use full Railway URL instead of relative path: `https://e-commerce-production-1f1f.up.railway.app/api`
2. ✅ Add `credentials: 'include'` to all fetch requests
3. ✅ Updated all auth endpoints (login, register, forgot-password, reset-password)

---

## Next Steps

1. **Set FRONTEND_URL in Railway** (CRITICAL!)
2. **Commit code changes** (already done)
3. **Railway auto-deploys** when env vars change
4. **Test login flow** from Vercel frontend
5. **Monitor backend logs** for any errors

---

## Support

If issues persist after setting all variables:

1. Check Railway service logs for errors
2. Verify FRONTEND_URL matches your Vercel domain exactly
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try incognito window (no cache)
5. Check browser Network tab for actual response headers
