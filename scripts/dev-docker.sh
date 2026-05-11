echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please add .env.development with Neon credentials."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

mkdir -p .neon_local

if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

echo "📜 Applying latest schema with Drizzle..."
npm run db:migrate

echo "⏳ Waiting for the database to be ready..."
docker compose exec neon-local psql -U neon -d neondb -c 'SELECT 1'

docker compose -f docker-compose.dev.yml up --build

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:5173"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "To stop the environment, press Ctrl+C or run: docker compose down"