#!/bin/bash

# Create new database
echo "Enter database name all lowercase:"
read dbname
sudo -Hiu postgres psql -U postgres -c "DROP DATABASE IF EXISTS $dbname ;"
sudo -Hiu postgres psql -U postgres -c "CREATE DATABASE $dbname ;"

# Remove old scenarios
rm -rf ../scenarios/tmp/*

# Add new database to .env
sed -i "s|\(DATABASE_URL=.*//.*/\).*|\1${dbname}|" "../.env"
sed -i "s|\(CHATDB_DATABASENAME=\).*|\1${dbname}|" "../.env"
