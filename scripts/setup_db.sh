#!/bin/bash

# Setup script for Mek database
# Usage: ./scripts/setup_db.sh [database_name] [username]

DB_NAME=${1:-mek_db}
DB_USER=${2:-postgres}

echo "Setting up database: $DB_NAME"
echo "User: $DB_USER"

# Create database (if it doesn't exist)
psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database $DB_NAME already exists or error occurred"

# Run schema
echo "Creating schema..."
psql -U $DB_USER -d $DB_NAME -f scripts/schema.sql

echo "Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your DATABASE_URL"
echo "2. Run: npm run seed"
