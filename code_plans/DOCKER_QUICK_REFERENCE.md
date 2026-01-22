# Docker & Railway Quick Reference Guide

## Quick Commands

### Local Docker Testing

```bash
# Build the image
cd app
docker build -t todo-frontend:local .

# Build with environment variables
docker build --build-arg VITE_API_BASE_URL=http://localhost:8001/api -t todo-frontend:local .

# Run the container
docker run -p 8080:8080 todo-frontend:local

# Run in background
docker run -d -p 8080:8080 --name todo-frontend todo-frontend:local

# View logs
docker logs todo-frontend
docker logs -f todo-frontend  # Follow logs

# Stop and remove
docker stop todo-frontend
docker rm todo-frontend

# Remove image
docker rmi todo-frontend:local
```

### Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Deploy manually
railway up

# Check status
railway status
```

## Environment Variables

### Required for Railway

```bash
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

## Testing Checklist

- [ ] `docker build` succeeds
- [ ] `docker run` starts container
- [ ] `curl http://localhost:8080/health` returns 200
- [ ] App loads at `http://localhost:8080`
- [ ] No console errors
- [ ] API calls work (if backend running)
- [ ] Page refresh works (SPA routing)

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check .dockerignore, verify package.json |
| 404 on refresh | Add SPA fallback to nginx.conf |
| Env vars not working | Prefix with `VITE_`, rebuild image |
| CORS errors | Configure backend CORS settings |
| Health check fails | Verify /health endpoint in nginx.conf |

## Performance Targets

- Build time: < 3 minutes
- Image size: < 100 MB (nginx)
- Startup time: < 10 seconds
- Memory usage: < 50 MB

