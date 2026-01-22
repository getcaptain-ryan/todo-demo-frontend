# Todo Demo - Justfile
# Convenient shortcuts for yarn and docker commands

# Set shell for Windows compatibility
set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

# Default recipe to display help information
default:
    @just --list

# ============================================================================
# Development Commands
# ============================================================================

# Install dependencies
install:
    just install-{{os()}}

install-linux:
    cd app && yarn install

install-macos:
    cd app && yarn install

install-windows:
    cd app; yarn install

# Start development server (http://localhost:3002)
dev:
    just dev-{{os()}}

dev-linux:
    cd app && yarn dev

dev-macos:
    cd app && yarn dev

dev-windows:
    cd app; yarn dev

# Build for production
build:
    just build-{{os()}}

build-linux:
    cd app && yarn build

build-macos:
    cd app && yarn build

build-windows:
    cd app; yarn build

# Preview production build locally
preview:
    just preview-{{os()}}

preview-linux:
    cd app && yarn preview

preview-macos:
    cd app && yarn preview

preview-windows:
    cd app; yarn preview

# Clean build artifacts
clean:
    just clean-{{os()}}

clean-linux:
    rm -rf app/dist app/node_modules/.vite

clean-macos:
    rm -rf app/dist app/node_modules/.vite

clean-windows:
    if (Test-Path app/dist) { Remove-Item -Recurse -Force app/dist }; if (Test-Path app/node_modules/.vite) { Remove-Item -Recurse -Force app/node_modules/.vite }

# ============================================================================
# Testing Commands
# ============================================================================

# Run tests in watch mode
test:
    just test-{{os()}}

test-linux:
    cd app && yarn test

test-macos:
    cd app && yarn test

test-windows:
    cd app; yarn test

# Run tests with UI
test-ui:
    just test-ui-{{os()}}

test-ui-linux:
    cd app && yarn vitest --ui

test-ui-macos:
    cd app && yarn vitest --ui

test-ui-windows:
    cd app; yarn vitest --ui

# Run tests with coverage
test-coverage:
    just test-coverage-{{os()}}

test-coverage-linux:
    cd app && yarn vitest --coverage

test-coverage-macos:
    cd app && yarn vitest --coverage

test-coverage-windows:
    cd app; yarn vitest --coverage

# Run tests once (CI mode)
test-ci:
    just test-ci-{{os()}}

test-ci-linux:
    cd app && yarn vitest run

test-ci-macos:
    cd app && yarn vitest run

test-ci-windows:
    cd app; yarn vitest run

# ============================================================================
# Code Quality Commands
# ============================================================================

# Run ESLint
lint:
    just lint-{{os()}}

lint-linux:
    cd app && yarn lint

lint-macos:
    cd app && yarn lint

lint-windows:
    cd app; yarn lint

# Run Prettier to format code
format:
    just format-{{os()}}

format-linux:
    cd app && yarn prettier --write "src/**/*.{ts,tsx,json,css,md}"

format-macos:
    cd app && yarn prettier --write "src/**/*.{ts,tsx,json,css,md}"

format-windows:
    cd app; yarn prettier --write 'src/**/*.{ts,tsx,json,css,md}'

# Check code formatting without making changes
format-check:
    just format-check-{{os()}}

format-check-linux:
    cd app && yarn prettier --check "src/**/*.{ts,tsx,json,css,md}"

format-check-macos:
    cd app && yarn prettier --check "src/**/*.{ts,tsx,json,css,md}"

format-check-windows:
    cd app; yarn prettier --check 'src/**/*.{ts,tsx,json,css,md}'

# Run TypeScript compiler check
typecheck:
    just typecheck-{{os()}}

typecheck-linux:
    cd app && yarn tsc -b

typecheck-macos:
    cd app && yarn tsc -b

typecheck-windows:
    cd app; yarn tsc -b

# Run all quality checks (lint, format-check, typecheck, test)
check: lint format-check typecheck test-ci

# ============================================================================
# Docker Commands - Local Testing
# ============================================================================

# Build Docker image
docker-build:
    just docker-build-{{os()}}

docker-build-linux:
    cd app && docker build -t todo-demo-frontend:local .

docker-build-macos:
    cd app && docker build -t todo-demo-frontend:local .

docker-build-windows:
    cd app; docker build -t todo-demo-frontend:local .

# Build Docker image with custom API URL
docker-build-with-api API_URL:
    just docker-build-with-api-{{os()}} '{{API_URL}}'

docker-build-with-api-linux API_URL:
    cd app && docker build --build-arg VITE_API_BASE_URL={{API_URL}} -t todo-demo-frontend:local .

docker-build-with-api-macos API_URL:
    cd app && docker build --build-arg VITE_API_BASE_URL={{API_URL}} -t todo-demo-frontend:local .

docker-build-with-api-windows API_URL:
    cd app; docker build --build-arg VITE_API_BASE_URL={{API_URL}} -t todo-demo-frontend:local .

# Run Docker container
docker-run:
    docker run -p 8080:8080 todo-demo-frontend:local

# Run Docker container in detached mode
docker-run-detached:
    docker run -d -p 8080:8080 --name todo-frontend todo-demo-frontend:local

# Stop Docker container
docker-stop:
    docker stop todo-frontend

# Remove Docker container
docker-rm:
    docker rm todo-frontend

# View Docker container logs
docker-logs:
    docker logs todo-frontend

# Follow Docker container logs
docker-logs-follow:
    docker logs -f todo-frontend

# Remove Docker image
docker-rmi:
    docker rmi todo-demo-frontend:local

# Clean up Docker (stop, remove container and image)
docker-clean: docker-stop docker-rm docker-rmi

# ============================================================================
# Docker Compose Commands
# ============================================================================

# Start services with Docker Compose
compose-up:
    just compose-up-{{os()}}

compose-up-linux:
    cd app && docker-compose up

compose-up-macos:
    cd app && docker-compose up

compose-up-windows:
    cd app; docker-compose up

# Start services in detached mode
compose-up-detached:
    just compose-up-detached-{{os()}}

compose-up-detached-linux:
    cd app && docker-compose up -d

compose-up-detached-macos:
    cd app && docker-compose up -d

compose-up-detached-windows:
    cd app; docker-compose up -d

# Stop Docker Compose services
compose-down:
    just compose-down-{{os()}}

compose-down-linux:
    cd app && docker-compose down

compose-down-macos:
    cd app && docker-compose down

compose-down-windows:
    cd app; docker-compose down

# View Docker Compose logs
compose-logs:
    just compose-logs-{{os()}}

compose-logs-linux:
    cd app && docker-compose logs

compose-logs-macos:
    cd app && docker-compose logs

compose-logs-windows:
    cd app; docker-compose logs

# Follow Docker Compose logs
compose-logs-follow:
    just compose-logs-follow-{{os()}}

compose-logs-follow-linux:
    cd app && docker-compose logs -f

compose-logs-follow-macos:
    cd app && docker-compose logs -f

compose-logs-follow-windows:
    cd app; docker-compose logs -f

# Rebuild and start Docker Compose services
compose-rebuild:
    just compose-rebuild-{{os()}}

compose-rebuild-linux:
    cd app && docker-compose up --build

compose-rebuild-macos:
    cd app && docker-compose up --build

compose-rebuild-windows:
    cd app; docker-compose up --build

# ============================================================================
# Combined Workflows
# ============================================================================

# Full development setup (install + dev)
setup: install dev

# Build and run with Docker
docker-full: docker-build docker-run

# Build and run with Docker Compose
compose-full: compose-rebuild

# Run all checks before committing
pre-commit: format lint typecheck test-ci

# ============================================================================
# Utility Commands
# ============================================================================

# Open the app in browser (development)
open-dev:
    just open-dev-{{os()}}

open-dev-linux:
    @echo "Opening http://localhost:5173"
    xdg-open http://localhost:5173

open-dev-macos:
    @echo "Opening http://localhost:5173"
    open http://localhost:5173

open-dev-windows:
    @echo "Opening http://localhost:5173"
    start http://localhost:5173

# Open the app in browser (Docker)
open-docker:
    just open-docker-{{os()}}

open-docker-linux:
    @echo "Opening http://localhost:8080"
    xdg-open http://localhost:8080

open-docker-macos:
    @echo "Opening http://localhost:8080"
    open http://localhost:8080

open-docker-windows:
    @echo "Opening http://localhost:8080"
    start http://localhost:8080

# Check Docker health endpoint
health-check:
    just health-check-{{os()}}

health-check-linux:
    @curl -s http://localhost:8080/health && echo "\n✅ Health check passed" || echo "\n❌ Health check failed"

health-check-macos:
    @curl -s http://localhost:8080/health && echo "\n✅ Health check passed" || echo "\n❌ Health check failed"

health-check-windows:
    @powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:8080/health -UseBasicParsing; Write-Host \"`n✅ Health check passed\" } catch { Write-Host \"`n❌ Health check failed\" }"

