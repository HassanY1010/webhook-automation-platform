#!/bin/bash
# Database Backup & Retention Script for Webhook Automation Platform

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/postgres"
CONTAINER_NAME="webhook_postgres"
DB_NAME="webhook_platform"
DB_USER="postgres"

mkdir -p $BACKUP_DIR

echo "📦 Starting PostgreSQL database backup..."
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully: $BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Rotate backups older than 30 days
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -exec rm {} \;
echo "🧹 Old backups rotated."
