# 🚀 E-Commerce Application - Production Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Docker & Docker Compose (version 20.10+)
- Git
- A registered domain name
- SSL certificate (Let's Encrypt recommended)
- MySQL 8.0+ (if not using Docker)
- Node.js 20+ (if running without Docker)

### External Services Required
- **Google OAuth:** [Google Cloud Console](https://console.cloud.google.com/)
- **Facebook OAuth:** [Facebook Developers](https://developers.facebook.com/)
- **Razorpay:** Payment gateway account
- **Email Service:** SendGrid, Gmail, or Mailgun
- **Hosting:** AWS, DigitalOcean, Heroku, or own server

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users (Internet)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│              - SSL/TLS Termination                           │
│              - Rate Limiting                                 │
│              - Static File Serving                           │
│              - API Routing                                   │
└──────────────┬──────────────────────────────┬────────────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ React Frontend   │          │   Node.js API    │
    │ (Vite Build)     │          │   (Express)      │
    │ Port: 80         │          │   Port: 5001     │
    └──────────────────┘          └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  MySQL Database  │
                                  │   Port: 3306     │
                                  └──────────────────┘
```

---

## Environment Setup

### 1. Clone Repository and Configure Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd E-commerce

# Create .env file in backend
cat > backend/.env << 'EOF'
# Database
DB_HOST=localhost
DB_USER=mahasu_user
DB_PASSWORD=your_secure_password
DB_NAME=ecommerce_db
DB_PORT=3306
DB_CONNECTION_LIMIT=10

# Server
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# JWT & Session
JWT_SECRET=generate_a_long_random_string_here
SESSION_SECRET=generate_another_random_string_here

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://yourdomain.com/api/auth/facebook/callback

# Payment
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourdomain.com
EOF

# Create .env file in frontend
cat > my-app/.env << 'EOF'
VITE_API_URL=https://yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
EOF
```

### 2. Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Option A: Docker (Recommended for Production)

Database is automatically set up in docker-compose.yml

### Option B: Standalone MySQL Server

```bash
# Create database and user
mysql -u root -p << 'EOF'
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mahasu_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'mahasu_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import initial schema
mysql -u mahasu_user -p ecommerce_db < backend/database_schema.sql
```

---

## Deployment Options

### Option 1: Docker Compose Deployment (Recommended)

```bash
# 1. Build all images
docker-compose build

# 2. Start services in production mode
docker-compose -f docker-compose.yml up -d

# 3. Verify all services are running
docker-compose ps

# 4. Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Option 2: Manual Deployment (Without Docker)

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install --production

# Set environment variables
export NODE_ENV=production
export JWT_SECRET=your_secret
# ... set all other env vars

# Run database migrations
node initDatabase.js

# Start the server
node server.js

# Or use PM2 for production process management
npm install -g pm2
pm2 start server.js --name "mahasu-api"
pm2 save
pm2 startup
```

#### Frontend Setup

```bash
cd my-app

# Install dependencies
npm install

# Build optimized production bundle
npm run build

# Serve with a static server or reverse proxy
# Option 1: Using serve package
npx serve -s dist -l 3000

# Option 2: Using Nginx (recommended)
# Configure nginx to serve files from dist/ folder
```

### Option 3: Cloud Deployment

#### AWS ECS/Fargate
```bash
# Build and push images to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin your-ecr-url
docker build -t mahasu-api:latest ./backend
docker tag mahasu-api:latest your-ecr-url/mahasu-api:latest
docker push your-ecr-url/mahasu-api:latest

# Create ECS task definition and service
# Configure load balancer and auto-scaling
```

#### Heroku
```bash
# Install Heroku CLI
npm i -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Add Procfile
echo "web: node server.js" > Procfile

# Set environment variables
heroku config:set JWT_SECRET=your_secret
# ... set all other vars

# Deploy
git push heroku main
```

---

## SSL/TLS Setup

### Using Nginx with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Update nginx configuration
sudo nano /etc/nginx/sites-available/default

# Add SSL configuration:
# listen 443 ssl http2;
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
# ssl_protocols TLSv1.2 TLSv1.3;

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx

# Auto-renew certificates
sudo certbot renew --dry-run
```

---

## Post-Deployment

### 1. Verify Application Health

```bash
# Check health endpoints
curl -I https://yourdomain.com/health
curl -I https://yourdomain.com/api/health

# Test basic functionality
curl https://yourdomain.com/api/products

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### 2. Set Up Backups

```bash
# Automated daily database backup
0 2 * * * mysqldump -u mahasu_user -p"$DB_PASSWORD" ecommerce_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### 3. Configure Monitoring

```bash
# Install and configure PM2+ monitoring
pm2 install pm2-auto-pull
pm2 save

# Or use external services:
# - New Relic
# - DataDog
# - Sentry for error tracking
# - LogRocket for session replay
```

---

## Monitoring

### Key Metrics to Monitor

- **Application:**
  - Response times
  - Error rates
  - CPU/Memory usage
  - Database connection pool
  
- **Database:**
  - Query performance
  - Connection pool status
  - Disk usage
  - Backup success

- **Infrastructure:**
  - Disk space
  - Network I/O
  - SSL certificate expiration
  - Uptime

### Set Up Alerts

```bash
# CPU usage > 80%
# Memory usage > 85%
# Disk usage > 90%
# Response time > 2s
# Error rate > 1%
# SSL cert expiration < 14 days
```

---

## Troubleshooting

### Docker Issues

```bash
# View logs
docker-compose logs backend

# Restart service
docker-compose restart backend

# Rebuild specific service
docker-compose build --no-cache backend

# Clean up unused volumes
docker volume prune
```

### Database Connection Issues

```bash
# Test connection
mysql -h db -u mahasu_user -p"$DB_PASSWORD" ecommerce_db -e "SELECT 1"

# Check user privileges
mysql -u root -p << 'EOF'
SHOW GRANTS FOR 'mahasu_user'@'localhost';
EOF
```

### Performance Issues

```bash
# Check slow queries
mysql -u mahasu_user -p << 'EOF'
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
EOF

# Analyze table
ANALYZE TABLE orders;
OPTIMIZE TABLE products;
```

### SSL Certificate Issues

```bash
# Check certificate details
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Force certificate renewal
certbot renew --force-renewal
```

---

## Performance Optimization

### Backend
- Use Redis for caching
- Implement query optimization
- Enable database query indexing
- Use connection pooling

### Frontend
- Enable Gzip compression (nginx)
- Use CDN for static assets
- Code splitting and lazy loading
- Image optimization

### Database
- Add indexes on frequently queried columns
- Archive old data
- Regular vacuuming
- Query optimization

---

## Rollback Procedure

```bash
# If deployment fails:

# 1. Stop current deployment
docker-compose down

# 2. Checkout previous version
git checkout <previous-tag>

# 3. Rebuild and restart
docker-compose build
docker-compose up -d

# 4. Verify services
docker-compose ps
curl https://yourdomain.com/health
```

---

## Maintenance Tasks

### Weekly
```bash
# Check logs for errors
docker-compose logs --since 7d | grep ERROR

# Verify backups exist
ls -la /backups/
```

### Monthly
```bash
# Update dependencies
npm update --save

# Security scan
npm audit

# Database maintenance
# ANALYZE and OPTIMIZE tables
```

### Quarterly
```bash
# Full disaster recovery test
# Security penetration testing
# Performance benchmarking
```

---

## Support & Escalation

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review monitoring dashboard
3. Contact DevOps team
4. Escalate to CTO if critical

---

**Last Updated:** May 2026  
**Document Version:** 1.0  
**Maintained By:** DevOps Team
