#!/bin/bash
docker compose -f docker-compose.prod.yaml up --build -d
# remove the old images
docker image prune -f