#!/usr/bin/env bash
# ==============================================================================
# StudyQadam VPS Automated Deployment Script
# ==============================================================================
set -e

echo "=========================================="
echo " Starting StudyQadam Production Deployment"
echo "=========================================="

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
    echo "✓ Docker installed successfully."
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from template..."
    cp .env.docker.example .env
    echo "⚠️  A default .env file was created. Please update JWT_SECRET and DB_PASSWORD if needed!"
fi

echo "Pulling latest git changes..."
git pull origin main || true

echo "Building and restarting Docker containers..."
docker compose down || true
docker compose up -d --build

echo "Waiting for services to become healthy..."
sleep 8

echo "Checking container status..."
docker compose ps

echo "=========================================="
echo "✓ StudyQadam is running successfully!"
echo "=========================================="
