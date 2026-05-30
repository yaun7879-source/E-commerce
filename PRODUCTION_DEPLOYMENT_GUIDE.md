# Pre-Deployment Checklist & Quick Start Guide

## 📋 Pre-Deployment Verification (1 week before launch)

### 🔐 Security Verification
- [ ] All console.log statements removed (except development)
- [ ] SESSION_SECRET environment variable is unique and 32+ chars
- [ ] JWT_SECRET environment variable is unique and 32+ chars
- [ ] Database user is NOT root (use dedicated user with limited permissions)
- [ ] Database user password is strong (16+ chars, mixed case, numbers, symbols)
- [ ] CORS configured for frontend domain only (not wildcard)
- [ ] HTTPS enforced on frontend (HTTP redirects to HTTPS)
- [ ] SQL queries all use parameterized queries (✅ Verified)
- [ ] Password hashing uses bcryptjs (✅ Verified)
- [ ] JWT tokens expire (✅ 24h configured)
- [ ] Secure cookies configured (httpOnly, secure flag, sameSite)
- [ ] CSRF protection enabled on state-changing endpoints
- [ ] Rate limiting configured on auth endpoints
- [ ] Account lockout mechanism implemented
- [ ] Security headers enabled (Helmet.js ✅ configured)
- [ ] XSS protection enabled (xss-clean ✅ configured)

### 🗄️ Database Verification
- [ ] Database indexes created on key columns:
  - [ ] `idx_users_email` (unique)
  - [ ] `idx_products_category`
  - [ ] `idx_products_price`
  - [ ] `idx_cart_user_id`
  - [ ] `idx_orders_user_id`
- [ ] Foreign key constraints enforced
- [ ] Database has regular backup schedule (daily)
- [ ] Backup restore procedure tested
- [ ] Database connection pooling configured (10 connections ✅)
- [ ] Database user permissions restricted
- [ ] Character set is UTF8MB4 (emoji support)

### 🔗 API & Backend Verification
- [ ] `.env` file created with production values
- [ ] `.env.example` created and documented
- [ ] Health check endpoint working (`/api/health`)
- [ ] All routes return proper error responses (no 500 defaults)
- [ ] API endpoints have proper authentication checks
- [ ] Authorization (role-based access) implemented
- [ ] Input validation on all endpoints
- [ ] File upload size limits set (10KB for JSON bodies)
- [ ] Request logging configured (Morgan ✅)
- [ ] Error logging configured (Winston ✅)
- [ ] Razorpay keys configured and tested
- [ ] Email service tested (forgot password flow)
- [ ] OAuth credentials configured (Google, Facebook)

### 🎨 Frontend Verification
- [ ] React build created (`npm run build`)
- [ ] Build size checked and optimized
- [ ] All hardcoded localhost URLs removed/configurable
- [ ] API_BASE_URL points to production API
- [ ] Environment variables in Vite `.env` files
- [ ] Error boundaries implemented
- [ ] Console.logs in React components removed
- [ ] All images have alt text
- [ ] Critical images optimized
- [ ] Service worker configured (if PWA)
- [ ] Analytics configured
- [ ] Error tracking (Sentry) configured

### 🐳 DevOps & Infrastructure
- [ ] Docker images built and tested
- [ ] docker-compose.yml working (all services)
- [ ] Environment variables in compose file
- [ ] SSL/TLS certificate obtained (Let's Encrypt)
- [ ] Nginx config has security headers
- [ ] Nginx has gzip compression enabled
- [ ] Database backups automated (via cron/docker)
- [ ] Logging aggregation configured
- [ ] Monitoring/alerting configured
- [ ] Uptime monitoring configured
- [ ] Auto-restart on crash enabled
- [ ] Resource limits configured

### 🧪 Testing Verification
- [ ] Database migration tested
- [ ] User registration tested
- [ ] User login tested
- [ ] OAuth login tested (Google)
- [ ] Add to cart tested
- [ ] Checkout tested
- [ ] Payment flow tested (staging environment)
- [ ] Forgot password tested
- [ ] Rollback procedure documented and tested
- [ ] Disaster recovery plan documented

---

## 🚀 Deployment Day Checklist (Day of Launch)

### ✋ Before Starting (6 hours before)
- [ ] Final code review completed
- [ ] All tests passing
- [ ] Latest code merged to main branch
- [ ] Database backup taken
- [ ] Staging environment verified
- [ ] Team notified and on standby
- [ ] Rollback plan communicated
- [ ] Customer support briefed on changes

### 🔧 Deployment Execution
```bash
# 1. Pull latest code
cd /path/to/deployment
git pull origin main

# 2. Verify environment
echo "NODE_ENV: $NODE_ENV"
echo "FRONTEND_URL: $FRONTEND_URL"
echo "DATABASE: $DB_HOST:$DB_PORT/$DB_NAME"

# 3. Build images
docker build -t mahasu-api:v1.0 ./backend
docker build -t mahasu-web:v1.0 ./my-app

# 4. Stop old containers gracefully
docker-compose down --remove-orphans

# 5. Start new containers
docker-compose -f docker-compose.yml up -d

# 6. Wait for services to be ready
sleep 10

# 7. Run health checks
echo "Checking API health..."
curl -f http://localhost:5001/api/health || exit 1

echo "Checking Frontend..."
curl -f http://localhost:80 || exit 1

# 8. Verify database
docker exec mahasu_db mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) as products FROM products;"

# 9. Check logs
docker logs mahasu_api --tail 50
docker logs mahasu_web --tail 50
```

### ✅ Post-Deployment Verification (Smoke Tests)
- [ ] API health check responding
- [ ] Frontend loading successfully
- [ ] SSL/TLS certificate valid
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Authentication working
- [ ] Payment gateway integrated
- [ ] Email sending working
- [ ] Error logging working

### 📊 Monitoring (First 24 hours)
- [ ] Monitor error logs hourly
- [ ] Monitor database performance
- [ ] Monitor API response times
- [ ] Monitor frontend load times
- [ ] Check user signups/logins
- [ ] Monitor payment transactions
- [ ] Check for performance degradation
- [ ] Verify backups are running

---

## 📦 Configuration Files

### backend/.env (Production Template)
```bash
# Database
DB_HOST=prod-db.example.com
DB_PORT=3306
DB_USER=mahasu_prod_user
DB_PASSWORD=STRONG_RANDOM_PASSWORD_MIN_20_CHARS
DB_NAME=mahasu_ecommerce

# Server
NODE_ENV=production
PORT=5001

# Security (Generate new random values!)
JWT_SECRET=generate_32_random_chars_like_7kR9mNpQx2vWsL4jTuFhYzDcVbAeIoGu
SESSION_SECRET=generate_32_random_chars_different_from_jwt_secret

# OAuth - Google
GOOGLE_CLIENT_ID=XXXXXXXXXXXX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# OAuth - Facebook
FACEBOOK_APP_ID=XXXXXXXXXXXXX
FACEBOOK_APP_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FACEBOOK_CALLBACK_URL=https://yourdomain.com/api/auth/facebook/callback

# Payment
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Email
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your_email_app_password

# URLs
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

### my-app/.env.production
```bash
VITE_API_URL=https://yourdomain.com/api
```

### my-app/nginx.conf (Security Headers)
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # HTTP to HTTPS redirect
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    root /usr/share/nginx/html;
    index index.html;

    # API Proxy
    location /api {
        proxy_pass http://backend:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔄 Rollback Procedure

If critical issues occur after deployment:

```bash
# 1. Stop current deployment
docker-compose down

# 2. Restore previous images (if tagged)
docker tag mahasu-api:v0.9.9 mahasu-api:latest
docker tag mahasu-web:v0.9.9 mahasu-web:latest

# 3. Restore database backup
mysql -u root -p $DB_NAME < /backups/mahasu_ecommerce_backup_$(date -d '1 day ago' +%Y%m%d).sql

# 4. Start rollback version
docker-compose -f docker-compose.yml up -d

# 5. Verify
curl http://localhost:5001/api/health

# 6. Notify team
echo "Rollback complete. Investigating issue..."
```

---

## 📞 Post-Launch Monitoring

### Weekly
- [ ] Review error logs
- [ ] Check database growth
- [ ] Monitor query performance
- [ ] Review user feedback
- [ ] Check payment success rate

### Monthly
- [ ] Database backup integrity check
- [ ] Security audit log review
- [ ] Performance analysis
- [ ] Dependency updates
- [ ] Cost optimization review

### Quarterly
- [ ] Full security audit
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Architecture review
- [ ] Capacity planning

---

## 🆘 Emergency Contacts

- **Critical Issues:** [Your escalation contact]
- **Database Issues:** [DBA contact]
- **Payment Issues:** [Payment team contact]
- **Customer Support:** [Support lead contact]

---

**Ready for production deployment!** 🚀
