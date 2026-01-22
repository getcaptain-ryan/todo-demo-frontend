# Todo Demo - Modern Task Management Application

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

A modern, production-ready task management application featuring a Kanban-style board with drag-and-drop functionality. Built with React 19, TypeScript, and a comprehensive suite of modern web development tools.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Detailed Setup](#detailed-setup)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Available Commands](#available-commands)
  - [Environment Configuration](#environment-configuration)
  - [Code Quality](#code-quality)
- [Deployment](#deployment)
  - [Containerization](#containerization)
  - [Railway Deployment](#railway-deployment)
  - [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Todo Demo** is a demonstration project showcasing modern frontend development practices and deployment strategies. The application features a Kanban-style task board with drag-and-drop functionality, built with the latest React ecosystem tools and best practices.

### Purpose

This project serves as:
- A **demonstration** of modern React development with TypeScript
- A **reference implementation** for containerized frontend deployment
- A **template** for building production-ready React applications
- A **showcase** of best practices in code quality, testing, and documentation

### Goals

- ✅ Provide a clean, maintainable codebase following industry best practices
- ✅ Demonstrate modern React patterns and hooks
- ✅ Showcase containerization and cloud deployment workflows
- ✅ Offer comprehensive documentation for developers and deployment teams
- ✅ Implement accessible, responsive UI components

## ✨ Features

### Core Functionality
- **Kanban Board**: Drag-and-drop task management with three columns (Todo, In Progress, Done)
- **Task Management**: Create, update, and organize tasks with priorities
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support

### Technical Features
- **Type Safety**: Full TypeScript implementation with strict type checking
- **State Management**: TanStack Query for server state and caching
- **Form Handling**: React Hook Form with Zod schema validation
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Testing**: Vitest and React Testing Library setup
- **Code Quality**: ESLint and Prettier pre-configured
- **API Integration**: Axios-based API client with proxy configuration

## 🛠 Technology Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework with latest features |
| **TypeScript** | 5.9.3 | Type-safe development |
| **Vite** | 7.2.4 | Lightning-fast build tool and dev server |
| **Yarn** | Latest | Package manager |

### Styling & UI
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Shadcn/ui** | Beautiful, accessible component library |
| **Radix UI** | Unstyled, accessible UI primitives |
| **Lucide React** | Icon library |
| **class-variance-authority** | Component variant management |

### Data & Forms
| Technology | Purpose |
|------------|---------|
| **TanStack Query** | Powerful data fetching and caching |
| **Axios** | HTTP client for API requests |
| **React Hook Form** | Performant form handling |
| **Zod** | TypeScript-first schema validation |

### Drag & Drop
| Technology | Purpose |
|------------|---------|
| **@dnd-kit** | Modern drag-and-drop toolkit |

### Testing & Quality
| Technology | Purpose |
|------------|---------|
| **Vitest** | Fast unit testing framework |
| **React Testing Library** | Component testing utilities |
| **ESLint** | Code linting with TypeScript support |
| **Prettier** | Code formatting |

### Deployment
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization with multi-stage builds |
| **nginx** | Production web server |
| **Railway** | Cloud deployment platform |

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Yarn** package manager ([Installation](https://yarnpkg.com/getting-started/install))
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **Just** (optional, but recommended) - Command runner for shortcuts ([Installation](https://github.com/casey/just#installation))

### Quick Start

For developers who want to get up and running quickly (15-20 minutes):

```bash
# Clone the repository
git clone https://github.com/getcaptain-ryan/todo-demo-frontend.git
cd todo-demo-frontend

# Navigate to the app directory
cd app

# Install dependencies
yarn install

# Start the development server
yarn dev
```

The application will be available at `http://localhost:3002`

#### Using Just (Recommended)

If you have [Just](https://github.com/casey/just) installed, you can use convenient shortcuts:

```bash
# Install dependencies and start dev server
just setup

# Or just start dev server
just dev
```

📖 **For detailed setup instructions**, see [`code_plans/QUICK_START.md`](./code_plans/QUICK_START.md)

### Detailed Setup

For a comprehensive understanding of the setup process, including all configuration files and code examples:

1. **Read the Quick Start Guide**: [`code_plans/QUICK_START.md`](./code_plans/QUICK_START.md) (15 min)
2. **Execute the setup commands** (15 min)
3. **Reference the Complete Setup Plan**: [`code_plans/FRONTEND_SETUP_PLAN.md`](./code_plans/FRONTEND_SETUP_PLAN.md) for detailed explanations
4. **Verify your setup** using the checklist in the documentation
5. **Troubleshoot** if needed using the comprehensive guides

## 📁 Project Structure

```
todo-demo/
├── app/                          # Main application directory
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn/ui components
│   │   │   └── kanban/          # Kanban board components
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios instance configuration
│   │   │   └── utils.ts         # Utility functions
│   │   ├── hooks/
│   │   │   ├── useTodos.ts      # Todo data hooks
│   │   │   └── useKanban.ts     # Kanban board logic
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript type definitions
│   │   ├── test/
│   │   │   └── setup.ts         # Test configuration
│   │   ├── App.tsx              # Main application component
│   │   ├── main.tsx             # Application entry point
│   │   └── index.css            # Global styles
│   ├── public/                   # Static assets
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── nginx.conf               # nginx server configuration
│   ├── railway.toml             # Railway deployment config
│   ├── docker-compose.yml       # Local Docker testing
│   ├── package.json             # Dependencies and scripts
│   ├── vite.config.ts           # Vite configuration
│   ├── vitest.config.ts         # Test configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── tsconfig.json            # TypeScript configuration
├── code_plans/                   # Comprehensive documentation
│   ├── README.md                # Documentation index
│   ├── QUICK_START.md           # Quick setup guide
│   ├── FRONTEND_SETUP_PLAN.md   # Complete setup reference
│   ├── DEPENDENCIES.md          # Package reference
│   ├── CONTAINERIZATION_README.md        # Containerization overview
│   ├── FRONTEND_CONTAINERIZATION_PLAN.md # Complete Docker guide
│   ├── DOCKER_QUICK_REFERENCE.md         # Docker commands
│   └── KANBAN_BOARD_IMPLEMENTATION_PLAN.md # Kanban feature guide
├── justfile                      # Task runner with command shortcuts
└── README.md                     # This file

```

### Key Directories

- **`app/`**: Contains the entire React application
- **`app/src/components/`**: Reusable UI components and feature components
- **`app/src/lib/`**: Utility functions and API client configuration
- **`app/src/hooks/`**: Custom React hooks for data fetching and state management
- **`code_plans/`**: Comprehensive documentation for setup, deployment, and features

## 💻 Development

### Available Commands

#### Using Just (Recommended)

If you have [Just](https://github.com/casey/just) installed, you can use these convenient shortcuts:

```bash
# View all available commands
just

# Development
just dev              # Start dev server on http://localhost:3002
just build            # Build for production
just preview          # Preview production build locally
just install          # Install dependencies
just setup            # Install dependencies and start dev server

# Testing
just test             # Run tests in watch mode
just test-ui          # Run tests with Vitest UI
just test-coverage    # Run tests with coverage report
just test-ci          # Run tests once (CI mode)

# Code Quality
just lint             # Run ESLint
just format           # Format code with Prettier
just format-check     # Check code formatting
just typecheck        # Run TypeScript compiler check
just check            # Run all quality checks
just pre-commit       # Run all checks before committing

# Docker - Local Testing
just docker-build     # Build Docker image
just docker-run       # Run Docker container
just docker-full      # Build and run Docker container
just docker-logs      # View container logs
just docker-clean     # Clean up Docker resources

# Docker Compose
just compose-up       # Start services with Docker Compose
just compose-down     # Stop Docker Compose services
just compose-rebuild  # Rebuild and start services

# Utilities
just open-dev         # Open app in browser (dev server)
just open-docker      # Open app in browser (Docker)
just health-check     # Check Docker health endpoint
```

#### Using Yarn Directly

```bash
# Development
cd app
yarn dev              # Start dev server on http://localhost:3002
yarn build            # Build for production
yarn preview          # Preview production build locally

# Testing
yarn test             # Run tests in watch mode
yarn vitest --ui      # Run tests with Vitest UI
yarn vitest --coverage # Run tests with coverage report

# Code Quality
yarn lint             # Check for linting errors
yarn prettier --write "src/**/*.{ts,tsx,json,css,md}" # Format code
```

### Environment Configuration

#### Development Environment

Create a `.env` file in the `app/` directory:

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

#### Key Configuration

- **Dev Server Port**: `3002`
- **API Proxy**: `/api` → `http://localhost:8001`
- **Path Aliases**: `@` → `./src`
- **Hot Module Replacement**: Enabled

### Code Quality

The project includes pre-configured code quality tools:

#### ESLint
- TypeScript-aware linting rules
- React hooks validation
- Prettier integration
- Configuration: `.eslintrc.cjs`

#### Prettier
- Consistent code formatting
- Integrated with ESLint
- Configuration: `.prettierrc`

#### TypeScript
- Strict type checking enabled
- Path aliases configured
- Configuration: `tsconfig.json`

### Testing Approach

The project uses **Vitest** and **React Testing Library** for testing:

- **Unit Tests**: Test individual components and hooks
- **Integration Tests**: Test component interactions
- **Test Setup**: Pre-configured with jsdom and testing utilities
- **Coverage**: Available via `yarn test:coverage`

## 🚢 Deployment

### Containerization

The application uses a **multi-stage Docker build** for optimal production deployment:

#### Docker Architecture
- **Stage 1 (deps)**: Install dependencies with frozen lockfile
- **Stage 2 (builder)**: Build the application with Vite
- **Stage 3 (production)**: Serve with nginx on Alpine Linux

#### Key Features
- **Image Size**: ~25-30 MB (optimized with Alpine)
- **Web Server**: nginx for production serving
- **Health Checks**: Built-in health endpoint at `/health`
- **Port**: Exposes port `8080`

#### Local Docker Testing

Using Just:
```bash
# Build and run with Docker
just docker-full

# Or step by step
just docker-build
just docker-run

# Using Docker Compose
just compose-up
```

Using Docker directly:
```bash
# Build the Docker image
cd app
docker build -t todo-demo-frontend .

# Run the container
docker run -p 8080:8080 \
  -e VITE_API_BASE_URL=https://your-backend.railway.app/api \
  todo-demo-frontend

# Using Docker Compose
docker-compose up
```

📖 **For complete containerization details**, see:
- [`code_plans/CONTAINERIZATION_README.md`](./code_plans/CONTAINERIZATION_README.md) - Overview
- [`code_plans/FRONTEND_CONTAINERIZATION_PLAN.md`](./code_plans/FRONTEND_CONTAINERIZATION_PLAN.md) - Complete guide
- [`code_plans/DOCKER_QUICK_REFERENCE.md`](./code_plans/DOCKER_QUICK_REFERENCE.md) - Command reference

### Railway Deployment

The application is configured for deployment on Railway with automatic builds from GitHub.

#### Deployment Process

1. **Push to GitHub**: Commit and push your changes
2. **Railway Auto-Deploy**: Railway automatically builds and deploys
3. **Health Checks**: Railway monitors the `/health` endpoint
4. **Zero-Downtime**: Rolling deployments with automatic rollback

#### Railway Configuration

The `railway.toml` file configures:
- Dockerfile-based builds
- Health check endpoint
- Restart policies
- Start command

### Environment Variables

#### Production Environment Variables (Railway)

Set these in the Railway dashboard:

```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

**Important Notes**:
- ⚠️ Must be prefixed with `VITE_` for Vite to expose them to the client
- ⚠️ Set in Railway dashboard, not in code (for security)
- ⚠️ Requires rebuild when changed (baked into the build at compile time)
- ⚠️ Never commit sensitive values to version control

## 📚 Documentation

Comprehensive documentation is available in the `code_plans/` directory:

### Setup & Development
- **[README.md](./code_plans/README.md)** - Documentation index and overview
- **[QUICK_START.md](./code_plans/QUICK_START.md)** - 15-minute quick start guide
- **[FRONTEND_SETUP_PLAN.md](./code_plans/FRONTEND_SETUP_PLAN.md)** - Complete setup reference with all config files
- **[DEPENDENCIES.md](./code_plans/DEPENDENCIES.md)** - Package reference and version management
- **[JUSTFILE_REFERENCE.md](./code_plans/JUSTFILE_REFERENCE.md)** - Just command runner reference and shortcuts

### Deployment & Containerization
- **[CONTAINERIZATION_README.md](./code_plans/CONTAINERIZATION_README.md)** - Containerization overview
- **[FRONTEND_CONTAINERIZATION_PLAN.md](./code_plans/FRONTEND_CONTAINERIZATION_PLAN.md)** - Complete Docker and Railway guide
- **[DOCKER_QUICK_REFERENCE.md](./code_plans/DOCKER_QUICK_REFERENCE.md)** - Docker command reference

### Features
- **[KANBAN_BOARD_IMPLEMENTATION_PLAN.md](./code_plans/KANBAN_BOARD_IMPLEMENTATION_PLAN.md)** - Kanban board feature guide

### Documentation Navigation

**For Quick Setup** → Start with [`QUICK_START.md`](./code_plans/QUICK_START.md)

**For Complete Reference** → See [`FRONTEND_SETUP_PLAN.md`](./code_plans/FRONTEND_SETUP_PLAN.md)

**For Deployment** → See [`CONTAINERIZATION_README.md`](./code_plans/CONTAINERIZATION_README.md)

**For Troubleshooting** → Check the troubleshooting sections in each guide

## 🤝 Contributing

### Development Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/getcaptain-ryan/todo-demo-frontend.git
   cd todo-demo-frontend
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write tests for new features
   - Update documentation as needed

4. **Run quality checks**
   ```bash
   yarn lint          # Check for linting errors
   yarn test          # Run tests
   yarn build         # Ensure build succeeds
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- **TypeScript**: Use strict type checking, avoid `any` types
- **Components**: Use functional components with hooks
- **Styling**: Use Tailwind CSS utility classes
- **Testing**: Write tests for new features and bug fixes
- **Formatting**: Code is automatically formatted with Prettier
- **Linting**: All code must pass ESLint checks

### Commit Message Convention

Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📄 License

This project is a demonstration application for Captain.

---

## 🆘 Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3002 already in use | Change port in `vite.config.ts` → `server.port` |
| Module not found errors | Run `yarn install` and ensure `@types/node` is installed |
| Tailwind not working | Check `src/index.css` has `@tailwind` directives |
| Docker build fails | Check `.dockerignore` and `package.json` |
| Environment variables not working | Ensure `VITE_` prefix and rebuild |

### Getting Help

1. **Check the documentation** in `code_plans/` directory
2. **Review troubleshooting sections** in the setup guides
3. **Verify dependencies** are installed correctly
4. **Check Node.js and Yarn versions** are up to date

### Useful Resources

- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Railway Documentation](https://docs.railway.app/)

---

**Built with ❤️ using React 19, TypeScript, and modern web technologies**