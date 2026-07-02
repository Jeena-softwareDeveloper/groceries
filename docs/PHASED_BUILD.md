# Multi-Vendor Grocery Marketplace — Phased Build Document

**Project codename:** DistrictMart
**Model:** District → Area → Vendor (Shop) → Product, 3 roles (Super Admin, Vendor, Customer)
**Target scale:** 10,000+ shops, millions of customers, zero major re-architecture

This document breaks the full spec into sequential, buildable phases. Each phase has: goal, scope, deliverables, database tables touched, APIs to build, and an exit criteria checklist. Build in order — later phases assume earlier ones are done and stable.

---

## Phase 0 — Foundations & Planning (Week 0–1)

**Goal:** Lock down architecture decisions before writing code, so you don't re-platform later.

### Scope
- Finalize monorepo vs polyrepo (recommended: monorepo with `apps/mobile`, `apps/web`, `apps/backend`, `packages/shared-types`, `packages/ui`)
- Define environments: local, staging, production
- Choose infra: Node hosting (Render/Railway/AWS ECS), PostgreSQL (Supabase/RDS/Neon), Redis (Upstash/ElastiCache), Cloudinary account, CDN
- Define naming conventions, folder structure, ESLint/Prettier config, commit conventions (Conventional Commits)
- Set up CI/CD skeleton (GitHub Actions): lint → typecheck → test → build
- Define API versioning strategy (`/api/v1/...`)
- Define auth strategy: JWT access token (short-lived) + refresh token (httpOnly cookie / secure storage on mobile)

### Deliverables
- Repo scaffolded with folder structure
- `.env.example` for all three apps
- CI pipeline running on every PR
- Architecture Decision Record (ADR) doc listing the above choices

### Exit Criteria
- [ ] Monorepo builds locally for all 3 apps
- [ ] CI passes on an empty commit
- [ ] ADR reviewed and signed off

---

## Phase 1 — Database Design & Core Backend Skeleton (Week 1–3)

**Goal:** A normalized, scalable Postgres schema and a running Express + Prisma API with health checks.

### Scope — Database Schema (Prisma)
Design and migrate these core tables first (relationships noted):

| Table | Key Relationships |
|---|---|
| `District` | has many `Area` |
| `Area` | belongs to `District`, has many `Vendor` |
| `Vendor` (Shop) | belongs to `Area`, has many `Product`, `Order`, `VendorStaff` |
| `Category` | self-relation for `SubCategory` (parentId), has many `Product` |
| `Product` | belongs to `Vendor`, `Category`, `SubCategory`; has many `ProductImage`, `Inventory` |
| `ProductImage` | belongs to `Product` |
| `Inventory` | belongs to `Product` (stock, unit, reorder level) |
| `Customer` | has many `Address`, `Order`, `Wishlist`, `CartItem`, `Review` |
| `Address` | belongs to `Customer` |
| `Cart` / `CartItem` | belongs to `Customer`, grouped by `Vendor` |
| `Wishlist` | belongs to `Customer`, `Product` |
| `Order` | belongs to `Customer`, `Vendor`; has many `OrderItem` |
| `OrderItem` | belongs to `Order`, `Product` |
| `Banner` / `MicroBanner` | global or district-scoped |
| `Offer` / `Coupon` | scoped to platform, vendor, or category |
| `Notification` | belongs to `Customer` or `Vendor` |
| `Review` / `Rating` | belongs to `Customer`, `Product` or `Vendor` |
| `SuperAdmin`, `VendorStaff` | auth-role tables |

### Scope — Backend Skeleton
- Express + TypeScript project structure (`src/modules/<domain>/{controller,service,routes,validation}`)
- Prisma client setup + migration workflow
- Global error handler, request logger, rate limiter (Redis-backed)
- Centralized response format: `{ success, data, error, meta }`
- Redis connection for caching + session/refresh token blacklist
- Cloudinary SDK wired up (signed upload endpoint)
- Health check endpoint `/api/v1/health`

### Deliverables
- Full Prisma schema committed with first migration
- ER diagram (auto-generated via `prisma-erd-generator` or dbdiagram.io)
- Running backend with health check + Swagger/OpenAPI stub

### Exit Criteria
- [ ] `prisma migrate dev` runs clean
- [ ] ER diagram matches spec (District→Area→Vendor→Product chain verified)
- [ ] Backend boots locally and connects to Postgres + Redis

---

## Phase 2 — Authentication & Role-Based Access (Week 3–4)

**Goal:** Secure, role-aware auth working across all three apps.

### Scope
- JWT access + refresh token flow
- Roles: `SUPER_ADMIN`, `VENDOR`, `VENDOR_STAFF`, `CUSTOMER`
- Middleware: `authenticate`, `authorize(roles[])`
- Customer auth: phone OTP (primary, like Blinkit/Zepto) + optional email/password
- Vendor auth: email/password, approval-gated (vendor can't log into panel until Super Admin approves)
- Super Admin auth: email/password + optional 2FA
- Password reset / OTP resend flows with rate limiting
- Token refresh endpoint, logout (token blacklist in Redis)

### APIs
```
POST /api/v1/auth/customer/otp/request
POST /api/v1/auth/customer/otp/verify
POST /api/v1/auth/vendor/login
POST /api/v1/auth/admin/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Deliverables
- Working auth module with role middleware
- Postman/Insomnia collection for auth flows

### Exit Criteria
- [ ] Each role can log in and receive correctly scoped JWT
- [ ] Unapproved vendor is blocked from panel access
- [ ] Refresh + logout invalidate tokens correctly

---

## Phase 3 — Super Admin Panel (Week 4–7)

**Goal:** Super Admin can fully configure the platform before any vendor or customer activity happens.

### Scope (build in this order)
1. **Districts & Areas** — CRUD, since Vendor onboarding depends on these
2. **Categories & Subcategories** — CRUD with image upload, drag-to-reorder, active/inactive toggle
3. **Vendor Approval Queue** — view pending vendor applications, approve/reject with reason, view documents
4. **Banners & Micro Banners** — CRUD with image upload, scheduling (start/end date), district targeting
5. **Offers & Coupons** — CRUD, scope (platform-wide / category / vendor), usage limits, expiry
6. **Delivery Charge Rules** — by distance slab, by district, free-delivery threshold
7. **App Settings** — min order value, tax %, support contact, feature flags
8. **Dashboard & Analytics** — revenue graphs, order volume, top vendors, top products, new customer growth (aggregate queries, cache in Redis, refresh periodically)
9. **Vendor Management** — list/search/suspend vendors, view vendor performance
10. **Customer Management** — list/search customers, view order history, block/unblock
11. **Notification Broadcast** — send push/in-app announcements

### APIs
```
/api/v1/admin/districts        (CRUD)
/api/v1/admin/areas             (CRUD)
/api/v1/admin/categories        (CRUD)
/api/v1/admin/subcategories     (CRUD)
/api/v1/admin/vendors           (list, approve, reject, suspend)
/api/v1/admin/banners           (CRUD)
/api/v1/admin/micro-banners     (CRUD)
/api/v1/admin/offers            (CRUD)
/api/v1/admin/coupons           (CRUD)
/api/v1/admin/delivery-charges  (CRUD)
/api/v1/admin/settings          (GET/PUT)
/api/v1/admin/analytics/*       (revenue, orders, customers, vendors)
/api/v1/admin/notifications     (broadcast)
```

### Deliverables
- Admin web app (React + Vite) with full CRUD screens
- Category tree becomes the single source of truth vendors pull from (read-only for vendors)

### Exit Criteria
- [ ] Super Admin can create a District → Area → Category tree end-to-end
- [ ] A test vendor can be approved and immediately gains panel access
- [ ] Analytics dashboard reflects seeded test data correctly

---

## Phase 4 — Vendor Panel (Week 7–10)

**Goal:** Approved vendors can independently manage their storefront and inventory.

### Scope
1. **Vendor Onboarding & Profile** — shop name, logo, banner, address (linked to Area), FSSAI/GST doc upload, bank details
2. **Store Settings** — operating hours, min order value, delivery radius, temporary "closed" toggle
3. **Product Management** — CRUD pulling Category/Subcategory from Super Admin's list only (dropdown, not free text); multi-image upload via Cloudinary; MRP, selling price, stock, unit, weight, tags (`Featured`, `Best Seller`, `New Arrival`, `Instant Delivery`); publish/unpublish toggle
4. **Inventory Management** — stock adjustment, low-stock alerts, bulk CSV import/export
5. **Order Management** — incoming orders (real-time via WebSocket/polling), accept/reject, mark packed/out-for-delivery/delivered, print invoice
6. **Vendor Offers** — vendor-scoped discounts (subject to Super Admin coupon rules)
7. **Vendor Dashboard** — today's sales, order count, top products, low stock warnings
8. **Vendor Customers** — view customers who ordered from this shop (no cross-vendor data)

### APIs
```
/api/v1/vendor/profile          (GET/PUT)
/api/v1/vendor/products         (CRUD)
/api/v1/vendor/inventory        (GET/PUT, bulk import)
/api/v1/vendor/orders           (list, update status)
/api/v1/vendor/offers           (CRUD)
/api/v1/vendor/dashboard        (summary stats)
```

### Key Rule (from spec)
> Vendor cannot create categories. Vendor only assigns existing Super Admin categories to products. On publish, products must appear in the customer app **immediately** — no manual sync step. Achieve this via cache invalidation (Redis) on product create/update, not a batch job.

### Deliverables
- Vendor web panel (can reuse admin app shell with role-based route guarding)
- Real-time or near-real-time order notification (WebSocket via Socket.IO, or short-poll fallback)

### Exit Criteria
- [ ] Vendor publishes a product → visible in customer app within seconds, no manual trigger
- [ ] Vendor cannot access another vendor's orders or products (tested via authorization checks)
- [ ] Stock decrements correctly on order placement

---

## Phase 5 — Customer App: Core Shell & Navigation (Week 10–12)

**Goal:** The React Native app's skeleton, navigation, and design system are in place before feature screens are built.

### Scope
- Design system setup: NativeWind config, color palette, typography scale, spacing scale, shadow presets, border-radius tokens (per "premium minimal, white background, large radius" spec)
- Reusable component library (build these first, reused everywhere):
  - Button (primary/secondary/ghost/disabled/loading states)
  - Input (text, phone, OTP, search)
  - ProductCard, ShopCard, CategoryCard
  - BannerCarousel
  - OfferCard
  - Modal, BottomSheet
  - SkeletonLoader (per screen type)
  - Pagination / InfiniteScroll list wrapper
  - EmptyState, ErrorState
- Navigation structure (React Navigation): Auth stack → Location selection → Main tab navigator (Home, Search, Cart, Orders, Profile)
- Sticky header component: logo, location selector, hamburger, search, wishlist icon, cart icon (with badge), notification icon
- Global state setup: Redux Toolkit slices (`auth`, `location`, `cart`, `wishlist`, `ui`) + React Query for server state
- Location selection flow: detect GPS or manual district/area select → determines which vendors show

### Deliverables
- Component library storybook or a `/dev-components` screen for visual QA
- Working navigation shell with placeholder screens

### Exit Criteria
- [ ] All reusable components render correctly in isolation
- [ ] Location selector persists choice and drives subsequent API calls
- [ ] Header stays sticky across scroll on a test screen

---

## Phase 6 — Customer App: Home, Discovery & Shop Pages (Week 12–15)

**Goal:** Full browsing experience — home feed, categories, shop listing, shop storefront, product detail.

### Scope
1. **Home Page** — assemble in this priority order (build data-driven, not hardcoded):
   - Hero Banner Carousel
   - Horizontal Category List
   - Micro Promotional Banner
   - Nearby/Featured Grocery Stores
   - Flash Sale Section
   - Today's Deals
   - Trending Products
   - Best Sellers
   - Recently Added Products
   - Top Rated Products
   - Recommended Products (simple rule-based initially: based on category affinity from order history)
   - Seasonal Products
   - Continue Shopping (cart-in-progress reminder)
   - Featured Brands
   - Recently Viewed
   - Popular Categories
   - Offer Banner
2. **Category Section** — horizontal scroll, rounded icons, gradient backgrounds, tap → category product listing
3. **Shop List Page** — card per shop (logo, banner, name, address, rating, delivery time, distance, open/closed, min order, delivery charge), filter by category/rating/distance, sort
4. **Shop Page** — header (banner, logo, rating, delivery time, store info), category tabs, product grid, search-inside-store, filter, sort, add to cart, wishlist toggle
5. **Product Detail** — images, price/MRP/discount, description, brand, weight, stock status, related products, reviews

### APIs
```
/api/v1/customer/home/feed         (composed home sections, cached)
/api/v1/customer/categories
/api/v1/customer/shops             (list, filter by area/distance)
/api/v1/customer/shops/:id
/api/v1/customer/shops/:id/products
/api/v1/customer/products/:id
```

### Performance Notes
- Home feed should be a single composed endpoint (not 15 separate calls) — server assembles sections, cached in Redis per district with short TTL
- Virtualized lists (`FlashList` recommended over `FlatList`) for product/shop grids
- Image lazy loading + Cloudinary responsive transforms (`w_auto,q_auto,f_auto`)

### Exit Criteria
- [ ] Home page loads under 2s on a mid-tier device with seeded data
- [ ] Shop page correctly scopes products to that vendor only
- [ ] All sections gracefully handle empty state (e.g., no flash sale today)

---

## Phase 7 — Search (Week 15–16)

**Goal:** Fast, relevant global search across products, categories, brands, and shops.

### Scope
- Global search bar with debounce (300ms)
- Search scope: Products, Categories, Brands, Shops — tabbed or unified results
- Recent Searches (stored locally + synced to backend per customer)
- Trending Searches (aggregated from search logs, Super-Admin-curatable override)
- Search-inside-store (scoped to Phase 6 shop page)
- Backend: start with Postgres full-text search (`tsvector`) + trigram similarity for typo tolerance; document upgrade path to OpenSearch/Meilisearch/Algolia if scale demands it — **do not over-engineer this in v1**

### APIs
```
/api/v1/customer/search?q=&scope=&districtId=
/api/v1/customer/search/trending
/api/v1/customer/search/recent      (GET/POST/DELETE)
```

### Exit Criteria
- [ ] Search returns relevant results within 300ms for seeded dataset
- [ ] Typo tolerance handles common misspellings ("mlik" → "milk")
- [ ] Recent searches persist across sessions

---

## Phase 8 — Cart, Checkout & Orders (Week 16–19)

**Goal:** End-to-end purchase flow, correctly grouped by vendor, with coupons and delivery charge logic.

### Scope
1. **Cart** — add/update/remove items, grouped by vendor (a customer can order from multiple shops in one session, but checkout is typically per-vendor or multi-vendor-split — decide and document this explicitly, it affects Order table design), quantity controller with stock validation, persisted server-side (not just local) so it survives app restarts
2. **Coupon Application** — validate against Super Admin/vendor coupon rules, show discount breakdown
3. **Delivery Charge Calculation** — apply Super Admin's distance/district rules, free-delivery threshold
4. **Order Summary** — subtotal, discount, delivery charge, tax, grand total
5. **Checkout** — address selection/add new, payment method selection, place order
6. **Payment Integration** — Razorpay/Stripe/PhonePe (India-first: Razorpay recommended), COD option, webhook handling for payment confirmation
7. **Order Tracking** — status timeline (placed → confirmed → packed → out for delivery → delivered / cancelled), push notifications on status change
8. **Order History** — customer-facing list + detail, reorder button
9. **Cancellation/Refund** — customer-initiated cancellation window, refund status tracking

### APIs
```
/api/v1/customer/cart              (GET/POST/PUT/DELETE)
/api/v1/customer/cart/coupon       (apply/remove)
/api/v1/customer/checkout          (POST — creates order)
/api/v1/customer/payment/webhook
/api/v1/customer/orders            (list, detail, cancel)
```

### Deliverables
- Explicit decision doc: single-vendor cart vs multi-vendor split-order (recommend: **cart can hold multiple vendors, checkout splits into one Order per vendor**, matching how Blinkit/Zepto actually operate — simpler fulfillment and payout logic)

### Exit Criteria
- [ ] Placing a multi-vendor cart creates correctly split Orders with shared payment reference
- [ ] Stock is atomically decremented on order confirmation (use DB transaction to prevent overselling)
- [ ] Vendor panel (Phase 4) receives the new order in real time

---

## Phase 9 — Profile, Wishlist, Reviews & Notifications (Week 19–21)

**Goal:** Round out the customer account experience.

### Scope
- Profile: view/edit, saved addresses (CRUD, default address), wallet (balance, transaction history — even if wallet top-up is a later monetization feature, build the ledger table now)
- Wishlist: add/remove, move-to-cart
- Coupons: "My Coupons" view of applicable/claimed coupons
- Reviews & Ratings: post-delivery review prompt, star rating + text + optional photo, review moderation flag for Super Admin
- Notifications: in-app notification center, push notification setup (FCM), notification preferences
- Support: FAQ, contact/ticket, order-specific help
- Static pages: Privacy Policy, Terms — CMS-editable by Super Admin, not hardcoded

### APIs
```
/api/v1/customer/profile
/api/v1/customer/addresses
/api/v1/customer/wallet
/api/v1/customer/wishlist
/api/v1/customer/reviews
/api/v1/customer/notifications
/api/v1/customer/support/tickets
```

### Exit Criteria
- [ ] Review can only be posted for a delivered order the customer actually placed
- [ ] Push notifications fire correctly for order status changes
- [ ] Static pages editable from Super Admin without app redeploy

---

## Phase 10 — Web App Parity (Week 21–23)

**Goal:** Bring the customer experience to the React + Vite web app, reusing logic where possible.

### Scope
- Port design system to Tailwind (share tokens with NativeWind config conceptually)
- Responsive layouts: mobile-first, but web needs desktop breakpoints (multi-column grids, hover states)
- Reuse API layer (Axios + React Query) — extract into shared `packages/api-client` if not already
- SEO essentials: SSR or pre-rendering for product/shop pages (consider Next.js migration for web only, if SEO matters for organic traffic — flag this as a decision point, since the spec says Vite)
- Web-specific: browser push notifications, PWA manifest for installability

### Exit Criteria
- [ ] Feature parity checklist against mobile app completed
- [ ] Core Web Vitals (LCP, CLS, INP) pass on product and home pages

---

## Phase 11 — Performance, Caching & Scale Hardening (Week 23–25)

**Goal:** Make the platform behave correctly at 10,000+ shops / millions of customers, not just at demo scale.

### Scope
- **Database**: indexes on all foreign keys + common filter columns (districtId, areaId, categoryId, vendorId, status); partition `Order`/`OrderItem` by date if volume warrants; read replicas for analytics queries
- **Caching**: Redis cache for home feed, category tree, shop listings (short TTL + explicit invalidation on vendor product changes — this directly implements the "no manual sync" requirement from the spec)
- **API**: pagination everywhere (cursor-based for infinite scroll, not offset-based, to stay performant at scale), response compression, N+1 query elimination (Prisma `include` audits)
- **Rate limiting**: per-IP and per-user, especially on OTP and search endpoints
- **Image delivery**: Cloudinary responsive/auto-format transforms, CDN caching headers
- **Mobile app**: bundle size audit, Hermes engine confirmation, FlashList everywhere lists exist, image prefetching for above-the-fold content
- **Load testing**: k6 or Artillery scripts simulating district-level concurrent order bursts (e.g., flash sale spike)
- **Observability**: structured logging, error tracking (Sentry), APM (basic latency/error dashboards), DB slow-query logging

### Exit Criteria
- [ ] Load test simulating 5,000 concurrent customers across 100 vendors in one district stays under target p95 latency (define target, e.g. 500ms)
- [ ] No N+1 queries remain on home feed, shop page, or order list endpoints
- [ ] Cache invalidation verified: vendor product edit reflects in customer app within the defined TTL/immediately

---

## Phase 12 — QA, Security Review & Launch Prep (Week 25–27)

**Goal:** De-risk before public launch.

### Scope
- Security: OWASP top-10 pass (SQLi via Prisma is largely mitigated, but audit raw queries), JWT secret rotation plan, rate limiting confirmed, file upload validation (type/size) on Cloudinary signed uploads, RBAC penetration test (vendor can't touch another vendor's data — retest explicitly)
- QA: end-to-end test suite (Playwright for web, Detox for mobile) covering the critical paths — signup → browse → cart → checkout → order tracking → review
- Data seeding: realistic seed script for demo/staging (multiple districts, 100+ vendors, thousands of products) to catch scale bugs early
- App store prep: iOS/Android store listings, screenshots, privacy nutrition labels
- Rollout plan: single-district soft launch → monitor → expand district by district (matches the district-based architecture naturally)

### Exit Criteria
- [ ] Critical-path E2E suite green on staging
- [ ] Security checklist signed off
- [ ] Soft-launch district selected and seeded with real vendor data

---

## Phase 13 — Post-Launch Iteration (Ongoing)

**Goal:** Data-driven roadmap after real usage begins.

### Candidates (prioritize based on real data, not assumption)
- Real recommendation engine (replace rule-based with collaborative filtering)
- Delivery partner app (currently out of spec — vendors self-deliver or third-party; flag this gap explicitly, it's a common next-phase need)
- Subscription/scheduled orders
- Loyalty/rewards program
- Multi-language support
- Advanced analytics for vendors (self-serve dashboards)
- A/B testing framework for home feed sections

---

## Cross-Cutting Notes (apply throughout, not a phase)

- **"No manual sync" requirement**: solved architecturally via cache invalidation hooks in Phase 4 + Phase 11, not by a cron job. Keep this in mind from Phase 4 onward so you don't retrofit it.
- **Category immutability at vendor level**: enforce with a foreign key + read-only dropdown in the vendor UI, and a server-side check rejecting any vendor request that tries to create/edit a category. Don't rely on UI-only restriction.
- **Multi-vendor cart/order split**: this is a data-model decision made in Phase 8 that affects Order, Payment, and Payout design — get it right before building checkout UI.
- **District/Area as the scaling boundary**: almost every customer-facing query should be scoped by district/area first (shops, home feed, delivery charges). This is what lets you scale to 10,000+ shops without one giant unscoped query — bake it into API design from Phase 6, not retrofitted later.

---

## Suggested Team Shape Per Phase (if not solo)

| Phase | Roles Needed |
|---|---|
| 0–2 | 1 Architect/Lead Backend |
| 3–4 | 1–2 Backend, 1 Frontend (admin/vendor web) |
| 5–10 | 1–2 Backend, 2 Mobile, 1 Web Frontend, 1 Designer (concurrent with dev from Phase 5) |
| 11–12 | Full team + 1 QA, 1 DevOps/SRE focus |
| 13 | Steady-state team sized to iteration velocity |

---

*This document is a sequencing guide, not a fixed contract — revisit phase boundaries as real build velocity becomes clear, but keep the dependency order (DB → Auth → Admin → Vendor → Customer → Scale → Launch) intact, since each phase's data is a hard prerequisite for the next.*
