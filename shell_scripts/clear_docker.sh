#!/bin/bash

database_name=$1

if [ "$#" -ne 1 ]; then
    echo "Usage: './clear_docker.sh <database_name>'"
    exit
fi

scenarios=$(sudo -u postgres psql -At -d edurangedb -c "SELECT name FROM scenarios")

echo $scenarios

while read scenario; do
    echo "Clearing $scenario containers"
    docker stop $(docker ps -q --filter="name=$scenario")
    docker rm $(docker ps -a -q --filter="name=$scenario")
done <<< "$scenarios"
