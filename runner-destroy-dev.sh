#!/bin/bash
docker compose -f docker-compose.dev.yaml down --volumes --rmi all --remove-orphans