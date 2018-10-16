#!/usr/bin/env bash

echo "Building client-app package with NPM..."
npm --prefix ../client-app install
npm --prefix ../client-app run build

echo "Firing up docker-compose..."
docker-compose up -d

while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:9999/index.html)" != "200" ]];
do
    printf "."
    sleep 1;
done
echo
echo "Opening http://localhost:9999/index.html"

open 'http://localhost:9999/index.html'
