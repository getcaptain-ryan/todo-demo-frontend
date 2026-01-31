# GitHub Workflows

## Deploy to Railway Production

This workflow automates the deployment of the todo-demo-frontend to Railway.

### Prerequisites

Before using this workflow, you need to configure the following secrets in your GitHub repository:

1. **RAILWAY_TOKEN**: Your Railway API token
   - Get it from: https://railway.app/account/tokens
   - Add to: Repository Settings → Secrets and variables → Actions → New repository secret

2. **RAILWAY_SERVICE_ID**: Your Railway service ID
   - Get it from your Railway project dashboard or CLI
   - Add to: Repository Settings → Secrets and variables → Actions → New repository secret

### How to Use

1. **Create a version tag** (if it doesn't exist):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Trigger the workflow**:
   - Go to: Actions → Deploy to Railway Production → Run workflow
   - Select the branch (usually `main`)
   - Enter the version tag (e.g., `v1.0.0`)
   - Select the environment (`production` or `staging`)
   - Click "Run workflow"

### Workflow Steps

The workflow consists of 4 main jobs:

#### 1. Validate
- Checks if the specified version tag exists in the repository
- Validates semantic versioning format (optional warning)

#### 2. Deploy
- Checks out the code at the specified version tag
- Deploys to Railway using the Railway CLI
- Waits 45 seconds for deployment to stabilize

#### 3. Verify
- Fetches the service URL from Railway
- Runs health checks against the `/health` endpoint
- Retries up to 10 times with 10-second delays
- Fetches deployment logs if verification fails

#### 4. Rollback (on failure)
- Automatically triggers if deploy or verify jobs fail
- Rolls back to the previous deployment
- Notifies about the rollback

#### 5. Tag Release (on success)
- Creates a GitHub Release with deployment details
- Includes version, environment, and configuration information
- Marks as prerelease if version contains a hyphen (e.g., `v1.0.0-beta`)

### Health Check

The workflow expects your frontend to have a `/health` endpoint that returns a response containing "ok".

Based on your nginx configuration, this should be set up in `app/nginx.conf`.

### Troubleshooting

**Workflow fails at validation:**
- Ensure the tag exists: `git tag -l`
- Create the tag if missing: `git tag v1.0.0 && git push origin v1.0.0`

**Workflow fails at deployment:**
- Check that `RAILWAY_TOKEN` is valid and not expired
- Verify `RAILWAY_SERVICE_ID` is correct
- Check Railway dashboard for service status

**Health check fails:**
- Verify the `/health` endpoint is configured in nginx
- Check Railway logs for startup errors
- Ensure the service has a public domain configured

**Rollback fails:**
- Manual intervention may be required
- Check Railway dashboard and manually rollback if needed

### Environment Variables

The workflow uses these environment variables:
- `SERVICE_NAME`: Set to `todo-demo-frontend` (defined in workflow)
- `RAILWAY_TOKEN`: Your Railway API token (from secrets)
- `RAILWAY_SERVICE_ID`: Your Railway service ID (from secrets)

### Railway Configuration

Make sure your Railway service is configured with:
- `VITE_API_BASE_URL`: Backend API URL (e.g., `https://your-backend.railway.app/api`)
- Build settings pointing to the Dockerfile in the `app` directory

The workflow uses the `railway.toml` configuration at the root of your repository.

### Version Format

Recommended version format: `vMAJOR.MINOR.PATCH[-PRERELEASE]`

Examples:
- `v1.0.0` - Production release
- `v1.2.3` - Production release
- `v2.0.0-beta` - Prerelease (marked as prerelease in GitHub)
- `v1.0.0-rc.1` - Release candidate (marked as prerelease in GitHub)

### Notes

- The workflow uses `workflow_dispatch`, meaning it must be triggered manually
- Deployments are tagged and tracked in GitHub Releases
- The workflow includes automatic rollback on failure
- Health checks can be skipped if no public domain is configured

