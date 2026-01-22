# React Frontend Setup Plan

## Overview
This document provides a comprehensive plan for setting up a React 19 frontend application with Vite, TypeScript, Tailwind CSS, Shadcn/ui, and all required tooling.

## Technology Stack
- **Build Tool**: Vite (latest stable)
- **Framework**: React 19
- **Language**: TypeScript
- **Package Manager**: Yarn
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Button, Card, Form)
- **Validation**: Zod
- **HTTP Client**: Axios
- **Data Fetching**: TanStack Query (React Query)
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Server Configuration
- **Dev Server Port**: 3002
- **API Proxy Target**: http://localhost:8001
- **API Type**: REST

---

## Step-by-Step Setup Instructions

### Step 1: Initialize Vite Project with Yarn

```bash
# Create the app folder and initialize Vite project
yarn create vite app --template react-ts

# Navigate to the app folder
cd app

# Install dependencies
yarn install
```

### Step 2: Install Core Dependencies

```bash
# Install Tailwind CSS and its dependencies
yarn add -D tailwindcss postcss autoprefixer

# Install Shadcn/ui dependencies
yarn add class-variance-authority clsx tailwind-merge lucide-react

# Install form handling and validation
yarn add react-hook-form @hookform/resolvers zod

# Install Axios and TanStack Query
yarn add axios @tanstack/react-query @tanstack/react-query-devtools

# Install Radix UI primitives (required for Shadcn/ui components)
yarn add @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog
```

### Step 3: Install Development Dependencies

```bash
# Install Vitest and testing utilities
yarn add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install ESLint and Prettier
yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
yarn add -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh

# Install additional type definitions
yarn add -D @types/node
```

### Step 4: Initialize Tailwind CSS

```bash
# Generate Tailwind config files
npx tailwindcss init -p
```

### Step 5: Initialize Shadcn/ui

```bash
# Initialize Shadcn/ui (this creates components.json)
npx shadcn-ui@latest init

# When prompted, select:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: tailwind.config.js
# - Components location: @/components
# - Utils location: @/lib/utils
# - React Server Components: No
# - Write configuration: Yes

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
```

---

## Project Folder Structure

```
app/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn/ui components (auto-generated)
│   │   └── HelloWorld.tsx   # Starter component
│   ├── lib/
│   │   ├── api.ts           # Axios instance configuration
│   │   └── utils.ts         # Utility functions (Shadcn/ui utils)
│   ├── hooks/
│   │   └── useExample.ts    # Custom hooks
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── .prettierignore
├── components.json          # Shadcn/ui config
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```


---

## Configuration Files

### 1. package.json Scripts

Update the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\""
  }
}
```

### 2. Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 3. Vitest Configuration (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 4. TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 5. TypeScript Node Configuration (tsconfig.node.json)

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

### 6. Tailwind Configuration (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 7. PostCSS Configuration (postcss.config.js)

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 8. ESLint Configuration (.eslintrc.cjs)

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
```

### 9. Prettier Configuration (.prettierrc)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### 10. Prettier Ignore (.prettierignore)

```
node_modules
dist
build
coverage
.vite
*.min.js
*.min.css
```

### 11. Environment Variables (.env)

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

### 12. Environment Variables Example (.env.example)

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

### 13. Shadcn/ui Configuration (components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 14. Vitest Setup File (src/test/setup.ts)

```typescript
import '@testing-library/jest-dom'
```

### 15. Git Ignore (.gitignore)

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local
```



---

## Source Code Files

### 1. Main Entry Point (src/main.tsx)

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### 2. App Component (src/App.tsx)

```typescript
import HelloWorld from './components/HelloWorld'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <HelloWorld />
    </div>
  )
}

export default App
```

### 3. Global Styles (src/index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 4. Axios Instance (src/lib/api.ts)

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      // Optionally redirect to login
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### 5. Utility Functions (src/lib/utils.ts)

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 6. Hello World Component (src/components/HelloWorld.tsx)

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HelloWorld() {
  const handleClick = () => {
    alert('Hello from React 19 + Vite + TypeScript!')
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Hello World</CardTitle>
          <CardDescription>
            React 19 + Vite + TypeScript + Tailwind + Shadcn/ui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Your frontend application is successfully set up and running!
          </p>
          <Button onClick={handleClick} className="w-full">
            Click Me
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```



### 7. Type Definitions (src/types/index.ts)

```typescript
// Example type definitions for your application

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}
```

### 8. Example Custom Hook (src/hooks/useTodos.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import type { Todo, ApiResponse } from '@/types'

// Example hook for fetching todos
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Todo[]>>('/todos')
      return response.data.data
    },
  })
}

// Example hook for creating a todo
export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post<ApiResponse<Todo>>('/todos', newTodo)
      return response.data.data
    },
    onSuccess: () => {
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

### 9. Example Test (src/components/HelloWorld.test.tsx)

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HelloWorld from './HelloWorld'

describe('HelloWorld', () => {
  it('renders hello world component', () => {
    render(<HelloWorld />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('shows alert when button is clicked', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<HelloWorld />)

    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)

    expect(alertMock).toHaveBeenCalledWith('Hello from React 19 + Vite + TypeScript!')
    alertMock.mockRestore()
  })
})
```

---

## Complete Execution Plan

### Phase 1: Project Initialization

```bash
# Step 1: Create Vite project
yarn create vite app --template react-ts
cd app
yarn install

# Step 2: Install Tailwind CSS
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Phase 2: Install Dependencies

```bash
# Core dependencies
yarn add class-variance-authority clsx tailwind-merge lucide-react
yarn add react-hook-form @hookform/resolvers zod
yarn add axios @tanstack/react-query @tanstack/react-query-devtools
yarn add @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog
yarn add tailwindcss-animate

# Development dependencies
yarn add -D vitest @vitest/ui jsdom
yarn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
yarn add -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
yarn add -D @types/node
```

### Phase 3: Configure Shadcn/ui

```bash
# Initialize Shadcn/ui
npx shadcn-ui@latest init

# Install components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
```

### Phase 4: Create Configuration Files

1. Update `vite.config.ts` with the configuration provided above
2. Create `vitest.config.ts`
3. Update `tsconfig.json` and `tsconfig.node.json`
4. Update `tailwind.config.js`
5. Create `.eslintrc.cjs`
6. Create `.prettierrc` and `.prettierignore`
7. Create `.env` and `.env.example`
8. Update `components.json` (created by Shadcn/ui init)

### Phase 5: Create Folder Structure

```bash
# Create necessary directories
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/test
```

### Phase 6: Create Source Files

1. Update `src/main.tsx` with TanStack Query provider
2. Update `src/App.tsx`
3. Update `src/index.css` with Tailwind and CSS variables
4. Create `src/lib/api.ts` (Axios instance)
5. Create `src/lib/utils.ts` (utility functions)
6. Create `src/components/HelloWorld.tsx`
7. Create `src/types/index.ts`
8. Create `src/hooks/useTodos.ts` (example)
9. Create `src/test/setup.ts`

### Phase 7: Run and Verify

```bash
# Run development server
yarn dev

# In another terminal, run tests
yarn test

# Run linting
yarn lint

# Format code
yarn format
```

---

## Verification Checklist

- [ ] Vite dev server runs on port 3002
- [ ] Hello World component displays correctly
- [ ] Tailwind CSS styles are applied
- [ ] Shadcn/ui components render properly
- [ ] Button click shows alert
- [ ] No TypeScript errors
- [ ] ESLint passes with no errors
- [ ] Prettier formatting works
- [ ] Tests run successfully
- [ ] API proxy is configured (test with backend when available)
- [ ] Environment variables are loaded correctly
- [ ] TanStack Query DevTools appear in the browser

---

## Next Steps

After completing the setup:

1. **Connect to Backend**: Test API calls to your backend on port 8001
2. **Build Todo Features**: Implement todo CRUD operations using the hooks
3. **Add Forms**: Use Shadcn/ui form components with react-hook-form and Zod
4. **Write Tests**: Add comprehensive tests for components and hooks
5. **Optimize Build**: Configure production build settings
6. **Add Error Handling**: Implement global error boundaries
7. **Improve UX**: Add loading states, error messages, and success notifications

---

## Troubleshooting

### Common Issues

**Issue**: Module not found errors
- **Solution**: Ensure `@types/node` is installed and `tsconfig.json` has correct path mappings

**Issue**: Tailwind styles not applying
- **Solution**: Check that `index.css` is imported in `main.tsx` and Tailwind directives are present

**Issue**: Shadcn/ui components not found
- **Solution**: Run `npx shadcn-ui@latest add <component-name>` for each component

**Issue**: Vite proxy not working
- **Solution**: Ensure backend is running on port 8001 and proxy config in `vite.config.ts` is correct

**Issue**: ESLint errors with React 19
- **Solution**: Ensure you have the latest versions of ESLint plugins

---

## Summary

This plan provides a complete setup for a modern React 19 frontend application with:
- ✅ Vite for fast development and optimized builds
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for utility-first styling
- ✅ Shadcn/ui for beautiful, accessible components
- ✅ Axios for HTTP requests
- ✅ TanStack Query for data fetching and caching
- ✅ Vitest for testing
- ✅ ESLint and Prettier for code quality
- ✅ Proper project structure and organization

Follow the execution plan step-by-step to set up your frontend application successfully!
