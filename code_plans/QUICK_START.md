# Quick Start Guide - React Frontend Setup

This is a condensed version of the complete setup plan. For detailed information, see `FRONTEND_SETUP_PLAN.md`.

## Prerequisites

- Node.js 18+ installed
- Yarn package manager installed
- Code editor (VS Code recommended)

## Quick Setup Commands

### 1. Initialize Project (5 minutes)

```bash
# Create Vite project
yarn create vite app --template react-ts
cd app
yarn install

# Initialize Tailwind
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Install All Dependencies (3 minutes)

```bash
# Core dependencies (one command)
yarn add class-variance-authority clsx tailwind-merge lucide-react react-hook-form @hookform/resolvers zod axios @tanstack/react-query @tanstack/react-query-devtools @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog tailwindcss-animate

# Dev dependencies (one command)
yarn add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh @types/node
```

### 3. Setup Shadcn/ui (2 minutes)

```bash
# Initialize and install components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label
```

### 4. Create Folder Structure (1 minute)

```bash
# Windows PowerShell
New-Item -ItemType Directory -Force -Path src/components/ui, src/lib, src/hooks, src/types, src/test

# Or manually create these folders:
# - src/components/ui
# - src/lib
# - src/hooks
# - src/types
# - src/test
```

### 5. Configuration Files

Copy the following files from `FRONTEND_SETUP_PLAN.md`:

**Required:**
- `vite.config.ts` - Dev server on port 3002, proxy to 8001
- `vitest.config.ts` - Test configuration
- `tsconfig.json` - TypeScript config with path aliases
- `tsconfig.node.json` - Node TypeScript config
- `tailwind.config.js` - Tailwind with Shadcn/ui theme
- `.eslintrc.cjs` - ESLint rules
- `.prettierrc` - Prettier formatting
- `.env` - Environment variables

**Create these files:**
- `src/lib/api.ts` - Axios instance
- `src/lib/utils.ts` - Utility functions
- `src/components/HelloWorld.tsx` - Starter component
- `src/types/index.ts` - Type definitions
- `src/test/setup.ts` - Test setup

**Update these files:**
- `src/main.tsx` - Add TanStack Query provider
- `src/App.tsx` - Use HelloWorld component
- `src/index.css` - Add Tailwind directives and CSS variables

### 6. Run the Application

```bash
# Start dev server (should run on http://localhost:3002)
yarn dev

# In another terminal - run tests
yarn test

# Check linting
yarn lint

# Format code
yarn format
```

## Key Configuration Highlights

### Vite Config
- Dev server: Port 3002
- API proxy: `/api` → `http://localhost:8001`
- Path alias: `@` → `./src`

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8001/api
```

### Package.json Scripts
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint . --ext ts,tsx",
  "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\""
}
```

## Verification

After setup, you should see:
- ✅ App running on http://localhost:3002
- ✅ Hello World card with a button
- ✅ Tailwind styles applied
- ✅ No TypeScript errors
- ✅ Tests passing
- ✅ TanStack Query DevTools in browser

## Next Steps

1. Test API connection to backend (port 8001)
2. Implement todo CRUD operations
3. Add forms using Shadcn/ui + react-hook-form + Zod
4. Write comprehensive tests
5. Add error handling and loading states

## Troubleshooting

**Port already in use:**
```bash
# Change port in vite.config.ts server.port
```

**Module not found:**
```bash
# Ensure @types/node is installed
yarn add -D @types/node
```

**Tailwind not working:**
```bash
# Check src/index.css has @tailwind directives
# Check index.css is imported in main.tsx
```

## File Checklist

- [ ] `vite.config.ts` - Port 3002, proxy configured
- [ ] `vitest.config.ts` - Test setup
- [ ] `tsconfig.json` - Path aliases configured
- [ ] `tailwind.config.js` - Shadcn/ui theme
- [ ] `.eslintrc.cjs` - Linting rules
- [ ] `.prettierrc` - Code formatting
- [ ] `.env` - API base URL
- [ ] `src/lib/api.ts` - Axios instance
- [ ] `src/lib/utils.ts` - cn() function
- [ ] `src/components/HelloWorld.tsx` - Starter component
- [ ] `src/main.tsx` - TanStack Query provider
- [ ] `src/App.tsx` - Updated with HelloWorld
- [ ] `src/index.css` - Tailwind + CSS variables

## Estimated Total Time: 15-20 minutes

For complete details, configuration files, and code examples, refer to `FRONTEND_SETUP_PLAN.md`.
