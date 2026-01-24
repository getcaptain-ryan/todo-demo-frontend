# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install dependencies only when needed
WORKDIR /app

# Copy package files from app directory
COPY app/package.json app/yarn.lock ./

# Install dependencies with frozen lockfile
RUN yarn install --frozen-lockfile --production=false

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code from app directory
COPY app/ .

# Build the application
RUN yarn build

# Stage 3: Production with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script for runtime environment variable injection
COPY app/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Expose port (Railway will map this)
EXPOSE 8080

# Use entrypoint script to inject runtime environment variables
ENTRYPOINT ["/docker-entrypoint.sh"]

