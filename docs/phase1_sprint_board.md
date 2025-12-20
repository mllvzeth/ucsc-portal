# phase1_sprint_board.md

# UCSC Assessment Hub – Phase 1 Sprint Board

## Quick-Reference Checklist (1-Page)

Sprint Duration: 3 weeks | Start Date: [Your Date] | Target Completion: [+21 days]

Note: Package manager is pnpm for all installs, generators, and Nx task runs.

***

## WEEK 1: Infrastructure Foundation

### Day 1-2: Nx Setup \& TanStack Start Integration

- [ ] Create Nx empty workspace: pnpm dlx create-nx-workspace ucsc-assmt-hub --preset=empty
- [ ] Install workspace deps: cd ucsc-assmt-hub \&\& pnpm install
- [ ] Install dev tools: pnpm add -D @nx/react @nx/vite vite @tanstack/react-start
- [ ] Configure nx.json with workspaceLayout, Vite plugin, path aliases
- [ ] Set up tsconfig.base.json with path mappings (@/auth, @/ui, @/api)
- [ ] Initialize Git repo and create .gitignore for Nx cache
- [ ] AI Task: Prompt Claude for production nx.json + vite.config.ts template
- [ ] Verify: pnpm nx run portal:build succeeds locally

Completion Time: 4 hours | Status: ⬜

### Day 3-4: Shared Libraries Setup

- [ ] Generate @auth library: pnpm nx g @nx/react:library auth --bundler=vite
- [ ] Generate @ui library: pnpm nx g @nx/react:library ui --bundler=vite
- [ ] Generate @api-client library: pnpm nx g @nx/react:library api-client --bundler=vite
- [ ] Create barrel exports (index.ts) in each lib
- [ ] Test Nx path alias resolution: import { useAuth } from '@/auth'
- [ ] AI Task: Use Copilot to generate lib scaffolding, index exports
- [ ] Verify: TypeScript paths resolve without errors

Completion Time: 3 hours | Status: ⬜

### Day 4-5: Auth Foundation

- [ ] Create libs/auth/src/types/auth.types.ts with User, Session, Role interfaces
- [ ] Build libs/auth/src/hooks/useAuth.ts hook with full TypeScript support
- [ ] Create AuthContext and AuthProvider component
- [ ] Implement session persistence (localStorage with validation)
- [ ] Add token refresh logic stub (full implementation Phase 2)
- [ ] AI Task: Prompt Claude for production useAuth hook with JSDoc
- [ ] Test useAuth hook in isolation with mock data

Completion Time: 3 hours | Status: ⬜

### Day 5-6: Login Page UI + Accessibility

- [ ] Create /src/routes/login.tsx page component
- [ ] Build login form with:
    - [ ] Email input with label \& error region
    - [ ] Password input with visibility toggle
    - [ ] "Login with UCSC" OAuth2 button
    - [ ] Error message display
    - [ ] Loading state with spinner
- [ ] Implement WCAG 2.1 AA compliance:
    - [ ] Min 4.5:1 color contrast
    - [ ] Keyboard navigation (Tab, Enter)
    - [ ] Focus indicators (2px visible outline)
    - [ ] ARIA labels \& descriptions
    - [ ] Form validation messages with aria-live
- [ ] AI Task: Use Copilot to generate accessible form components
- [ ] Run Axe accessibility audit: Target score: 100
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (VoiceOver/NVDA)

Completion Time: 4 hours | Status: ⬜

### Week 1 Milestone

Expected Output: ✅ Runnable app with OAuth2 login page, accessible foundation
Demo Ready: Login page loads, form is keyboard accessible, Axe passes
Blockers to Flag: TanStack Start version conflicts? Nx cache issues?

***

## WEEK 2: Portal UI \& Navigation

### Day 7-8: Root \& Protected Layouts

- [ ] Create /src/routes/__root.tsx (root layout):
    - [ ] Skip-to-content link (a11y)
    - [ ] Header with UCSC logo
    - [ ] Outlet for nested routes
    - [ ] Footer with institutional info
- [ ] Create /src/routes/_layout.tsx (protected layout):
    - [ ] Require auth via route guard
    - [ ] Display authenticated user info
    - [ ] User menu (Profile, Settings, Logout)
    - [ ] Breadcrumb navigation
- [ ] Test that non-authenticated users redirect to /login
- [ ] AI Task: Use Copilot to scaffold layout components with structure
- [ ] Verify: Both layouts render without errors

Completion Time: 4 hours | Status: ⬜

### Day 8-9: Navigation Component \& Dashboard Home

- [ ] Build main navigation component with:
    - [ ] Menu items: Home, Assessments, My Results, Resources, Profile
    - [ ] Mobile hamburger menu with aria-expanded
    - [ ] Active link indicators
    - [ ] Keyboard navigation (arrow keys work)
    - [ ] Focus trap in mobile menu
- [ ] Create /src/routes/index.tsx (dashboard home):
    - [ ] Hero section with student greeting
    - [ ] Quick action cards (3-4 main CTAs)
    - [ ] Empty state messaging
    - [ ] Responsive grid layout
    - [ ] Dark mode support (CSS custom properties)
- [ ] AI Task: Prompt Claude for accessible Navigation with ARIA
- [ ] Test navigation keyboard interaction
- [ ] Verify: Responsive on mobile, tablet, desktop

Completion Time: 3 hours | Status: ⬜

### Day 9-10: Route Tree \& TanStack Router Config

- [ ] Define complete route structure:
    - [ ] __root.tsx → all routes
    - [ ] _layout.tsx → protected routes
    - [ ] index.tsx → dashboard
    - [ ] assessments/index.tsx → assessment list
    - [ ] assessments/\$id.tsx → assessment detail (type-safe params)
    - [ ] _error.tsx → error boundary
    - [ ] 404.tsx → not found page
- [ ] Configure TanStack Router:
    - [ ] Vite plugin in vite.config.ts: tanstackRouterVite()
    - [ ] Verify routeTree.gen.ts auto-generates
    - [ ] Create route guards with beforeLoad handlers
- [ ] Implement role-based access control in guards
- [ ] AI Task: Prompt Claude for complete route tree + guards
- [ ] Verify: All routes load, type-safe params work

Completion Time: 3 hours | Status: ⬜

### Day 11-12: Shared UI Component Library

Build 6 foundational accessible components:

#### Button Component

- [ ] Variants: primary, secondary, outline, danger
- [ ] Sizes: sm, md, lg
- [ ] States: default, hover, focus, active, disabled, loading
- [ ] WCAG compliant: min 44×44px, 2px focus ring, 4.5:1 contrast
- [ ] Full TypeScript props interface


#### Card Component

- [ ] Header, body, footer sections
- [ ] Shadow \& border styling
- [ ] Responsive padding


#### Form Input Component

- [ ] Text, email, password, number variants
- [ ] Label association
- [ ] Error state with aria-invalid
- [ ] Help text support
- [ ] Disabled state


#### Select / Dropdown Component

- [ ] Keyboard-navigable (arrow keys)
- [ ] ARIA attributes: aria-labelledby, aria-expanded, role="listbox"
- [ ] Open/close animation


#### Checkbox \& Radio Group

- [ ] Grouped with fieldset/legend
- [ ] ARIA-checked states
- [ ] Error messaging


#### Accessibility Utilities

- [ ] useFocusManagement.ts hook for modal focus traps
- [ ] useKeyboardNav.ts hook for arrow key navigation
- [ ] a11y.css utility classes: sr-only, focus-visible, etc.

AI Task: Use Copilot + Claude to generate components rapidly
Accessibility Check: Each component passes Axe audit
Storybook Integration (Optional): pnpm nx g @nx/react:library storybook-config

Completion Time: 5 hours | Status: ⬜

### Week 2 Milestone

Expected Output: ✅ Full portal UI with navigation, routes configured, component library
Demo Ready: Can navigate through all pages (login → dashboard → assessments), all links work
Blockers to Flag: Component reusability issues? Route type safety problems?

***

## WEEK 3: Polish, Testing \& Deployment

### Day 13-14: Accessibility Audit \& Remediation

- [ ] Run Axe accessibility scan on all pages:
    - [ ] Login page
    - [ ] Dashboard
    - [ ] Navigation
    - [ ] All components
- [ ] Manual testing checklist:
    - [ ] Keyboard-only navigation (Tab, Shift+Tab, Enter, Escape)
    - [ ] Screen reader testing (VoiceOver on macOS, NVDA on Windows)
    - [ ] Focus indicators visible on all interactive elements
    - [ ] Color contrast ratios verified (use WebAIM tool)
    - [ ] Form error messaging announced
    - [ ] Headings hierarchy correct (h1 → h2 → h3)
- [ ] Fix all Axe violations (target: 0 violations)
- [ ] Document WCAG 2.1 AA compliance in docs/ACCESSIBILITY.md
- [ ] AI Task: Ask Claude for WCAG 2.1 AA testing checklist

Completion Time: 4 hours | Status: ⬜

### Day 14-15: Comprehensive Documentation

- [ ] Create docs/GETTING_STARTED.md:
    - [ ] Clone \& install instructions (pnpm install)
    - [ ] Environment setup (.env.example)
    - [ ] How to run locally: pnpm nx run portal:serve
    - [ ] How to build: pnpm nx run portal:build
- [ ] Create docs/PROJECT_STRUCTURE.md:
    - [ ] Nx monorepo explanation
    - [ ] Path aliases \& shared libs
    - [ ] File organization
- [ ] Create docs/AUTHENTICATION.md:
    - [ ] OAuth2/OIDC flow diagram (text or ASCII)
    - [ ] useAuth hook API reference
    - [ ] Session management strategy
    - [ ] TBD: Phase 2 API Gateway integration
- [ ] Create docs/ACCESSIBILITY.md:
    - [ ] WCAG 2.1 AA compliance checklist
    - [ ] Testing procedures (automated + manual)
    - [ ] Component accessibility standards
- [ ] Create docs/DEVELOPMENT.md:
    - [ ] Coding standards
    - [ ] Component creation guide
    - [ ] PR process \& review checklist
- [ ] Create .github/PULL_REQUEST_TEMPLATE.md with a11y reminders
- [ ] AI Task: Prompt Claude to generate all 5 docs at once

Completion Time: 4 hours | Status: ⬜

### Day 15-16: GitHub Actions CI/CD Pipeline

- [ ] Create .github/workflows/ci.yml with:
    - [ ] ESLint check: pnpm nx run portal:lint
    - [ ] TypeScript check: pnpm nx run portal:type-check
    - [ ] Nx build: pnpm nx run portal:build
    - [ ] Accessibility audit: Axe report
    - [ ] Cache Nx artifacts for speed
- [ ] Add branch protection rules on main:
    - [ ] Require CI to pass
    - [ ] Require PR review before merge
- [ ] Test CI workflow by opening dummy PR
- [ ] AI Task: Prompt Claude for complete GitHub Actions workflow

Completion Time: 2 hours | Status: ⬜

### Day 16-17: Code Review \& Optimization

- [ ] Code review checklist:
    - [ ] No any types (strict TypeScript)
    - [ ] All components have JSDoc comments
    - [ ] No console.error/log left in code
    - [ ] Accessibility principles followed
    - [ ] Error boundaries implemented
- [ ] Performance optimization:
    - [ ] Run Lighthouse audit: target score ≥ 90
    - [ ] Check bundle size: pnpm nx run portal:build --analyze (if available)
    - [ ] Lazy load routes where appropriate
- [ ] Security review:
    - [ ] Validate OAuth2 config (no secrets in code)
    - [ ] Check localStorage usage (no sensitive data)
    - [ ] CORS headers configured properly
- [ ] AI Task: Use Copilot to review generated code
- [ ] Fix any findings from reviews

Completion Time: 3 hours | Status: ⬜

### Day 17-18: Testing \& Demo Preparation

- [ ] Unit test scaffolding (Jest/Vitest):
    - [ ] Create test template for components
    - [ ] Test useAuth hook
    - [ ] Test route guards
- [ ] End-to-end testing scenarios:
    - [ ] User can log in
    - [ ] User can navigate to assessments
    - [ ] User can log out
    - [ ] Non-authenticated users redirect to login
- [ ] Browser compatibility check:
    - [ ] Chrome/Edge (latest)
    - [ ] Firefox (latest)
    - [ ] Safari (latest)
- [ ] Create demo checklist for interviews
- [ ] AI Task: Generate Jest test templates with Copilot

Completion Time: 2 hours | Status: ⬜

### Day 18-19: Deployment Readiness

- [ ] Environment configuration:
    - [ ] .env.example fully populated
    - [ ] Document all required OAuth2 credentials
    - [ ] Staging vs. production config documented
- [ ] Build optimization:
    - [ ] Create deployment guide: docs/DEPLOYMENT.md
    - [ ] Document any staging server setup
    - [ ] Include Nx caching strategy
- [ ] Final code cleanup:
    - [ ] Remove debug comments
    - [ ] Update README.md with status
- [ ] Create GitHub Release notes for Phase 1

Completion Time: 2 hours | Status: ⬜

### Week 3 Milestone

Expected Output: ✅ Production-ready Phase 1, fully tested, documented, accessible
Demo Ready: Full walkthrough: login → dashboard → navigate → logout
Quality Gates: WCAG AA ✅ | TypeScript strict ✅ | Lighthouse ≥90 ✅ | CI/CD green ✅

***

## SUCCESS CRITERIA CHECKLIST

### Code Quality

- [ ] Zero TypeScript any types
- [ ] 100% path alias resolution
- [ ] No ESLint warnings
- [ ] All components have JSDoc


### Accessibility

- [ ] Axe audit: 0 violations
- [ ] Keyboard navigation: ✅ All interactive elements
- [ ] Screen reader tested: ✅ VoiceOver/NVDA
- [ ] Focus indicators: ✅ Visible on all elements
- [ ] Color contrast: ✅ 4.5:1+ (normal text)


### Functionality

- [ ] OAuth2 login flow works end-to-end
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based access control implemented
- [ ] Navigation works on mobile, tablet, desktop
- [ ] No console errors or warnings


### Documentation

- [ ] GETTING_STARTED.md ✅
- [ ] PROJECT_STRUCTURE.md ✅
- [ ] AUTHENTICATION.md ✅
- [ ] ACCESSIBILITY.md ✅
- [ ] DEVELOPMENT.md ✅


### DevOps

- [ ] GitHub Actions CI/CD pipeline running ✅
- [ ] Branch protection rules configured ✅
- [ ] Build time < 2 minutes ✅
- [ ] Nx cache configured ✅


### Deployment

- [ ] Stageable to development environment
- [ ] Environment variables documented
- [ ] Build artifact generation successful
- [ ] Ready for Phase 2 API integration

***

## DAILY STANDUP TEMPLATE

Date: _______________

What I Completed Today:

- [ ] Task 1: ___________
- [ ] Task 2: ___________
- [ ] Task 3: ___________

What I'm Working on Tomorrow:

- [ ] Task 1: ___________
- [ ] Task 2: ___________

Blockers / Questions:

- ___________
- ___________

AI Tools Used Today:

- [ ] Claude (for: _________)
- [ ] Copilot (for: _________)
- [ ] ChatGPT (for: _________)

Time Spent: ___ hours

***

## QUICK REFERENCE: AI PROMPTS

| Task | Tool | Quick Prompt |
| :-- | :-- | :-- |
| Nx config | Claude | "Generate production nx.json for TanStack Start Vite monorepo with path aliases" |
| useAuth hook | Claude | "Create production useAuth hook with OAuth2 session, localStorage, TypeScript" |
| Accessible Button | Copilot | "Generate Button with WCAG AA focus states, color contrast, aria-*" |
| Route guards | Claude | "Generate TanStack Router beforeLoad guards with role-based access control" |
| Login form | Copilot | "Generate accessible login form with email, password, error handling, WCAG AA" |
| CI/CD pipeline | Claude | "Create .github/workflows/ci.yml for Nx lint, type-check, build, Axe audit" |
| Documentation | Claude | "Write GETTING_STARTED.md, ACCESSIBILITY.md, AUTHENTICATION.md" |


***

## PARKING LOT (Phase 2+)

- [ ] API Gateway implementation (Node.js)
- [ ] RDS student data integration
- [ ] Redshift analytics queries
- [ ] Session refresh token rotation
- [ ] E2E testing with Playwright
- [ ] Analytics instrumentation
- [ ] Offline-first capability
- [ ] Dark mode toggle persistence

***

Last Updated: December 18, 2025
Next Review: [After Week 1]
Contact for Questions: mllvzeth / GitHub Issues
