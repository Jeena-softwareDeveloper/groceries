# ADR 003: API Versioning and Response Format

**Status:** Accepted  
**Date:** 2026-07-02

## Context

Three clients (mobile, web, admin) consume the same backend. Responses must be predictable; breaking changes must be manageable at scale.

## Decision

### URL versioning

All REST endpoints are prefixed with `/api/v1/`.

Future breaking changes ship as `/api/v2/` with a deprecation window documented in release notes.

### Response envelope

Every JSON response uses:

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

Errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { "field": "reason" }
  }
}
```

### Route namespaces

| Prefix | Audience |
|--------|----------|
| `/api/v1/auth/*` | All roles |
| `/api/v1/admin/*` | Super Admin |
| `/api/v1/vendor/*` | Vendor / Vendor Staff |
| `/api/v1/customer/*` | Customer |

### Pagination

- **Cursor-based** pagination for infinite scroll (shops, products, orders)
- Offset pagination only for admin tables with explicit page numbers

## Consequences

- `@districtmart/shared-types` exports `ApiResponse<T>` used by all clients
- OpenAPI/Swagger stub in Phase 1; full spec grows per phase
