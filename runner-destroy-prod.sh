#!/bin/bash
docker compose -f docker-compose.prod.yaml down --volumes --rmi all --remove-orphans