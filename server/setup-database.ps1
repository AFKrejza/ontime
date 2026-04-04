# setup-database.ps1 - Run this from the server directory
Write-Host "Setting up PostgreSQL database..." -ForegroundColor Green

# Stop and remove existing container
Write-Host "Removing existing container..." -ForegroundColor Yellow
docker stop ontime_db 2>$null
docker rm ontime_db 2>$null

# Check if init.sql exists
if (Test-Path "docker-entrypoint-initdb.d/init.sql") {
    Write-Host "✅ Found init.sql" -ForegroundColor Green
} else {
    Write-Host "❌ init.sql not found in docker-entrypoint-initdb.d/" -ForegroundColor Red
    exit 1
}

# Start new container
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker run -d `
    --name ontime_db `
    -e POSTGRES_USER=postgres `
    -e POSTGRES_PASSWORD=localreallysecurepassword `
    -e POSTGRES_DB=ontime `
    -p 5432:5432 `
    -v ${PWD}/docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d `
    postgres:16

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Verify database
Write-Host "`n=== Verifying Database ===" -ForegroundColor Cyan

Write-Host "`nTables in database:" -ForegroundColor Yellow
docker exec ontime_db psql -U postgres -d ontime -c "\dt"

Write-Host "`nUsers:" -ForegroundColor Yellow
docker exec ontime_db psql -U postgres -d ontime -c "SELECT id, username, email FROM users;"

Write-Host "`nGateways:" -ForegroundColor Yellow
docker exec ontime_db psql -U postgres -d ontime -c "SELECT id, name FROM gateways;"

Write-Host "`nTowers (with your Tower ID 547c65321d0b):" -ForegroundColor Yellow
docker exec ontime_db psql -U postgres -d ontime -c "SELECT id, name, stop_id, line_gtfs_id FROM towers;"

Write-Host "`nStops:" -ForegroundColor Yellow
docker exec ontime_db psql -U postgres -d ontime -c "SELECT slug, name, gtfs_id FROM stops;"

Write-Host "`nLines:" -ForegroundColor Yellow
docker exec ontime_db psql -U postgres -d ontime -c "SELECT name, type, direction, gtfs_id FROM lines LIMIT 5;"

Write-Host "`n✅ Database setup complete!" -ForegroundColor Green
Write-Host "`nYou can now start your server with: npm run dev" -ForegroundColor Cyan