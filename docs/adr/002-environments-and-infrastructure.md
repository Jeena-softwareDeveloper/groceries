# ADR 002: Environments and Infrastructure

**Status:** Accepted  
**Date:** 2026-07-02

## Context

DistrictMart targets 10,000+ shops and millions of customers. Infrastructure must support district-scoped scaling without premature over-engineering.

## Decision

### Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| `local` | Developer machines | Docker Postgres + Redis, seed data |
| `staging` | QA, E2E, demo | Anonymized / synthetic data |
| `production` | Live traffic | Real customer & vendor data |

### Infrastructure (recommended defaults)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Backend hosting | **Railway** or **Render** (v1) → AWS ECS at scale | Fast deploy, Postgres add-on; migrate when traffic warrants |
| PostgreSQL | **Neon** or **Supabase** (v1) → RDS at scale | Managed, branching for staging |
| Redis | **Upstash** (v1) → ElastiCache at scale | Serverless pricing, global edge option |
| Media | **Cloudinary** | Signed uploads, responsive transforms, CDN |
| CDN | Cloudinary + platform CDN headers | Image delivery for product grids |
| CI/CD | **GitHub Actions** | lint → typecheck → test → build on every PR |
| Error tracking | **Sentry** (Phase 11) | — |
| Push notifications | **FCM** (Phase 9) | — |

### Local development

- Postgres and Redis via Docker Compose (added in Phase 1)
- `.env.example` committed; `.env` gitignored

## Consequences

- District/Area scoping in queries is the primary horizontal scaling lever
- Staging mirrors production topology at smaller scale
- Vendor product changes invalidate Redis cache — no batch sync jobs

## Alternatives Considered

- **Supabase-only stack:** Good for auth; we need custom JWT flows and vendor approval gates (Phase 2)
- **MongoDB:** Rejected — relational order/cart/inventory integrity is critical
