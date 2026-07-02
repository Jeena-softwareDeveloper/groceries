# ADR 004: Authentication Strategy

**Status:** Accepted  
**Date:** 2026-07-02

## Context

Four roles need secure, role-aware access: `SUPER_ADMIN`, `VENDOR`, `VENDOR_STAFF`, `CUSTOMER`. Customer auth should mirror Blinkit/Zepto (phone OTP primary).

## Decision

### Token model

| Token | Lifetime | Storage |
|-------|----------|---------|
| Access JWT | 15 minutes | Memory (web/mobile), `Authorization: Bearer` header |
| Refresh token | 7 days | httpOnly secure cookie (web); secure storage (mobile) |

### Role-specific flows

| Role | Primary auth | Gate |
|------|--------------|------|
| Customer | Phone OTP | — |
| Customer (alt) | Email + password | Optional |
| Vendor | Email + password | **Super Admin approval required** before panel access |
| Vendor Staff | Email + password | Tied to vendor |
| Super Admin | Email + password | Optional 2FA (Phase 2+) |

### Security measures

- Refresh token rotation on `/api/v1/auth/refresh`
- Logout blacklists refresh token in **Redis**
- Rate limiting on OTP request/verify (Redis-backed, Phase 2)
- `authenticate` + `authorize(roles[])` middleware on all protected routes

### JWT claims

```json
{
  "sub": "user-uuid",
  "role": "CUSTOMER",
  "vendorId": null,
  "iat": 0,
  "exp": 0
}
```

`vendorId` populated for `VENDOR` and `VENDOR_STAFF` only.

## Consequences

- Unapproved vendors receive 403 on vendor panel routes even with valid credentials
- Mobile uses Expo SecureStore for refresh token (Phase 2)
- No session cookies for API — stateless access tokens + Redis refresh blacklist

## Alternatives Considered

- **Session-only (no JWT):** Rejected — poor fit for mobile + horizontal API scaling
- **OAuth social login only:** Rejected for India grocery — phone OTP is primary channel
