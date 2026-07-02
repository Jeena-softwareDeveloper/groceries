# ADR 001: Monorepo and Repository Structure

**Status:** Accepted  
**Date:** 2026-07-02  
**Deciders:** Engineering team

## Context

DistrictMart has three client surfaces (customer mobile, customer/admin web, backend API) plus shared types and UI primitives. We need a structure that supports 10,000+ vendors without fragmenting types, API contracts, or release coordination.

## Decision

Use an **npm workspaces monorepo** orchestrated by **Turborepo**:

```
districtmart/
├── app/              # Customer mobile (React Native + Expo)
├── server/           # Backend API (Express + TypeScript + Prisma)
│   └── shared/types/ # Shared TypeScript types
├── superadmin/       # Super Admin web panel (React + Vite)
├── docs/
│   └── adr/
└── .github/workflows/
```

**Tooling choices:**
- Package manager: npm workspaces (Node 20+)
- Build orchestration: Turborepo
- Linting: ESLint 9 flat config + Prettier
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.)

## Consequences

**Positive:**
- Single source of truth for API types (`@districtmart/shared-types`)
- Atomic cross-app changes in one PR
- Shared CI pipeline with cached builds via Turbo

**Negative:**
- Larger clone size over time
- Requires discipline to avoid circular dependencies between packages

## Alternatives Considered

- **Polyrepo:** Rejected — type drift between mobile/web/backend at scale
- **pnpm workspaces:** Viable; npm chosen for broader default tooling compatibility on Windows dev machines
