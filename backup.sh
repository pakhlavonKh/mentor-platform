#!/usr/bin/env bash
# ==============================================================================
# StudyQadam Automated Database & Uploads Backup Script
# ==============================================================================
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
UPLOADS_BACKUP_FILE="${BACKUP_DIR}/uploads_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."
docker compose exec -T db pg_dump -U postgres studyqadam > "$DB_BACKUP_FILE"

echo "Creating uploads backup..."
docker compose run --rm --entrypoint tar backend czf "/tmp/uploads_${TIMESTAMP}.tar.gz" -C /app uploads || true
docker compose cp studyqadam-backend:/app/uploads "$UPLOADS_BACKUP_FILE" 2>/dev/null || true

# Keep only the last 14 days of backups
find "$BACKUP_DIR" -type f -mtime +14 -delete

echo "✓ Backup completed:"
echo "  - DB: $DB_BACKUP_FILE"
