#!/bin/bash

# Database Backup Script for Production
# Purpose: Automated MySQL database backup
# Usage: ./backup.sh
# Schedule: Add to crontab for daily backups at 2 AM
# Example crontab: 0 2 * * * /home/mahasu/backend/backup.sh

set -e

# Configuration
DB_USER="root"
DB_NAME="mahasu_ecommerce"
BACKUP_DIR="/backups/database"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/mahasu_${DATE}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting database backup..."

# Execute backup
mysqldump -u "$DB_USER" -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Get file size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Backup completed: $BACKUP_FILE (Size: $SIZE)"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "mahasu_*.sql.gz" -mtime +7 -delete

# List recent backups
echo "📦 Recent backups:"
ls -lh "$BACKUP_DIR" | tail -5

# Optional: Upload to cloud storage (S3, Google Cloud, etc)
# aws s3 cp "$BACKUP_FILE" s3://your-bucket/backups/

echo "✅ Backup script completed"
