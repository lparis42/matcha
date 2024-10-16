#!/bin/bash

if [ "$1" == "prod" ]; then
  sed -i 's/^DATABASE_HOST=.*/DATABASE_HOST=postgres/' .env
  sed -i 's/^HTTPS_PORT_CLIENT=.*/HTTPS_PORT_CLIENT=2000/' .env
  docker-compose up
elif [ "$1" == "dev" ]; then
  sed -i 's/^DATABASE_HOST=.*/DATABASE_HOST=localhost/' .env
  sed -i 's/^HTTPS_PORT_CLIENT=.*/HTTPS_PORT_CLIENT=5173/' .env
  npm run dev
else
  echo "Usage: $0 {prod|dev}"
  exit 1
fi
