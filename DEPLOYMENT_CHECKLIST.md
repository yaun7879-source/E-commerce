# E-Commerce Application - Production Deployment Checklist

## ✅ PRE-DEPLOYMENT (1-2 weeks before launch)

### Code Quality & Security
- [ ] All console.logs removed from production code
- [ ] No hardcoded secrets, API keys, or credentials in code
- [ ] All dependencies updated to latest secure versions
- [ ] Security headers configured (helmet.js, CORS, CSP)
- [ ] SQL injection prevention verified (parameterized queries)
- [ ] XSS protection verified (input sanitization)
- [ ] CSRF tokens implemented on state-changing operations
- [ ] Authentication/Authorization properly implemented
- [ ] Rate limiting configured for all auth endpoints
- [ ] Account lockout mechanism implemented (5 attempts, 30 min lockout)
- [ ] Password requirements enforced (min 12 chars, complexity)

### Database
- [ ] MySQL database backed up and tested
- [ ] All tables have proper indexes
- [ ] Foreign key constraints enforced
- [ ] Database connection pooling configured (max 10 connections for production)
- [ ] Backup strategy documented
- [ ] Database recovery procedure tested
- [ ] Database user permissions restricted (not root)
- [ ] Database runs on separate server/container
- [ ] SSL connection to database enabled

### Backend Setup
- [ ] `.env` file created with ALL production values
- [ ] `.env.example` template provided to team
- [ ] NODE_ENV=production set
- [ ] All environment variables documented
- [ ] Error handling implemented globally
- [ ] Logging configured (Winston/Morgan)
- [ ] Health check endpoint implemented (`/health`)
- [ ] CORS configured for frontend domain only
- [ ] Session secret changed from default
- [ ] JWT secret changed from default
- [ ] Razorpay keys configured correctly
- [ ] Email service configured (SendGrid/Gmail)

### Frontend Setup
- [ ] React build optimized (`npm run build`)
- [ ] Build size analyzed and optimized
- [ ] All environment variables in `.env`
- [ ] API URLs point to production backend
- [ ] Analytics/tracking configured
- [ ] Error tracking (Sentry) configured if needed
- [ ] Service worker configured (PWA ready)
- [ ] Critical images optimized
- [ ] Lazy loading implemented for images

### Infrastructure & DevOps
- [ ] Docker images built and tested
- [ ] docker-compose.yml working correctly
- [ ] Images pushed to registry (Docker Hub/ECR/GCR)
- [ ] Kubernetes manifests ready (if using K8s)
- [ ] SSL/TLS certificates obtained (Let's Encrypt)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] HSTS header enabled
- [ ] DNS records configured
- [ ] CDN configured for static assets
- [ ] Load balancer configured (if needed)
- [ ] Auto-scaling policies set
- [ ] Monitoring/alerting configured (DataDog, New Relic)
- [ ] Log aggregation configured (ELK, Splunk)
- [ ] Database backups automated
- [ ] Backup retention policy defined

---

## 🔧 DEPLOYMENT DAY (Checklist)

### 6 Hours Before
- [ ] Final code review completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Database backup taken
- [ ] Staging environment mirrors production
- [ ] Team on standby for rollback

### 2 Hours Before
- [ ] Maintenance window announced to users (if needed)
- [ ] Deployment scripts tested in staging
- [ ] Database migrations tested and ready
- [ ] Rollback procedure documented and ready
- [ ] Communication channels established (Slack, Discord)

### Deployment Execution
- [ ] Pull latest code and build
- [ ] Run database migrations (backward compatible)
- [ ] Stop old containers/services
- [ ] Pull latest Docker images
- [ ] Start new containers with proper health checks
- [ ] Verify health check endpoints responding (200 OK)
- [ ] Verify database connectivity
- [ ] Verify API endpoints responding correctly
- [ ] Verify frontend loading properly
- [ ] Verify SSL/TLS certificates valid
- [ ] Check error logs for issues
- [ ] Smoke test critical user flows:
  - [ ] User registration
  - [ ] User login
  - [ ] Product browsing
  - [ ] Add to cart
  - [ ] Checkout/Payment
  - [ ] Order confirmation email

### Post-Deployment (First Hour)
- [ ] Monitor error logs closely
- [ ] Monitor performance metrics
- [ ] Monitor database performance
- [ ] Verify automated backups running
- [ ] Check user reports/support tickets
- [ ] Monitor CPU/memory/disk usage
- [ ] Verify HTTPS working correctly
- [ ] Test from multiple browsers/devices
- [ ] Verify Google Analytics/tracking working

---

## 📊 PRODUCTION MONITORING (Ongoing)

### Daily
- [ ] Error logs reviewed
- [ ] User-facing issues checked
- [ ] Database performance reviewed
- [ ] API response times checked
- [ ] Payment failures investigated

### Weekly
- [ ] Security updates applied
- [ ] Backup integrity verified
- [ ] Database cleanup (old logs, sessions)
- [ ] Performance optimization review
- [ ] SSL certificate expiration checked

### Monthly
- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Database optimization
- [ ] User feedback review
- [ ] Infrastructure scaling review

---

## 🚨 EMERGENCY PROCEDURES

### If deployment fails:
1. [ ] Stop new containers immediately
2. [ ] Restore database from backup (if changed)
3. [ ] Revert to previous version
4. [ ] Test on staging first
5. [ ] Notify team and stakeholders
6. [ ] Schedule post-mortem review

### If site goes down:
1. [ ] Check health check endpoints
2. [ ] Check database connectivity
3. [ ] Check error logs
4. [ ] Verify DNS resolution
5. [ ] Check load balancer status
6. [ ] Restart services if needed
7. [ ] Activate incident response plan

---

## 📋 DEPLOYMENT COMMANDS

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run database migrations
docker-compose exec backend npm run migrate

# Stop services
docker-compose down

# Rollback to previous version
git revert HEAD
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec db mysqldump -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > backup.sql

# Restore database
docker-compose exec -T db mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < backup.sql
```

---

## 🔐 SECURITY CHECKLIST (Final Review)

- [ ] **Secrets:** No hardcoded passwords/keys/tokens
- [ ] **Database:** Proper authentication, no root user
- [ ] **Authentication:** JWT implemented, tokens validated
- [ ] **Authorization:** Role-based access control enforced
- [ ] **Input Validation:** All inputs validated/sanitized
- [ ] **SQL Injection:** Parameterized queries used everywhere
- [ ] **XSS Protection:** Output encoded, CSP headers set
- [ ] **CORS:** Configured for frontend domain only
- [ ] **Rate Limiting:** Auth endpoints limited
- [ ] **Account Lockout:** Implemented after N failed attempts
- [ ] **HTTPS:** Enabled, redirects HTTP
- [ ] **HSTS:** Header set for HTTPS enforcement
- [ ] **Security Headers:** Helmet configured
- [ ] **Logging:** Auth failures logged
- [ ] **Monitoring:** Alerts set for anomalies
- [ ] **Backups:** Automated and tested
- [ ] **Disaster Recovery:** Plan documented and tested

---

## 📞 Support & Escalation

**On-Call Developer:** [Name/Phone]  
**DevOps/Infrastructure:** [Name/Phone]  
**Database Admin:** [Name/Phone]  
**Project Manager:** [Name/Phone]  

**Escalation Path:**
1. On-call developer (available 24/7)
2. CTO/Tech Lead
3. Project Manager
4. Management

---

## 📝 Post-Deployment Sign-Off

- [ ] Deployment completed successfully
- [ ] All tests passing
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] Team approved for production
- [ ] Users notified (if needed)

**Deployed By:** ________________  
**Date:** ________________  
**Time:** ________________  
**Approval:** ________________
