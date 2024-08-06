#!/bin/bash

docker kill $(docker ps -q)

docker network prune
docker container prune

