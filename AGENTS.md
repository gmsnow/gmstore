<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:gmstore-agent -->
# GMStore AI Agent — Knowledge Reference

Full knowledge base: `.opencode/agents/gmstore-agent.md`

## Quick Reference
- **Framework**: Next.js 16.2.7 + Turbopack + TypeScript strict
- **DB**: PostgreSQL + Prisma (Railway prod, localhost dev)
- **Auth**: NextAuth v5, JWT, Credentials + optional Google OAuth
- **Styling**: Tailwind v4 (CSS-based), CVA, tailwind-merge
- **Animation**: Motion v12 (framer-motion)
- **Deployment**: GitHub main → Vercel auto-deploy, Railway PostgreSQL
- **i18n**: Arabic (RTL, primary) + English (LTR), ~430 keys each
- **Currency**: YER (base) → USD → SAR, 1 USD = 535 YER
- **Cart**: localStorage, color-aware, free shipping ≥ 5000 YER
- **Images**: loremflickr (cat), UploadThing (products), local (merchant)
- **Roles**: CUSTOMER, MERCHANT, ADMIN
- **Admin login**: admin@gmstore.com / admin123
- **EPERM fix**: `Get-Process -Name "node" | Stop-Process -Force`

## Rules
1. Read `node_modules/next/dist/docs/` before writing Next.js code
2. No `SessionProvider` — server-side auth only via `await auth()` (call inside handler, NOT as route wrapper for POST routes)
3. Slug: `normalize("NFC")` client + server, `userId.slice(0,8)` suffix
4. `font=raleway` breaks Arabic — omit from placehold.co URLs
5. `.env` = Railway prod, `.env.local` = localhost dev
6. Push to `main` → Vercel auto-deploy
<!-- END:gmstore-agent -->
