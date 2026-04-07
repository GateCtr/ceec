# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the CEEC website (Next.js) and supporting packages.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (api-server artifact)
- **Database**: PostgreSQL + **Prisma 7** (`prisma` + `@prisma/adapter-pg`)
- **Build**: esbuild (CJS bundle for api-server)

## Artifacts

### CEEC Website (`artifacts/ceec-website/`)
- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk v7 (`@clerk/nextjs@^7.0.8`, `@clerk/localizations@^4`) — **custom auth pages** using `useSignIn`/`useSignUp` hooks (Core v3 API: `signIn.password()`, `signIn.finalize()`, `signUp.verifications.sendEmailCode()`)
- **ORM**: Prisma 7.6.0 with `@prisma/adapter-pg` (PrismaPg adapter)
- **Prisma client import**: `import { prisma } from "@/lib/db"` (NOT `db`)
- **Prisma config**: `prisma.config.ts` with `defineConfig({ datasourceUrl: process.env.DATABASE_URL })`
- **Schema**: `prisma/schema.prisma` (no `url` in datasource block — Prisma 7 breaking change)
- **Type imports**: `import type { Paroisse, Membre, Annonce, Evenement } from "@prisma/client"`
- **Styling**: Inline styles (no Tailwind class usage, uses Tailwind as base reset)
- **Language**: French (localization via Clerk `frFR`)
- **Port**: 3000 (dev workflow: `artifacts/ceec-website: CEEC Website`)
- **Proxy/Middleware**: `proxy.ts` at root (renamed from `middleware.ts` for Next.js 16 compatibility)
- **Clerk v7 notes**: `SignedIn`/`SignedOut` removed — use `useAuth()` hook (`isSignedIn`) instead; `UserButton` still available; `afterSignOutUrl` prop removed from `UserButton`

#### Pages
- `/` — Home (hero, valeurs, paroisses, annonces, events sections)
- `/paroisses` — All paroisses list
- `/paroisses/[id]` — Paroisse detail
- `/evenements` — All events list (public)
- `/annonces` — All announcements (public)
- `/contact` — Contact page with form
- `/sign-in` — Clerk sign-in
- `/sign-up` — Clerk sign-up
- `/dashboard` — Fidèle private dashboard
- `/dashboard/profile` — Profile creation/edit form
- `/admin` — Admin dashboard (admin role required)
- `/admin/paroisses` — Manage paroisses (CRUD)
- `/admin/membres` — View all members
- `/admin/annonces` — Publish announcements
- `/admin/evenements` — Manage events

#### API Routes
- `GET/POST /api/paroisses` — Public list + admin create
- `GET/PUT/DELETE /api/paroisses/[id]` — Get/update/delete paroisse
- `GET /api/annonces` — Public announcements (publie=true)
- `POST /api/annonces` — Admin create announcement
- `GET/PUT/DELETE /api/annonces/[id]` — Get/update/delete annonce
- `GET /api/evenements` — Public events (publie=true)
- `POST /api/evenements` — Admin create event
- `GET/PUT/DELETE /api/evenements/[id]` — Get/update/delete evenement
- `GET /api/membres` — Admin: list all members (with paroisse)
- `GET/PUT/DELETE /api/membres/[id]` — Admin CRUD on a member
- `POST /api/membres/profile` — Create member profile
- `PUT /api/membres/profile` — Update own member profile

#### DB Schema (Prisma models)
- `Paroisse` — Church parishes
- `Membre` — Member/user profiles (linked to Clerk userId via `clerkUserId`)
- `Annonce` — Announcements
- `Evenement` — Events

#### Roles
- `fidele` — Standard member (default)
- `admin` — Admin with full CRUD access (checked via DB `membres.role`)

### API Server (`artifacts/api-server/`)
- Express 5 API, port 8080

### Mockup Sandbox (`artifacts/mockup-sandbox/`)
- Vite dev server for canvas component previews, port 8081

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/ceec-website exec prisma db push --url="$DATABASE_URL"` — push CEEC DB schema changes
- `pnpm --filter @workspace/ceec-website exec prisma generate` — regenerate Prisma client

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (Replit built-in)
- `CLERK_SECRET_KEY` — Clerk secret (server-side)
- `CLERK_PUBLISHABLE_KEY` — Clerk publishable key (forwarded as NEXT_PUBLIC at runtime)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — /sign-in
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — /sign-up
- `NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL` — /dashboard
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` — /dashboard
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` — /dashboard

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
