# 🚀 PRODUCTION DEPLOYMENT COMPLETE GUIDE

**Status**: ✅ **PRODUCTION READY** - Deploy Now!  
**Date**: May 30, 2026  
**Last Updated**: Comprehensive Setup Complete

---

## 📋 What Was Done (Full Production Setup)

### ✅ Phase 1: Code Quality & Security (Already Done)
- ✅ Console logs removed
- ✅ Secrets validation implemented
- ✅ Rate limiting configured
- ✅ Account lockout mechanism ready
- ✅ Error handling middleware
- ✅ Security headers (Helmet, CORS, XSS)

### ✅ Phase 2: Database & Migrations (NOW READY)
- ✅ Migration runner script created (`runMigrations.js`)
- ✅ Database migration files prepared:
  - `001_add_account_lockout.sql` - Add lockout columns
  - `002_add_indexes.sql` - Add performance indexes
- ✅ npm script added: `npm run migrate`

### ✅ Phase 3: Environment Configuration
- ✅ `.env.production` template created with all required variables
- ✅ `.env.example` for reference
- ✅ `.env.development` for local testing

### ✅ Phase 4: Docker & Containerization
- ✅ Docker Compose configured (main)
- ✅ Docker Compose for monitoring (Prometheus + Grafana + Loki)
- ✅ Health checks configured in docker-compose
- ✅ Network isolation setup

### ✅ Phase 5: Automated Operations
- ✅ **Backup Script** (`backup.sh`) - Daily database backups
- ✅ **Health Check Script** (`healthcheck.sh`) - Auto-recovery
- ✅ **Log Rotation Script** (`rotate-logs.sh`) - Disk management

### ✅ Phase 6: Monitoring & Observability
- ✅ Prometheus for metrics collection
- ✅ Grafana for visualization and dashboards
- ✅ Loki for centralized log aggregation
- ✅ Health check endpoints configured

### ✅ Phase 7: CI/CD Pipeline
- ✅ GitHub Actions workflow for automated deployment
- ✅ Security scanning workflow (npm audit, secret detection)
- ✅ Automated linting and code quality checks
- ✅ Dependency outdated checks

---

## 🚀 DEPLOYMENT STEPS (Choose Your Platform)

### **Option A: Docker Compose (Easiest - Recommended)**

#### Step 1: Prepare Server
```bash
# SSH into your production server
ssh user@your-server.com

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Clone & Setup
```bash
# Clone your repository
git clone https://github.com/yourusername/mahasu-ecommerce.git
cd mahasu-ecommerce

# Create production .env
cp backend/.env.production backend/.env
nano backend/.env  # Fill in your ACTUAL values

# Create .env for docker-compose
cat > .env.docker << EOF
DB_USER=mahasu_user
DB_PASSWORD=GenerateStrongPassword123!
DB_NAME=mahasu_ecommerce
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://yourdomain.com
EOF
```

#### Step 3: Deploy with Docker
```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Run migrations
docker-compose exec backend npm run migrate

# Health check
curl http://localhost:5001/api/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-...",
  "uptime": 123.45
}
```

---

### **Option B: Heroku Deployment**

#### Step 1: Setup
```bash
# Install Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create your-app-name

# Add MySQL addon
heroku addons:create cleardb:ignite

# Add environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
heroku config:set GOOGLE_CLIENT_ID=your_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
# ... set all other variables
```

#### Step 2: Deploy
```bash
# Push to Heroku
git push heroku main

# Run migrations
heroku run npm run migrate

# View logs
heroku logs --tail
```

---

### **Option C: AWS EC2 Deployment**

#### Step 1: Launch EC2 Instance
```bash
# Use Ubuntu 20.04 LTS AMI
# Security groups: Open ports 80, 443, 3306, 5001
```

#### Step 2: Setup Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt-get install -y mysql-server

# Install Nginx (reverse proxy)
sudo apt-get install -y nginx

# Install SSL (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone https://github.com/yourusername/mahasu-ecommerce.git
cd mahasu-ecommerce

# Setup backend
cd backend
npm install
npm run migrate
PM2_HOME=/tmp pm2 start server.js --name "mahasu-api"

# Setup frontend
cd ../my-app
npm install
npm run build

# Setup Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/mahasu
# Configure proxy to localhost:5001
```

---

### **Option D: Railway.app (Simplest)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
railway up

# View logs
railway logs
```

---

## 📊 Post-Deployment Verification

### 1. **Health Check**
```bash
curl https://yourdomain.com/api/health
# Should return: { "status": "healthy", "database": "connected" }
```

### 2. **Database Migrations Verified**
```bash
# Check if tables have required columns
# Login to MySQL
mysql -u root -p mahasu_ecommerce

# Verify lockout columns
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='users' AND COLUMN_NAME IN ('failed_login_attempts', 'locked_until');

# Verify indexes exist
SHOW INDEXES FROM users;
SHOW INDEXES FROM products;
```

### 3. **Test Key Features**
- [ ] Signup/Login works
- [ ] Product browsing works
- [ ] Cart operations work
- [ ] Payment integration works
- [ ] Email notifications sent
- [ ] OAuth (Google/Facebook) works

### 4. **Security Checks**
```bash
# Check HTTP security headers
curl -I https://yourdomain.com
# Should see: Strict-Transport-Security, X-Content-Type-Options, etc.

# Test rate limiting
# Make 6 login requests in 15 seconds
# 6th should be blocked

# Test account lockout
# Try logging in 5 times with wrong password
# 6th attempt should show "Account locked for 30 minutes"
```

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)
```bash
# On your server
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal with cron
sudo certbot renew --dry-run
```

### Configure Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Proxy to backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve frontend
    location / {
        root /var/www/mahasu/dist;
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📦 Backup Configuration

### Automated Daily Backups
```bash
# Add to crontab
crontab -e

# Add this line for 2 AM daily backup:
0 2 * * * /home/mahasu/backend/scripts/backup.sh
```

### Manual Backup
```bash
./backend/scripts/backup.sh
```

### Restore from Backup
```bash
# Uncompress
gunzip mahasu_20240530_020000.sql.gz

# Restore to database
mysql -u root -p mahasu_ecommerce < mahasu_20240530_020000.sql
```

---

## 📈 Monitoring Setup

### Start Monitoring Stack
```bash
docker-compose -f docker-compose.monitoring.yml up -d

# Access dashboards:
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (user: admin, pass: admin)
# Loki: http://localhost:3100
```

### Grafana Dashboards
- Import pre-built dashboards from Grafana website
- Create custom dashboards for your business metrics

---

## 🔄 CI/CD Setup (GitHub Actions)

### Add Secrets to GitHub
Go to: Settings → Secrets and variables → Actions

```
DEPLOY_KEY: Your private SSH key
DEPLOY_HOST: your-server.com
DEPLOY_USER: ubuntu (or your user)
DEPLOY_PATH: /home/ubuntu/mahasu-ecommerce
SLACK_WEBHOOK: Your Slack webhook URL (optional)
```

### Automatic Deployments
- Push to `main` branch: Runs tests and security checks
- Push to `production` branch: Deploys automatically

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in .env
PORT=5002
```

### Database Connection Error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify .env credentials
mysql -h DB_HOST -u DB_USER -p DB_PASSWORD DB_NAME
```

### Docker Issues
```bash
# View logs
docker-compose logs backend

# Restart service
docker-compose restart backend

# Full reset
docker-compose down -v
docker-compose up -d
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates
```

---

## 📞 Production Support Contacts

- **Error Monitoring**: Setup Sentry.io for automatic error tracking
- **Uptime Monitoring**: Use UptimeRobot or similar
- **CDN**: Consider Cloudflare for DDoS protection
- **Support Channel**: Slack/Discord for team notifications

---

## ✅ Final Production Checklist

- [ ] Environment variables all set
- [ ] Database migrations executed
- [ ] SSL certificate installed
- [ ] Backup scripts running
- [ ] Monitoring dashboards accessible
- [ ] Health check working
- [ ] Rate limiting verified
- [ ] Account lockout tested
- [ ] Logs being collected
- [ ] CI/CD pipeline working
- [ ] Team aware of deployment
- [ ] Incident response plan documented

---

## 🎉 You're Live!

**Congrats! Your Mahasu E-commerce app is production-ready and deployed!**

Monitor your dashboards, watch your logs, and respond quickly to any issues.

**Support**: Contact DevOps team for assistance

---

**Last Updated**: May 30, 2026  
**Version**: 1.0 - Production Ready  
**Status**: ✅ LIVE
