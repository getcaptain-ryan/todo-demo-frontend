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

# Environment variables (set in Railway dashboard)
# VITE_API_BASE_URL will be injected during build
```

### nginx Configuration

**Location**: `app/nginx.conf`

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Disable access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

### .dockerignore File

**Location**: `app/.dockerignore`

```
node_modules
dist
.git
.gitignore
.env
.env.local
.env.*.local
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.vscode
.idea
coverage
*.md
!README.md
.eslintcache
.prettierignore
.prettierrc
vitest.config.ts
```

---

## 3. Environment Management

### Environment Variables Strategy

Railway uses build-time environment variables for Vite applications since the build output is static.

#### Required Environment Variables

Set these in Railway's dashboard under your service settings:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_BASE_URL` | Backend API URL | `https://your-backend.railway.app/api` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port (optional) | `8080` |

#### Setting Variables in Railway

1. Navigate to your frontend service in Railway dashboard
2. Go to **Variables** tab
3. Add the following variables:
   - `VITE_API_BASE_URL`: Set to your backend service URL
   - Railway automatically provides `RAILWAY_STATIC_URL` and other variables

#### Local .env File (for development)

**Location**: `app/.env`

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

**Location**: `app/.env.production` (optional)

```env
# This file is for local production builds only
# Railway will override these with dashboard variables
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### Handling API Proxy in Production

The Vite dev server proxy (`/api` → `http://localhost:8001`) only works in development. In production:

1. **Option 1: Direct API Calls** (Recommended)
   - Frontend makes direct calls to backend URL
   - Set `VITE_API_BASE_URL` to full backend URL
   - Current implementation in `src/lib/api.ts` already supports this

2. **Option 2: nginx Reverse Proxy**
   - Configure nginx to proxy `/api` requests to backend
   - Useful if you need CORS handling or path rewriting

**nginx proxy configuration** (if using Option 2):

```nginx
# Add this to nginx.conf inside the server block
location /api {
    proxy_pass https://your-backend.railway.app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```



---

## 4. Optimization Techniques

### Docker Layer Caching

The multi-stage Dockerfile is optimized for layer caching:

1. **Dependencies layer**: Only rebuilds when `package.json` or `yarn.lock` changes
2. **Source code layer**: Rebuilds when source files change
3. **Build layer**: Cached if dependencies and source haven't changed

### Build Performance Optimizations

#### 1. Use .dockerignore
Prevents unnecessary files from being sent to Docker build context.

#### 2. Parallel Dependency Installation
Yarn automatically parallelizes package installation.

#### 3. Production Dependencies Only (if using serve)
```dockerfile
RUN yarn install --frozen-lockfile --production=true
```

### Image Size Optimizations

| Technique | Impact | Implementation |
|-----------|--------|----------------|
| Alpine base images | ~70% smaller | `node:20-alpine`, `nginx:alpine` |
| Multi-stage builds | Removes build tools | Separate builder and production stages |
| Production dependencies | Smaller node_modules | `--production=true` flag |
| Static file serving | No Node.js runtime | nginx serves pre-built files |

**Expected Image Sizes:**
- With nginx: ~25-30 MB
- With serve: ~150-200 MB

### Security Best Practices

#### 1. Non-Root User (for serve-based deployment)

```dockerfile
# Create and use non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs
```

#### 2. Minimal Attack Surface
- Use Alpine Linux (minimal packages)
- No unnecessary build tools in production image
- Only include built assets, not source code

#### 3. Security Headers
Configured in nginx.conf (see above)

#### 4. Regular Updates
```dockerfile
# Add to Dockerfile before installing packages
RUN apk update && apk upgrade
```

### Health Checks

#### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1
```

#### Railway Health Check
Configured in `railway.toml`:
```toml
healthcheckPath = "/health"
healthcheckTimeout = 100
```

---

## 5. Local Testing

### Build and Test Docker Image Locally

#### Step 1: Build the Image

```bash
# Navigate to app directory
cd app

# Build the Docker image
docker build -t todo-frontend:local .

# Build with build arguments
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8001/api \
  -t todo-frontend:local .
```

#### Step 2: Run the Container

```bash
# Run the container
docker run -p 8080:8080 todo-frontend:local

# Run with environment variables
docker run \
  -p 8080:8080 \
  -e VITE_API_BASE_URL=http://localhost:8001/api \
  todo-frontend:local

# Run in detached mode
docker run -d -p 8080:8080 --name todo-frontend todo-frontend:local
```

#### Step 3: Test the Application

```bash
# Open in browser
open http://localhost:8080

# Test health endpoint
curl http://localhost:8080/health

# Check container logs
docker logs todo-frontend

# Check container status
docker ps

# Stop the container
docker stop todo-frontend

# Remove the container
docker rm todo-frontend
```

### Docker Compose for Local Development

**Location**: `app/docker-compose.yml`

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:8001/api
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**Usage:**
```bash
# Start the service
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Testing Checklist

- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] Health check endpoint returns 200
- [ ] Application loads in browser
- [ ] Static assets load correctly (CSS, JS, images)
- [ ] SPA routing works (refresh on any route)
- [ ] API calls work (if backend is running)
- [ ] No console errors in browser
- [ ] Gzip compression is working (check network tab)
- [ ] Security headers are present

---

## 6. Deployment Process

### Initial Railway Setup

#### Step 1: Prepare Repository

```bash
# Ensure all files are committed
git add app/Dockerfile app/nginx.conf app/railway.toml app/.dockerignore
git commit -m "Add Docker configuration for Railway deployment"
git push origin main
```

#### Step 2: Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will detect the Dockerfile automatically

#### Step 3: Configure Service

1. **Set Root Directory** (if needed):
   - Go to **Settings** → **Service Settings**
   - Set **Root Directory** to `app`

2. **Configure Environment Variables**:
   - Go to **Variables** tab
   - Add `VITE_API_BASE_URL` with your backend URL
   - Example: `https://your-backend-service.railway.app/api`

3. **Configure Build Settings**:
   - Railway should auto-detect the Dockerfile
   - Verify **Builder** is set to `DOCKERFILE`
   - Verify **Dockerfile Path** is `Dockerfile` (or `app/Dockerfile` if root is repo root)

4. **Configure Networking**:
   - Railway will automatically assign a public URL
   - Port 8080 will be automatically mapped
   - Enable **Public Networking** if not already enabled

#### Step 4: Deploy

Railway will automatically deploy when you push to your main branch.

**Manual deployment:**
1. Go to **Deployments** tab
2. Click **"Deploy"** button
3. Monitor build logs

### Connecting Frontend to Backend

#### Option 1: Using Railway's Internal Network (Recommended)

If both frontend and backend are on Railway:

1. **Get Backend Internal URL**:
   - Go to backend service
   - Copy the **Private Networking** URL (e.g., `backend.railway.internal`)

2. **Set Frontend Environment Variable**:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

   Note: Use public URL for frontend-to-backend calls since the frontend runs in the browser

#### Option 2: Using Public URLs

Set the backend's public Railway URL:
```
VITE_API_BASE_URL=https://your-backend-production.up.railway.app/api
```

### Continuous Deployment

Railway automatically deploys on every push to the connected branch.

**Configure Auto-Deploy:**
1. Go to **Settings** → **Service Settings**
2. Under **Source**, verify:
   - **Branch** is set to `main` (or your preferred branch)
   - **Auto-Deploy** is enabled

**Deployment Triggers:**
- Push to connected branch
- Manual trigger from Railway dashboard
- API/CLI deployment

### Monitoring Deployment

#### Build Logs
```bash
# View in Railway dashboard
# Or use Railway CLI
railway logs --service frontend
```

#### Deployment Status
- **Building**: Docker image is being built
- **Deploying**: Container is starting
- **Active**: Service is running
- **Failed**: Check logs for errors

---

## 7. Troubleshooting

### Common Issues and Solutions

#### Issue 1: Build Fails - "Cannot find module"

**Symptoms:**
```
Error: Cannot find module '@/components/...'
```

**Solution:**
Ensure TypeScript path aliases are configured correctly:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Issue 2: Environment Variables Not Working

**Symptoms:**
- API calls fail
- `import.meta.env.VITE_API_BASE_URL` is undefined

**Solution:**
1. Verify variable is prefixed with `VITE_`
2. Set variable in Railway dashboard (not in code)
3. Rebuild the application (environment variables are baked into build)
4. Check build logs to confirm variable was set

```bash
# In Railway build logs, you should see:
# VITE_API_BASE_URL=https://...
```

#### Issue 3: 404 on Page Refresh (SPA Routing)

**Symptoms:**
- Direct navigation to `/todos` works
- Refreshing the page shows 404

**Solution:**
Ensure nginx.conf has SPA fallback:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Issue 4: CORS Errors

**Symptoms:**
```
Access to fetch at 'https://backend...' from origin 'https://frontend...'
has been blocked by CORS policy
```

**Solution:**
Configure CORS on the backend to allow frontend origin:
```python
# Backend (FastAPI example)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Issue 5: Container Fails Health Check

**Symptoms:**
- Container restarts repeatedly
- Railway shows "Unhealthy" status

**Solution:**
1. Check health endpoint is accessible:
   ```bash
   curl https://your-app.railway.app/health
   ```

2. Verify nginx.conf has health endpoint:
   ```nginx
   location /health {
       return 200 "healthy\n";
   }
   ```

3. Increase health check timeout in railway.toml:
   ```toml
   healthcheckTimeout = 200
   ```

#### Issue 6: Static Assets Not Loading

**Symptoms:**
- Blank page
- Console errors: "Failed to load resource"
- CSS/JS files return 404

**Solution:**
1. Verify build output directory:
   ```dockerfile
   COPY --from=builder /app/dist /usr/share/nginx/html
   ```

2. Check Vite build output:
   ```bash
   yarn build
   ls -la dist/
   ```

3. Ensure nginx root is correct:
   ```nginx
   root /usr/share/nginx/html;
   ```

#### Issue 7: Large Image Size / Slow Builds

**Symptoms:**
- Build takes > 5 minutes
- Image size > 500 MB

**Solution:**
1. Use Alpine base images
2. Implement multi-stage builds
3. Add comprehensive .dockerignore
4. Use nginx instead of serve

**Optimization:**
```dockerfile
# Before: node:20 (900+ MB)
FROM node:20

# After: node:20-alpine (150 MB)
FROM node:20-alpine
```

#### Issue 8: Port Binding Issues

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solution:**
1. Railway automatically assigns PORT environment variable
2. Use Railway's PORT or default to 8080:
   ```dockerfile
   # For serve-based deployment
   CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
   ```

3. For nginx, Railway handles port mapping automatically

### Debugging Commands

```bash
# Check Railway service status
railway status

# View live logs
railway logs --service frontend

# SSH into container (if enabled)
railway shell

# Check environment variables
railway variables

# Force redeploy
railway up --service frontend

# Check build logs
railway logs --deployment <deployment-id>
```

### Performance Monitoring

#### Metrics to Monitor
- **Build Time**: Should be < 3 minutes
- **Image Size**: Should be < 100 MB (nginx) or < 200 MB (serve)
- **Startup Time**: Should be < 10 seconds
- **Memory Usage**: Should be < 50 MB (nginx) or < 100 MB (serve)
- **Response Time**: Should be < 100ms for static assets

#### Railway Metrics
Access in Railway dashboard:
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response times

---

## Summary

### Files to Create

1. **app/Dockerfile** - Multi-stage Docker build configuration
2. **app/nginx.conf** - nginx server configuration
3. **app/railway.toml** - Railway deployment configuration
4. **app/.dockerignore** - Files to exclude from Docker build
5. **app/.env.production** - Production environment variables (optional)
6. **app/docker-compose.yml** - Local testing with Docker Compose (optional)

### Key Configuration Points

| Component | Setting | Value |
|-----------|---------|-------|
| Base Image | Node.js | `node:20-alpine` |
| Web Server | nginx | `nginx:alpine` |
| Port | Container | `8080` |
| Health Check | Path | `/health` |
| Build Command | Vite | `yarn build` |
| Output Directory | Vite | `dist/` |
| Environment Variable | API URL | `VITE_API_BASE_URL` |

### Deployment Checklist

- [ ] Create Dockerfile in `app/` directory
- [ ] Create nginx.conf in `app/` directory
- [ ] Create railway.toml in `app/` directory
- [ ] Create .dockerignore in `app/` directory
- [ ] Test Docker build locally
- [ ] Test Docker container locally
- [ ] Commit and push to GitHub
- [ ] Create Railway project
- [ ] Configure environment variables in Railway
- [ ] Set root directory to `app` (if needed)
- [ ] Verify auto-deploy is enabled
- [ ] Monitor first deployment
- [ ] Test deployed application
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and alerts

### Next Steps

1. **Create Docker Configuration Files**: Use the templates provided in this document
2. **Test Locally**: Build and run the Docker container on your machine
3. **Deploy to Railway**: Push to GitHub and configure Railway project
4. **Connect to Backend**: Set VITE_API_BASE_URL to backend service URL
5. **Monitor and Optimize**: Track performance metrics and optimize as needed

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [nginx Configuration Guide](https://nginx.org/en/docs/)
- [React Deployment Guide](https://react.dev/learn/start-a-new-react-project#deploying-to-production)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Compatibility**: React 19, Vite 7.x, Railway Platform

