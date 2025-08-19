#!/bin/bash

set -e

echo "📦 Running database migrations..."

# Navigate to backend root
cd "$(dirname "$0")/.."

# Run migration using TypeORM CLI
npm run typeorm -- migration:run

echo "✅ Migrations completed successfully."
