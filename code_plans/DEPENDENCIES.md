# Dependencies Reference Guide

Complete list of all dependencies for the React frontend application.

## Production Dependencies

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.x | React library (comes with Vite template) |
| `react-dom` | ^19.x | React DOM rendering (comes with Vite template) |

### Styling & UI
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | latest | Utility-first CSS framework |
| `class-variance-authority` | latest | CVA for component variants |
| `clsx` | latest | Conditional className utility |
| `tailwind-merge` | latest | Merge Tailwind classes without conflicts |
| `tailwindcss-animate` | latest | Animation utilities for Tailwind |
| `lucide-react` | latest | Icon library for React |

### Radix UI Primitives (for Shadcn/ui)
| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-slot` | latest | Slot component primitive |
| `@radix-ui/react-label` | latest | Label component primitive |
| `@radix-ui/react-dialog` | latest | Dialog/modal component primitive |

### Form Handling & Validation
| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | latest | Form state management and validation |
| `@hookform/resolvers` | latest | Validation resolvers for react-hook-form |
| `zod` | latest | TypeScript-first schema validation |

### Data Fetching & State
| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | latest | HTTP client for API requests |
| `@tanstack/react-query` | latest | Data fetching, caching, and state management |
| `@tanstack/react-query-devtools` | latest | DevTools for React Query |

## Development Dependencies

### Build Tools
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | latest | Build tool and dev server (comes with template) |
| `@vitejs/plugin-react` | latest | Vite plugin for React (comes with template) |

### TypeScript
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | latest | TypeScript compiler (comes with template) |
| `@types/node` | latest | Node.js type definitions |
| `@types/react` | latest | React type definitions (comes with template) |
| `@types/react-dom` | latest | React DOM type definitions (comes with template) |

### CSS Processing
| Package | Version | Purpose |
|---------|---------|---------|
| `postcss` | latest | CSS transformation tool |
| `autoprefixer` | latest | Add vendor prefixes to CSS |

### Testing
| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | latest | Unit testing framework |
| `@vitest/ui` | latest | UI for Vitest test runner |
| `jsdom` | latest | DOM implementation for testing |
| `@testing-library/react` | latest | React testing utilities |
| `@testing-library/jest-dom` | latest | Custom Jest matchers for DOM |
| `@testing-library/user-event` | latest | User interaction simulation |

### Code Quality
| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | latest | JavaScript/TypeScript linter |
| `prettier` | latest | Code formatter |
| `eslint-config-prettier` | latest | Disable ESLint rules that conflict with Prettier |
| `eslint-plugin-prettier` | latest | Run Prettier as ESLint rule |
| `@typescript-eslint/eslint-plugin` | latest | TypeScript ESLint rules |
| `@typescript-eslint/parser` | latest | TypeScript parser for ESLint |
| `eslint-plugin-react` | latest | React-specific ESLint rules |
| `eslint-plugin-react-hooks` | latest | ESLint rules for React Hooks |
| `eslint-plugin-react-refresh` | latest | ESLint rules for React Refresh |

## Complete Installation Commands

### All at Once (Recommended)

```bash
# Production dependencies
yarn add class-variance-authority clsx tailwind-merge lucide-react react-hook-form @hookform/resolvers zod axios @tanstack/react-query @tanstack/react-query-devtools @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog tailwindcss-animate

# Development dependencies
yarn add -D tailwindcss postcss autoprefixer vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh @types/node
```

### By Category (Alternative)

```bash
# Styling & UI
yarn add class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate
yarn add -D tailwindcss postcss autoprefixer

# Radix UI Primitives
yarn add @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog

# Forms & Validation
yarn add react-hook-form @hookform/resolvers zod

# Data Fetching
yarn add axios @tanstack/react-query @tanstack/react-query-devtools

# Testing
yarn add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Code Quality
yarn add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh

# TypeScript
yarn add -D @types/node
```

## Expected package.json

After installation, your `package.json` should look similar to this:

```json
{
  "name": "app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
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
  },
  "dependencies": {
    "@hookform/resolvers": "^3.x.x",
    "@radix-ui/react-dialog": "^1.x.x",
    "@radix-ui/react-label": "^2.x.x",
    "@radix-ui/react-slot": "^1.x.x",
    "@tanstack/react-query": "^5.x.x",
    "@tanstack/react-query-devtools": "^5.x.x",
    "axios": "^1.x.x",
    "class-variance-authority": "^0.x.x",
    "clsx": "^2.x.x",
    "lucide-react": "^0.x.x",
    "react": "^19.x.x",
    "react-dom": "^19.x.x",
    "react-hook-form": "^7.x.x",
    "tailwind-merge": "^2.x.x",
    "tailwindcss-animate": "^1.x.x",
    "zod": "^3.x.x"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.x.x",
    "@testing-library/react": "^16.x.x",
    "@testing-library/user-event": "^14.x.x",
    "@types/node": "^22.x.x",
    "@types/react": "^19.x.x",
    "@types/react-dom": "^19.x.x",
    "@typescript-eslint/eslint-plugin": "^8.x.x",
    "@typescript-eslint/parser": "^8.x.x",
    "@vitejs/plugin-react": "^4.x.x",
    "@vitest/ui": "^2.x.x",
    "autoprefixer": "^10.x.x",
    "eslint": "^9.x.x",
    "eslint-config-prettier": "^9.x.x",
    "eslint-plugin-prettier": "^5.x.x",
    "eslint-plugin-react": "^7.x.x",
    "eslint-plugin-react-hooks": "^5.x.x",
    "eslint-plugin-react-refresh": "^0.x.x",
    "jsdom": "^25.x.x",
    "postcss": "^8.x.x",
    "prettier": "^3.x.x",
    "tailwindcss": "^3.x.x",
    "typescript": "^5.x.x",
    "vite": "^6.x.x",
    "vitest": "^2.x.x"
  }
}
```

## Notes

- Version numbers shown are approximate and will be the latest compatible versions when installed
- Shadcn/ui components are installed separately via `npx shadcn-ui@latest add <component>`
- React 19 is the latest version as of this setup
- All dependencies are compatible with each other as of January 2026
