# groceries

DistrictMart — multi-vendor grocery marketplace (District → Area → Vendor → Product).

## Folders

- `app/` — Customer mobile (React Native + Expo)
- `server/` — Express + Prisma API
- `superadmin/` — Super Admin + Vendor panel
- `web/` — Customer web app
- `docs/` — Build plan & status

## Quick start

```bash
# API
cd server && npm install && npm run db:push && npm run db:seed && npm run dev

# Super Admin
cd superadmin && npm install && npm run dev

# Customer web
cd web && npm install && npm run dev

# Mobile
cd app && npm install && npm start
```

API: `http://127.0.0.1:3000` (use 127.0.0.1, not localhost on Windows)

## Logins (dev)

| Role | Credentials |
|------|-------------|
| Super Admin | admin@districtmart.com / Admin@123 |
| Vendor | vendor@districtmart.com / Vendor@123 |
| Customer | any 10-digit phone + OTP `123456` |
