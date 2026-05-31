# Login Troubleshooting Guide

## What the 401/404 Errors Actually Mean

### ✅ Good News
- Backend is deployed and responding
- CORS is working correctly  
- Login endpoint exists at `/api/users/login`

### The Real Issues

#### **Issue #1: Invalid Credentials (401)**
```
Backend Response: {"error":"Invalid credentials"}
Status: 401
```

**Why**: The email/password you're trying doesn't exist or is incorrect.

**Fix - Try these steps**:

1. **Register a new test user first**:
   - Go to https://e-commerce-k5cv.vercel.app
   - Click "Signup" tab
   - Fill in ALL fields:
     - First Name: Test
     - Last Name: User
     - Email: testuser@example.com
     - Password: Test@1234 (must have uppercase, number, special char)
   - Click "Create Account"
   
2. **Then try to login with the new credentials**:
   - Click "Login" tab
   - Email: testuser@example.com
   - Password: Test@1234
   - Click "Sign In"

#### **Issue #2: 404 on First Load**
If you see 404 in Console but signup/login eventually work:

**Why**: Browser may show cached errors. This is normal.

**Fix**:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache: DevTools → Application → Clear Storage
- Try in Incognito window (no cache)

---

## How to Verify Everything is Working

### Step 1: Check Browser Network Tab

1. Open your app: https://e-commerce-k5cv.vercel.app
2. Open DevTools: Press `F12` 
3. Go to **Network** tab
4. Try to login
5. Look for request to `login`
6. Check:
   - Request URL: Should be `https://e-commerce-production-1f1f.up.railway.app/api/users/login`
   - Method: Should be `POST`
   - Status: Should be `200` (success) or `401` (wrong password)
   - Request Headers should include:
     - `Content-Type: application/json`
     - `Authorization: Bearer ...` (after first login)
   - Response Headers should include:
     - `Access-Control-Allow-Origin: https://e-commerce-k5cv.vercel.app`
     - `Access-Control-Allow-Credentials: true`

### Step 2: Check Console Errors

1. Open DevTools: Press `F12`
2. Go to **Console** tab
3. Try to login
4. Look for errors:
   - **CORS error?** → Means backend isn't allowing your frontend
   - **JSON parse error?** → Means response isn't valid JSON
   - **401 Unauthorized?** → Means credentials are wrong
   - **No errors?** → Check if token is in localStorage

### Step 3: Verify localStorage

In DevTools Console, paste this:
```javascript
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', JSON.parse(localStorage.getItem('authUser') || '{}'));
```

After successful login, should see token and user data.

---

## Common Scenarios

### Scenario 1: "Failed to load resource: 404"
**Cause**: Browser couldn't reach login endpoint

**Check**:
```javascript
// In DevTools Console, test the endpoint:
fetch('https://e-commerce-production-1f1f.up.railway.app/api/users/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(data => console.log(data))
.catch(e => console.error(e))
```

Expected output: `{error: "Invalid credentials"}` or `{message: "Login successful", token: "..."}`

### Scenario 2: "CORS policy: This origin is not allowed"
**Cause**: Backend rejecting your frontend

**Check**: Backend logs in Railway should show:
```
⚠️ CORS blocked origin: https://e-commerce-k5cv.vercel.app
```

**Fix**: Check if `FRONTEND_URL` is set in Railway:
- Go to Railway Dashboard → Backend → Variables
- Verify `FRONTEND_URL=https://e-commerce-k5cv.vercel.app` exists

### Scenario 3: Login works locally, fails in production
**Cause**: API URL is wrong for production

**Check**: In your app, when deployed:
```javascript
// Should show Railway URL in production
console.log('API URL:', import.meta.env.VITE_API_URL);
```

Expected: `https://e-commerce-production-1f1f.up.railway.app/api`

---

## Testing Credentials

Make sure you have a valid user in the database:

### Option 1: Register New User (Recommended)
1. Click "Signup" tab on login page
2. Use unique email: `test-[random]@example.com`
3. Password must have:
   - At least 8 characters
   - 1 uppercase letter
   - 1 number
4. Click "Create Account"
5. Then login with those credentials

### Option 2: Use Test User (if exists)
If your app has seed data, check documentation for test credentials.

---

## If Still Not Working

Provide me with:

1. **Screenshot of Browser DevTools → Network tab** showing the login request
2. **Screenshot of Browser DevTools → Console** showing any errors
3. **Is localStorage showing token after login?** (Yes/No)
4. **What's the exact error message?**
5. **When does it happen?** (On first try / after multiple attempts / only on signup / etc)

---

## Quick Diagnostics

### Run this in Browser Console:

```javascript
(async () => {
    const API = 'https://e-commerce-production-1f1f.up.railway.app/api';
    
    // Test 1: Health check
    const health = await fetch(API + '/health');
    console.log('Health:', health.status);
    
    // Test 2: Login with test credentials
    const login = await fetch(API + '/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: 'test@example.com', 
            password: 'Test@1234' 
        })
    });
    
    const data = await login.json();
    console.log('Login Status:', login.status);
    console.log('Response:', data);
})();
```

---

## Summary

Your backend is ✅ working and CORS is ✅ configured correctly.

The 401 error means the backend is working - it's just rejecting the credentials.

**Next step**: Try registering a new user first, then logging in with those credentials.
