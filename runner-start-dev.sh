#!/bin/bash
docker compose -f docker-compose.dev.yaml up --build -d
# remove the old images
docker image prune -f