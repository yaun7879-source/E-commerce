#!/bin/bash

# Log Rotation Script
# Purpose: Rotate and compress application logs
# Usage: ./rotate-logs.sh
# Schedule: Daily at midnight via crontab
# Example: 0 0 * * * /home/mahasu/backend/scripts/rotate-logs.sh

set -e

LOG_DIR="/var/log/mahasu"
ARCHIVE_DIR="$LOG_DIR/archive"
DAYS_TO_KEEP=30

echo "🔄 Starting log rotation..."

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Rotate each log file
for logfile in "$LOG_DIR"/*.log; do
    if [ -f "$logfile" ]; then
        filename=$(basename "$logfile")
        timestamp=$(date +"%Y%m%d_%H%M%S")
        
        # Compress and move
        gzip -c "$logfile" > "$ARCHIVE_DIR/${filename}.${timestamp}.gz"
        
        # Clear original log
        > "$logfile"
        
        echo "✅ Rotated $filename"
    fi
done

# Delete old archives
find "$ARCHIVE_DIR" -name "*.gz" -mtime +$DAYS_TO_KEEP -delete

echo "✅ Log rotation completed"
echo "📦 Archive directory size: $(du -sh "$ARCHIVE_DIR")"
