# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**UCSC Assessment Hub** is a university assessment management system built with TanStack Start (React SSR framework) in an Nx monorepo. The project is currently in **Phase 1: Foundation** - establishing the technical infrastructure for authentication, routing, and UI components with WCAG 2.1 AA accessibility standards.

## Tech Stack

- **Monorepo:** Nx workspace
- **Package Manager:** pnpm (workspace-aware, required for this monorepo)
- **Frontend Framework:** TanStack Start (React SSR with Vite)
- **Routing:** TanStack Router (file-based, type-safe)
- **Styling:** Tailwind CSS v4 with Vite plugin
- **Testing:** Vitest with React Testing Library
- **Server Runtime:** Nitro (via TanStack Start)
- **TypeScript:** Strict mode enabled

## Development Commands

All commands should be run from the repository root using pnpm.

### Portal App Development

```bash
# Start development server (runs on port 3000)
pnpm --filter portal dev

# Build for production
pnpm --filter portal build

# Preview production build
pnpm --filter portal preview

# Run tests
pnpm --filter portal test

# Type checking
pnpm --filter portal typecheck
```

### Using Nx (Alternative)

```bash
# Run any target via Nx (with caching)
pnpm nx run portal:dev
pnpm nx run portal:build
pnpm nx run portal:test

# Run targets for all projects
pnpm nx run-many --target=build --all
pnpm nx run-many --target=test --all
```

### Shared Libraries

```bash
# Libraries are imported directly, no separate build needed
# They use TypeScript path aliases defined in tsconfig.base.json
```

## Architecture

### Monorepo Structure

```
ucsc-portal/
├── apps/
│   └── portal/              # Main TanStack Start application
│       ├── src/
│       │   ├── routes/      # File-based routing (TanStack Router)
│       │   ├── components/  # App-specific components
│       │   ├── router.tsx   # Router configuration
│       │   └── styles.css   # Global styles
│       ├── vite.config.ts   # Vite + TanStack Start config
│       └── package.json     # Portal-specific dependencies
├── libs/
│   ├── auth/                # @ucsc-hub/auth - OAuth2/OIDC authentication
│   ├── ui/                  # @ucsc-hub/ui - Shared UI components (WCAG 2.1 AA)
│   └── api-client/          # @ucsc-hub/api-client - Data fetching & queries
├── docs/                    # Project documentation and PRDs
├── nx.json                  # Nx configuration
├── tsconfig.base.json       # Shared TypeScript config with path aliases
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

### Import Aliases

TypeScript path aliases are configured in `tsconfig.base.json`:

```typescript
import { useAuthContext } from '@/auth/context/AuthProvider'
import { Button } from '@/ui/components/Button'
import { useQuery } from '@/api/queries/assessments'
```

### Authentication Library (@ucsc-hub/auth)

**Location:** `libs/auth/src/`

**Key Files:**
- `types/auth.types.ts` - Comprehensive TypeScript types for User, Session, Role, AuthState, AuthError
- `context/AuthProvider.tsx` - Production-ready React context for global auth state

**Authentication System:**
- **Flow:** OAuth2/OIDC with authorization code flow
- **Session Management:** LocalStorage persistence with automatic refresh
- **Session Validation:** Periodic checks (1 min intervals), idle timeout (30 min), auto-refresh (5 min before expiry)
- **Security:** PKCE support, state/nonce parameters, secure token handling
- **Type Safety:** Fully typed with guards (`isRole`, `isAuthError`)

**User Roles:** `student`, `instructor`, `admin`, `staff`

**Usage Pattern:**
```typescript
import { AuthProvider, useAuthContext } from '@/auth/context/AuthProvider'

// Wrap app
<AuthProvider>
  <App />
</AuthProvider>

// In components
const { user, isAuthenticated, login, logout, hasRole } = useAuthContext()
```

**Important Notes:**
- TODO placeholders exist for OAuth provider integration (search for `TODO:` in `AuthProvider.tsx`)
- Environment variables needed: `VITE_OAUTH_CLIENT_ID`, `VITE_OAUTH_AUTHORITY`, `VITE_OAUTH_REDIRECT_URI`
- Session storage keys are namespaced with `ucsc_hub_` prefix

### Routing (TanStack Router)

**Location:** `apps/portal/src/routes/`

**Pattern:** File-based routing with automatic route tree generation
- `__root.tsx` - Root layout with Header, Scripts, HeadContent
- `index.tsx` - Home/dashboard route
- Routes are type-safe and generated into `routeTree.gen.ts`

**Adding New Routes:**
1. Create file in `src/routes/` (e.g., `assessments.tsx` for `/assessments`)
2. TanStack Router automatically generates route tree on save
3. Use `createRoute` or `createFileRoute` for route definitions
4. Access route params/search with full type safety

**Route Guards:** Implement `beforeLoad` for authentication/authorization checks

### Vite Configuration

**Key Plugins (apps/portal/vite.config.ts):**
1. `@tanstack/devtools-vite` - TanStack DevTools
2. `nitro/vite` - Server runtime
3. `vite-tsconfig-paths` - Path alias resolution
4. `@tailwindcss/vite` - Tailwind v4 integration
5. `@tanstack/react-start/plugin/vite` - TanStack Start
6. `@vitejs/plugin-react` - React support

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# OAuth2/OIDC (Phase 2 - not yet implemented)
VITE_OAUTH_CLIENT_ID=your-client-id
VITE_OAUTH_AUTHORITY=https://auth.ucsc.edu
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# API Gateway (Phase 2)
VITE_API_BASE_URL=http://localhost:3333

# Environment
VITE_ENV=development
NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

## WCAG 2.1 AA Accessibility

This project adheres to **WCAG 2.1 AA** accessibility standards. When developing:

- Use semantic HTML elements
- Ensure color contrast ratios meet standards (defined in UI library)
- Implement keyboard navigation (see `@/ui/hooks/useKeyboardNav` when available)
- Manage focus appropriately (see `@/ui/hooks/useFocusManagement` when available)
- Include ARIA labels where needed
- Test with screen readers when possible

**Planned:** Integration of `@axe-core/react` for automated accessibility testing in CI

## Phase 1 Deliverables

The project is in **Phase 1: Foundation (2-3 weeks)**. Current focus:

1. ✅ Nx monorepo with TanStack Start integration
2. 🚧 OAuth2/OIDC authentication infrastructure (types complete, provider integration TODO)
3. 🚧 Landing portal UI and navigation
4. 🚧 Type-safe routing with TanStack Router
5. 🚧 Shared UI component library (@ucsc-hub/ui)
6. ✅ Environment configuration
7. 🚧 Documentation and CI/CD setup

**Phase 2+ (Not Started):** API Gateway, RDS/Redshift integration, Playwright E2E tests, analytics, offline support

## Working with This Codebase

### Creating New Shared Libraries

```bash
# Generate new library with Nx
pnpm nx g @nx/react:library <lib-name> --bundler=vite

# Update tsconfig.base.json paths if needed
```

### Testing

- **Framework:** Vitest with jsdom
- **Location:** Colocate tests with source files or in `__tests__` directories
- **Run tests:** `pnpm --filter portal test` or `pnpm nx run portal:test`
- **Testing Library:** `@testing-library/react` is available for component tests

### Type Checking

Always run type checking before committing:
```bash
pnpm --filter portal typecheck
```

**Note:** There's a typo in `apps/portal/package.json` - duplicate `srcripts` field (line 41) should be removed.

### Package Management Rules

- **Always use pnpm** (not npm/yarn) - this is a pnpm workspace
- Add dependencies to the appropriate package.json:
  - `apps/portal/package.json` - Portal-specific deps
  - `libs/*/package.json` - Library-specific deps
  - Root `package.json` - Workspace-wide deps (rare)
- Install: `pnpm add <package> --filter <workspace-name>`
- Dev dependencies: `pnpm add -D <package> --filter <workspace-name>`

### Git Workflow

- Branch from `master`
- Commit messages should include `Co-Authored-By: Warp <agent@warp.dev>` when using Warp AI

## Known Technical Debt

See `docs/prd_phase1_foundation.md` for comprehensive Phase 1 plan and Phase 2+ deferred items:
- Backend API integration
- Database connections (RDS/Redshift)
- E2E testing with Playwright
- Analytics integration
- Offline support
- CI/CD pipeline completion

## Documentation

- `docs/prd_phase1_foundation.md` - Phase 1 detailed plan and deliverables
- `docs/phase1_sprint_board.md` - Sprint board for Phase 1 tasks
- `docs/202512181446_prd_ucsc-fe_v1.md` - Original PRD
- `apps/portal/README.md` - TanStack Start scaffolding guide (template documentation)

## Key Patterns to Follow

1. **Authentication:** Always use `useAuthContext()` hook, never access localStorage directly for auth
2. **Routing:** Use TanStack Router's type-safe navigation, not `react-router`
3. **Styling:** Use Tailwind CSS classes, follow WCAG color contrast standards
4. **Type Safety:** Strict TypeScript - no `any` types without explicit justification
5. **Error Handling:** Use `AuthError` type for auth-related errors with proper error codes
6. **Imports:** Use path aliases (`@/auth/*`, `@/ui/*`, `@/api/*`) for shared library imports
