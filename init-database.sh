#!/bin/bash

echo "Waiting for PostgreSQL to start..."
until docker exec p2p_roulette_db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done

echo "PostgreSQL is ready!"
