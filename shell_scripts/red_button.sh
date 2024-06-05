#!/bin/bash

# Load the environment variables from the .env file located in the parent directory
set -a  # Automatically export all variables
source ../.env
set +a  # Stop automatically exporting

SQL_FILE="red_button.sql"

PGPASSWORD=$(echo $DATABASE_URL | cut -d: -f3 | cut -d@ -f1) psql "$DATABASE_URL" -a -f $SQL_FILE

# Check the exit status of the previous command
if [ $? -eq 0 ]; then
    echo "Database updated successfully."
else
    echo "Failed to update the database."
    exit 1
fi
