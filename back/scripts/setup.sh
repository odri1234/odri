#!/bin/bash

set -e

echo "🔧 Setting up ODRI WiFi Billing System..."

# Step 1: Go to project root
cd "$(dirname "$0")/.."

# Step 2: Install Node.js dependencies
echo "📦 Installing Node.js packages..."
npm install

# Step 3: Check for .env file
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Copying from .env.example..."
  cp .env.example .env
fi

# Step 4: Run DB migrations
echo "🧱 Running database migrations..."
./scripts/migrate.sh

# Step 5: (Optional) Build Docker images
read -p "🐳 Do you want to build Docker images now? (y/n): " build_docker
if [[ "$build_docker" == "y" ]]; then
  echo "🐳 Building Docker images..."
  docker-compose build
fi

echo "✅ Setup completed successfully."
