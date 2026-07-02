# ADR 005: Data Model and Scaling Boundaries

**Status:** Accepted  
**Date:** 2026-07-02

## Context

The platform must scale to 10,000+ shops without re-architecture. Geographic and vendor boundaries must be enforced from day one.

## Decision

### Entity hierarchy

```
District → Area → Vendor (Shop) → Product
```

Almost every customer-facing query is scoped by **district** and/or **area** first.

### Category ownership

- Categories and subcategories are **Super Admin only**
- Vendors assign existing categories via foreign key — server rejects vendor attempts to create categories

### Cart and order model

- Cart can hold items from **multiple vendors**
- Checkout creates **one Order per vendor** (split orders)
- Shared payment reference links split orders from a single checkout session

### Cache invalidation (no manual sync)

When a vendor publishes or updates a product:

1. Write to Postgres (source of truth)
2. Invalidate Redis keys: `home:feed:{districtId}`, `shop:{vendorId}:products`, etc.
3. Customer app sees changes on next fetch (seconds, not batch jobs)

### Search (v1)

- Postgres `tsvector` + `pg_trgm` for typo tolerance
- Document upgrade path to Meilisearch/OpenSearch at scale — do not over-engineer v1

### Roles table design

- `SuperAdmin`, `Vendor`, `VendorStaff`, `Customer` as distinct auth entities
- `VendorStaff` belongs to exactly one `Vendor`

## Consequences

- Phase 1 Prisma schema must include District/Area before Vendor
- Phase 8 checkout UI depends on split-order decision — do not defer
- Phase 11 indexes on `districtId`, `areaId`, `vendorId`, `status`

## Alternatives Considered

- **Single order for multi-vendor cart:** Rejected — fulfillment, payout, and vendor panel complexity
- **Vendor-created categories:** Rejected per product spec
