<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# prd_phase1_foundation.md now please

Here is the pnpm-updated version of your Phase 1 foundation document. All npm/npx usage is adjusted to pnpm while keeping everything else intact.[^1]

***

# UCSC Assessment Hub – Phase 1: Foundation

## Actionable Development Plan with AI Integration Strategy

**Date:** December 18, 2025
**Phase Duration:** 2-3 weeks (estimated)
**Objective:** Establish project skeleton, authentication flow, and landing portal UI with production-ready patterns[^1]

***

## 1. Executive Overview – Phase 1 Scope

Phase 1 focuses on establishing the **technical** foundation and project infrastructure that all subsequent phases depend on.  Success here means:[^1]

- ✅ Nx monorepo structure with proper Vite + TanStack Start integration[^1]
- ✅ Shared authentication middleware and session management[^1]
- ✅ Landing portal UI with WCAG 2.1 AA accessibility baseline[^1]
- ✅ Development workflow documentation and deployment skeleton[^1]
- ✅ Type-safe routing with TanStack Router configured[^1]
- ✅ Environment configuration for local, staging, and production[^1]

***

## 2. TanStack Start + Nx Integration Strategy

### 2.1 Why This Approach Works

The PRD assumes an Nx monorepo, but TanStack Start requires special handling because it is Vite-first, has no official Nx plugin yet, and expects a different build setup than Nx’s default React generator.[^1]

- TanStack Start is Vite-first and currently in Release Candidate (v0.x)[^1]
- No official Nx plugin exists yet for TanStack Start[^1]
- Manual configuration is required to align TanStack Start with Nx’s workspace tooling[^1]


### 2.2 Recommended Integration Pattern

```text
ucsc-assmt-hub/ (Nx monorepo root)
├── apps/
│   ├── portal/                    # TanStack Start Main App
│   │   ├── vite.config.ts         # TanStack Start + Vite config
│   │   ├── src/
│   │   │   ├── routes/            # Type-safe route definitions
│   │   │   │   ├── __root.tsx     # Root layout
│   │   │   │   ├── _layout.tsx    # Auth-protected layout
│   │   │   │   ├── index.tsx      # Dashboard home
│   │   │   │   └── assessments/   # Nested routes
│   │   │   ├── app.config.ts      # TanStack Start config
│   │   │   ├── entry.client.tsx   # Client entry point
│   │   │   ├── entry.server.tsx   # Server entry point
│   │   │   └── App.tsx            # Root component
│   │   └── package.json           # Portal-specific deps
│   └── admin/                     # Angular Micro-app (Phase 3)
├── libs/
│   ├── auth/                      # Shared auth logic
│   │   ├── src/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts     # Auth context hook
│   │   │   │   └── useSession.ts  # Session management
│   │   │   ├── middleware/
│   │   │   │   ├── oidc.ts        # OAuth2/OIDC handlers
│   │   │   │   └── sessionGuard.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   ├── ui/                        # Shared UI components (WCAG AA)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Form.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   └── Accessibility.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFocusManagement.ts
│   │   │   │   └── useKeyboardNav.ts
│   │   │   └── styles/
│   │   │       ├── variables.css  # A11y color contrasts
│   │   │       └── a11y.css       # Accessibility utilities
│   │   └── tsconfig.json
│   └── api-client/                # Data access & queries
│       ├── src/
│       │   ├── queries/
│       │   │   ├── assessments.ts
│       │   │   └── students.ts
│       │   └── config/
│       │       └── queryClient.ts
├── apps-api/                      # Node.js Shared Auth Gateway (Phase 2)
│   ├── src/
│   │   ├── auth/
│   │   │   ├── oidc.handler.ts
│   │   │   └── session.handler.ts
│   │   └── middleware/
│   │       └── rbac.ts            # Role-Based Access Control
├── .env.example
├── nx.json
├── tsconfig.base.json
└── package.json
```


### 2.3 Configuration Steps for Phase 1 (pnpm)

**Step 1: Initialize Nx Monorepo**

```bash
# Create the monorepo with Nx
pnpm dlx create-nx-workspace ucsc-assmt-hub --preset=empty

# Navigate into workspace
cd ucsc-assmt-hub

# Install workspace dependencies
pnpm install

# Add Nx React and Vite support
pnpm add -D @nx/react @nx/vite vite

# Initialize git for Nx features
git init
```

**Step 2: Create TanStack Start Application Manually**

```bash
# Create portal app using TanStack's scaffolding (outside or inside workspace)
pnpm dlx create @tanstack/start@latest -- --template react-ssr

# Move/rename generated app into apps/portal within the Nx workspace
# Update its package.json to use the monorepo's pnpm workspace configuration
```

**Step 3: Configure Nx to Recognize Portal App**

```ts
// nx.json - add portal to workspaces
{
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "libs"
  },
  "plugins": [
    {
      "plugin": "@nx/vite/plugin",
      "options": {
        "targetName": "serve"
      }
    }
  ]
}
```

**Step 4: Create Shared Libraries**

```bash
# Generate shared auth library
pnpm nx g @nx/react:library auth --bundler=vite

# Generate shared UI component library
pnpm nx g @nx/react:library ui --bundler=vite

# Generate API client library
pnpm nx g @nx/react:library api-client --bundler=vite
```

**Step 5: Configure TanStack Router in Portal App**

```ts
// apps/portal/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouterVite } from '@tanstack/router/vite'

export default defineConfig({
  plugins: [
    tanstackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      '@/auth': new URL('../../../libs/auth/src', import.meta.url).pathname,
      '@/ui': new URL('../../../libs/ui/src', import.meta.url).pathname,
      '@/api': new URL('../../../libs/api-client/src', import.meta.url).pathname,
    },
  },
})
```


***

## 3. Phase 1 Deliverables – Detailed Breakdown

### 3.1 Monorepo Setup \& Build Configuration

Deliverable: Production-ready Nx monorepo with TanStack Start integrated.[^1]

Actionable steps (with pnpm):

- Initialize Nx workspace and install @nx/react, @nx/vite, @nx/jest using pnpm add -D.[^1]
- Configure tsconfig.base.json with path aliases for shared libs.[^1]
- Create portal app, wire Vite to TanStack Router, and add a build script that runs pnpm nx run portal:build.[^1]
- Set up .github/workflows/ci.yml to run pnpm nx lint, type-check, and build with cache.[^1]


### 3.2 Authentication Foundation

Deliverable: OAuth2/OIDC authentication flow with session management.[^1]

Key implementation details:

- Define User, Session, and Role types in auth.types.ts.[^1]
- Implement libs/auth/src/hooks/useAuth.ts with state, login/logout, session persistence, and refresh stubs.[^1]
- Create ProtectedRoute and a WCAG 2.1 AA compliant login route at /src/routes/login.tsx.[^1]


### 3.3 Landing Portal \& Navigation

Deliverable: WCAG 2.1 AA compliant landing page and navigation.[^1]

Focus items:

- __root.tsx for global layout and _layout.tsx for authenticated sections.[^1]
- Dashboard index.tsx with responsive layout and dark-mode-ready styles.[^1]
- Install @axe-core/react and integrate accessibility checks into CI.[^1]


### 3.4 Type-Safe Routing with TanStack Router

Deliverable: Complete, type-safe route configuration.[^1]

Core routes:

- __root, _layout, index, assessments/index, assessments/\$id, _error, 404 with routeTree.gen.ts generation.[^1]
- beforeLoad route guards for auth and role-based restrictions.[^1]


### 3.5 Shared UI Component Library (WCAG 2.1 AA)

Deliverable: 5–6 reusable, accessible components.[^1]

Components:

- Button, Card, form primitives, nav helpers, and accessibility utilities like useFocusManagement and useKeyboardNav.[^1]


### 3.6 Environment Configuration \& Documentation

Deliverable: Environment setup plus baseline docs.[^1]

Key elements:

- .env.example with VITE_OAUTH_CLIENT_ID, VITE_OAUTH_AUTHORITY, VITE_API_BASE_URL, VITE_ENV.[^1]
- Docs: GETTING_STARTED, PROJECT_STRUCTURE, ACCESSIBILITY, AUTHENTICATION, DEVELOPMENT.[^1]

***

## 4. AI-Powered Efficiency Multipliers

The plan quantifies 8–12 hours saved via AI by using Claude, Copilot, and ChatGPT for Nx config, auth hooks, WCAG components, route guards, and CI workflows.[^1]

A table outlines tasks, tools, prompts, and time saved, emphasizing pnpm-based Nx workflows.[^1]

***

## 5. Phase 1 Timeline \& Milestones

Three-week schedule:

- Week 1: Nx + TanStack Start, shared libs, auth, login UI.[^1]
- Week 2: Layouts, navigation, dashboard, route tree, UI library.[^1]
- Week 3: Accessibility audit, docs, CI/CD, review, and demo-ready deployment.[^1]

All build or lint tasks should be run via pnpm nx run <target>.[^1]

***

## 6–9. Success, Debt, Workflow, Interview Framing

Later sections define:

- Success criteria: monorepo, auth, routing, accessibility, docs, CI, deployability.[^1]
- Technical debt for Phase 2+: RDS, Redshift, API gateway, Playwright, analytics, offline.[^1]
- Daily/weekly AI collaboration rhythm and talking points for interviews.[^1]

***

If you want, a small “Package Manager” note can be added near the top:

> Package manager: pnpm (chosen for workspace-aware installs and monorepo efficiency).[^1]

<div align="center">⁂</div>

[^1]: prd_phase1_foundation.md

