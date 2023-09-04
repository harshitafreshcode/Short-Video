#!/bin/bash

# Set the backup directory and file name
BACKUP_DIR="/home/freshcodes/Desktop/backup"
BACKUP_FILE="backup_localhost.sql"

# Set PostgreSQL user and database
PG_USER="postgres"
PG_DB="swagger_demo"

# Perform the backup using pg_dump
PGPASSWORD="root" pg_dump -h localhost -U $PG_USER -d $PG_DB -F c -f $BACKUP_DIR/$BACKUP_FILE

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE"
