# Justfile Quick Reference

This document provides a comprehensive reference for all available Just commands in the todo-demo project.

## What is Just?

[Just](https://github.com/casey/just) is a handy command runner similar to `make`, but simpler and more modern. It provides convenient shortcuts for common development tasks.

> **Note**: This justfile is fully compatible with Windows PowerShell, macOS, and Linux. All commands have been tested on Windows.

## Installation

### macOS
```bash
brew install just
```

### Windows
```bash
# Using Chocolatey
choco install just

# Using Scoop
scoop install just

# Using Cargo
cargo install just
```

### Linux
```bash
# Using Cargo
cargo install just

# Or download from releases
# https://github.com/casey/just/releases
```

## Usage

```bash
# View all available commands
just

# Or
just --list

# Run a specific command
just dev

# View help for a specific command
just --show dev
```

## Available Commands

### Development Commands

| Command | Description | Equivalent |
|---------|-------------|------------|
| `just install` | Install dependencies | `cd app && yarn install` |
| `just dev` | Start development server | `cd app && yarn dev` |
| `just build` | Build for production | `cd app && yarn build` |
| `just preview` | Preview production build | `cd app && yarn preview` |
| `just clean` | Clean build artifacts | `cd app && rm -rf dist node_modules/.vite` |

### Testing Commands

| Command | Description | Equivalent |
|---------|-------------|------------|
| `just test` | Run tests in watch mode | `cd app && yarn test` |
| `just test-ui` | Run tests with Vitest UI | `cd app && yarn vitest --ui` |
| `just test-coverage` | Run tests with coverage | `cd app && yarn vitest --coverage` |
| `just test-ci` | Run tests once (CI mode) | `cd app && yarn vitest run` |

### Code Quality Commands

| Command | Description | Equivalent |
|---------|-------------|------------|
| `just lint` | Run ESLint | `cd app && yarn lint` |
| `just format` | Format code with Prettier | `cd app && yarn prettier --write "src/**/*"` |
| `just format-check` | Check code formatting | `cd app && yarn prettier --check "src/**/*"` |
| `just typecheck` | Run TypeScript compiler check | `cd app && yarn tsc -b` |
| `just check` | Run all quality checks | Runs lint, format-check, typecheck, test-ci |
| `just pre-commit` | Run checks before committing | Same as `just check` |

### Docker Commands - Local Testing

| Command | Description | Equivalent |
|---------|-------------|------------|
| `just docker-build` | Build Docker image | `cd app && docker build -t todo-demo-frontend:local .` |
| `just docker-build-with-api <URL>` | Build with custom API URL | `docker build --build-arg VITE_API_BASE_URL=<URL> ...` |
| `just docker-run` | Run Docker container | `docker run -p 8080:8080 todo-demo-frontend:local` |
| `just docker-run-detached` | Run container in background | `docker run -d -p 8080:8080 --name todo-frontend ...` |
| `just docker-stop` | Stop Docker container | `docker stop todo-frontend` |
| `just docker-rm` | Remove Docker container | `docker rm todo-frontend` |
| `just docker-logs` | View container logs | `docker logs todo-frontend` |
| `just docker-logs-follow` | Follow container logs | `docker logs -f todo-frontend` |
| `just docker-rmi` | Remove Docker image | `docker rmi todo-demo-frontend:local` |
| `just docker-clean` | Clean up all Docker resources | Stops, removes container and image |

### Docker Compose Commands

| Command | Description | Equivalent |
|---------|-------------|------------|
| `just compose-up` | Start services | `cd app && docker-compose up` |
| `just compose-up-detached` | Start in background | `cd app && docker-compose up -d` |
| `just compose-down` | Stop services | `cd app && docker-compose down` |
| `just compose-logs` | View logs | `cd app && docker-compose logs` |
| `just compose-logs-follow` | Follow logs | `cd app && docker-compose logs -f` |
| `just compose-rebuild` | Rebuild and start | `cd app && docker-compose up --build` |

### Combined Workflows

| Command | Description | What it does |
|---------|-------------|--------------|
| `just setup` | Full development setup | Runs `install` then `dev` |
| `just docker-full` | Build and run with Docker | Runs `docker-build` then `docker-run` |
| `just compose-full` | Build and run with Compose | Runs `compose-rebuild` |

### Utility Commands

| Command | Description | What it does |
|---------|-------------|--------------|
| `just open-dev` | Open app in browser (dev) | Opens http://localhost:3002 |
| `just open-docker` | Open app in browser (Docker) | Opens http://localhost:8080 |
| `just health-check` | Check Docker health endpoint | Curls http://localhost:8080/health |

## Common Workflows

### Starting Development

```bash
# First time setup
just setup

# Subsequent runs
just dev
```

### Before Committing

```bash
# Run all quality checks
just pre-commit
```

### Testing Docker Build Locally

```bash
# Build and run
just docker-full

# Check health
just health-check

# View logs
just docker-logs

# Clean up when done
just docker-clean
```

### Using Docker Compose

```bash
# Start services
just compose-up

# In another terminal, view logs
just compose-logs-follow

# Stop services
just compose-down
```

## Tips

1. **Tab Completion**: Just supports tab completion. See [installation docs](https://github.com/casey/just#shell-completion-scripts) for setup.

2. **Custom API URL**: When building Docker images with a custom API URL:
   ```bash
   just docker-build-with-api https://my-backend.railway.app/api
   ```

3. **Chaining Commands**: You can run multiple commands:
   ```bash
   just format lint test-ci
   ```

4. **Viewing Recipe Source**: To see what a command does:
   ```bash
   just --show dev
   ```

## Windows Compatibility

This justfile is configured to work on Windows using PowerShell. The following settings are in place:

- **Shell**: PowerShell is set as the default shell for Windows
- **Commands**: All commands are Windows-compatible
- **Browser**: Uses `start` command to open browsers
- **Health Check**: Uses PowerShell's `Invoke-WebRequest` instead of `curl`

## Troubleshooting

### Just not found
- Make sure Just is installed: `just --version`
- Check your PATH includes the installation directory
- On Windows, you may need to restart your terminal after installation

### Commands fail on Windows
- The justfile is configured for PowerShell
- Make sure you're running commands in PowerShell (not CMD)
- If using Git Bash, some commands may not work as expected

### Docker commands fail
- Ensure Docker Desktop is running on Windows
- Check if containers/images exist: `docker ps -a` and `docker images`
- Make sure Docker is properly configured in your PATH

### "Program not found" error
- This usually means the shell configuration is incorrect
- The justfile should have `set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]` at the top
- Try running `just --version` to verify Just is working

## Additional Resources

- [Just Documentation](https://just.systems/)
- [Just GitHub Repository](https://github.com/casey/just)
- [Justfile in this project](../justfile)

---

**Last Updated**: 2026-01-22

