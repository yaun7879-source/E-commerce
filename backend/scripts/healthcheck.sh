#!/bin/bash

# Health Check & Auto-Recovery Script
# Purpose: Monitor application health and restart if needed
# Usage: ./healthcheck.sh
# Schedule: Add to crontab every 5 minutes
# Example: */5 * * * * /home/mahasu/backend/scripts/healthcheck.sh

set -e

# Configuration
API_URL="http://localhost:5001/api/health"
MAX_RETRIES=3
RETRY_DELAY=5
LOG_FILE="/var/log/mahasu/healthcheck.log"

# Function to log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to check health
check_health() {
    local retry=0
    
    while [ $retry -lt $MAX_RETRIES ]; do
        if curl -sf "$API_URL" > /dev/null 2>&1; then
            log "✅ Health check passed"
            return 0
        fi
        
        retry=$((retry + 1))
        log "⚠️  Health check failed (attempt $retry/$MAX_RETRIES)"
        
        if [ $retry -lt $MAX_RETRIES ]; then
            sleep $RETRY_DELAY
        fi
    done
    
    return 1
}

# Create log directory if needed
mkdir -p "$(dirname "$LOG_FILE")"

# Check health
if ! check_health; then
    log "❌ Health check failed after $MAX_RETRIES attempts. Attempting restart..."
    
    # Stop the service
    systemctl stop mahasu-api || docker-compose -f /home/mahasu/docker-compose.yml down mahasu_api
    
    sleep 5
    
    # Start the service
    systemctl start mahasu-api || docker-compose -f /home/mahasu/docker-compose.yml up -d mahasu_api
    
    log "✅ Service restart completed"
fi
