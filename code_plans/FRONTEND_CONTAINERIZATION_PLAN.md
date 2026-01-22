# Frontend Containerization Plan for Railway Deployment

## Overview
This document provides a comprehensive plan for containerizing the React 19 + Vite + TypeScript frontend application for deployment on Railway's platform with autodeploy capabilities.

## Table of Contents
1. [Dockerfile Strategy](#dockerfile-strategy)
2. [Railway Configuration](#railway-configuration)
3. [Environment Management](#environment-management)
4. [Optimization Techniques](#optimization-techniques)
5. [Local Testing](#local-testing)
6. [Deployment Process](#deployment-process)
7. [Troubleshooting](#troubleshooting)

---

## 1. Dockerfile Strategy

### Multi-Stage Build Architecture

The Dockerfile uses a three-stage build process to optimize for both build speed and final image size:

1. **Stage 1: Dependencies** - Install all dependencies with layer caching
2. **Stage 2: Builder** - Compile TypeScript and build production bundle
3. **Stage 3: Production** - Serve static files with nginx

### Dockerfile Implementation

**Location**: `app/Dockerfile`

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install dependencies only when needed
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with frozen lockfile
RUN yarn install --frozen-lockfile --production=false

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN yarn build

# Stage 3: Production with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Expose port (Railway will map this)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Alternative: Using `serve` Instead of nginx

For a simpler Node.js-based solution:

```dockerfile
# Stage 3: Production with serve (alternative)
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 8080

# Serve the application
CMD ["serve", "-s", "dist", "-l", "8080"]
```

---

## 2. Railway Configuration

### railway.toml Configuration

**Location**: `app/railway.toml`

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "nginx -g 'daemon off;'"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

