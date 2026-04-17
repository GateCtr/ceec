# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the CEEC website (Next.js) and supporting packages.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Database**: PostgreSQL via Neon + **Prisma 7** (`prisma` + `@prisma/adapter-pg`)

## Artifacts

### CEEC Website (`artifacts/ceec-website/`)
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Clerk v7 (`@clerk/nextjs@^7.0.12`) — platform auth (`/sign-in`) for global admins, church-level auth (`/c/connexion`) for members
- **ORM**: Prisma 7 with `@prisma/adapter-pg` (PrismaPg adapter)
- **Prisma client import**: `import { prisma } from "@/lib/db/index"` (wraps PrismaClient with PrismaPg adapter)
- **Prisma config**: `prisma.config.ts` with `defineConfig({ datasourceUrl: process.env.DATABASE_URL })`
- **Schema**: `prisma/schema.prisma` (no `url` in datasource block — Prisma 7 breaking change)
- **Type imports**: `import type { Annonce, Evenement, PageEglise, SectionPage, ... } from "@prisma/client"`
- **Styling**: Inline styles (no Tailwind class usage, uses Tailwind as base reset)
- **Language**: French (localization via Clerk `frFR`)
- **Port**: 3000 (dev workflow: `artifacts/ceec-website: CEEC Website`)
- **Proxy/Middleware**: `proxy.ts` at root (renamed from `middleware.ts` for Next.js 16 compatibility)
- **Middleware**: `middleware.ts` at church root for x-eglise-id/x-eglise-slug header injection

#### Route Groups
- `(platform)` — Top-level public site + platform auth
- `(church)` — Church-specific pages under `/c/`, gestion dashboard under `/gestion/`
- `admin` — Super-admin dashboard at `/admin/`

#### Church Public Pages (`/c/[slug]/...`)
- `/c` — Church home with dynamic DB sections via SectionRenderer
- `/c/[pageSlug]` — Custom pages from DB (404 if not found or unpublished)
- `/c/annonces` — Enriched annonces: image, categorie, priority badges, pagination (12/page)
- `/c/annonces/[id]` — Annonce detail with sidebar
- `/c/evenements` — Enriched evenements: image, categorie, tabs (upcoming/past), pagination
- `/c/evenements/[id]` — Evenement detail with sidebar + registration link
- `/c/connexion`, `/c/inscription` — Church-level auth pages

#### Church Gestion Dashboard (`/gestion/`)
- `/gestion` — Dashboard home (stats)
- `/gestion/annonces` — CRUD with image, **video**, categorie, priorité, **visibilite** (public/communaute/prive)
- `/gestion/evenements` — CRUD with image, **video**, categorie, lieu, lien inscription, **visibilite** (public/communaute/prive)
- `/gestion/membres` — Member management
- `/gestion/admins` — Admin/role management
- `/gestion/parametres` — Church settings (basic info)
- `/gestion/pages` — Page manager (create/publish/delete custom pages)
- `/gestion/pages/[id]` — Section editor (add/reorder/configure sections)
- `/gestion/apparence` — Branding editor (colors, favicon, CSS, social links)
- `/gestion/videos` — YouTube live/replay management

#### Admin Dashboard (`/admin/`)
- `/admin` — Stats + church list
- `/admin/eglises` — Church management
- `/admin/eglises/[slug]` — Church detail + "Superviser le contenu" button
- `/admin/eglises/[slug]/contenu` — Read-only content supervision (pages, annonces, evenements, videos)
- `/admin/eglises/nouveau` — Create new church

#### API Routes — Gestion
All under `/api/gestion/`, require `x-eglise-id` header, Clerk auth, and RBAC permission checks:
- `GET/POST /api/gestion/annonces` — Annonces CRUD (permission: `eglise_creer_annonce`)
- `PUT/DELETE /api/gestion/annonces/[id]`
- `GET/POST /api/gestion/evenements`
- `PUT/DELETE /api/gestion/evenements/[id]`
- `GET/POST /api/gestion/membres`
- `PUT/DELETE /api/gestion/membres/[id]`
- `GET/POST /api/gestion/pages` — PageEglise CRUD (permission: `eglise_gerer_config`)
- `GET/PUT/DELETE /api/gestion/pages/[id]`
- `POST /api/gestion/sections` — SectionPage CRUD (permission: `eglise_gerer_config`)
- `PUT/DELETE /api/gestion/sections/[id]`
- `GET/PUT /api/gestion/config` — EgliseConfig upsert
- `GET/POST /api/gestion/videos` — LiveStream CRUD (permission: `eglise_gerer_annonces`)
- `PUT/DELETE /api/gestion/videos/[id]`
- `GET/POST /api/gestion/marathons` — Marathon CRUD (permission: `eglise_creer_evenement`)
- `GET/PATCH/DELETE /api/gestion/marathons/[id]`
- `GET/POST /api/gestion/marathons/[id]/participants` — Participant management
- `POST /api/gestion/marathons/[id]/import-csv` — Bulk CSV import
- `GET /api/gestion/marathons/[id]/stats` — Presence statistics by day
- `POST /api/gestion/marathons/[id]/cloturer-journee` — Mark absent all non-scanned for a day
- `GET /api/gestion/marathons/[id]/badge/[participantId]` — Badge data with QR data URL (no auth)

#### API Routes — Public Marathon (no auth required)
- `GET /api/marathons/[id]/session` — Get today's session info (or setup required)
- `POST /api/marathons/[id]/session` — Create/update today's session with access code
- `POST /api/marathons/[id]/scan` — Record QR scan attendance (requires access code)
- `GET /api/marathons/[id]/scan` — List today's presences (requires access code)

#### API Routes — Member Marathon
- `POST /api/membre/marathons/[id]/inscrire` — Self-register as participant
- `DELETE /api/membre/marathons/[id]/inscrire` — Self-unregister

#### RBAC System (`lib/auth/rbac.ts`)
- 9 roles: `super_admin`, `admin_eglise`, `moderateur`, `secretaire`, `tresorier`, `diacre`, `ancien`, `responsable_dept`, `fidele`
- 24 permissions including: `eglise_gerer_config`, `eglise_gerer_annonces`, `eglise_creer_annonce`, `eglise_voir_annonces`, `eglise_gerer_evenements`, `eglise_creer_evenement`, `eglise_gerer_membres`, `eglise_gerer_roles`
- `isSuperAdmin(userId)` — checks by Clerk userId against DB
- `hasPermission(userId, permission, egliseId)` — checks UserRole table

#### DB Schema (Prisma models)
- `Eglise` — Church registry (nom, slug, sousDomaine, statut, ville, etc.)
- `EgliseConfig` — Branding (couleurPrimaire, couleurAccent, faviconUrl, cssPersonnalise, social links, horaires)
- `PageEglise` — Custom pages (titre, slug, type, publie, ordre)
- `SectionPage` — Page sections (type, config JSON, ordre) — 8 types: hero, texte_image, live, annonces, evenements, contact, departements, galerie
- `LiveStream` — YouTube videos (urlYoutube, estEnDirect, epingle, publie)
- `Membre` — Church member profile (clerkUserId, nom, prenom, email, role, statut)
- `UserRole` — RBAC join table (clerkUserId, roleId, egliseId)
- `Role` — Role registry (nom)
- `Annonce` — Announcements (titre, contenu, imageUrl, videoUrl, categorie, priorite, publie, dateExpiration, visibilite)
- `Evenement` — Events (titre, description, imageUrl, videoUrl, categorie, lienInscription, dateDebut, dateFin, lieu, publie, visibilite)
- `Marathon` — Multi-day spiritual retreat (egliseId, titre, theme, referenceBiblique, dateDebut, nombreJours, joursExclus[], statut, denomination, createdByUserId)
- `MarathonParticipant` — Marathon participant with QR token (marathonId, membreId?, nom, prenom, email, numeroId, qrToken)
- `MarathonPresence` — Daily attendance record (participantId, marathonId, numeroJour, date, statut, scanneParNom, scannedAt)
- `MarathonSession` — Daily volunteer session (marathonId, date, numeroJour, codeAcces, nomControleur)

#### Marathon System Pages
- `/gestion/marathons` — Admin list with create modal, status toggle, delete
- `/gestion/marathons/[id]` — Detail dashboard: participants table, stats by day, CSV import, config
- `/c/marathons` — Member list of marathons with self-registration
- `/c/marathons/[id]` — Member detail: QR badge card, print button, personal presence tracking
- `/marathon-scan/[id]` — Public volunteer scan interface (no auth, camera QR + manual, access code system)

#### Marathon Utilities (`lib/marathon-utils.ts`)
- `computeMarathonDays(dateDebut, nombreJours, joursExclus)` — Compute actual calendar days (skipping excluded days)
- `getMarathonDayNumber(dateDebut, nombreJours, joursExclus, targetDate)` — Day number for a given date
- `generateQrToken()` — 24-byte hex unique token
- `formatNumeroId(marathonId, seq)` — Format "M1-001" style ID
- `generateAccessCode()` — 6-char hex uppercase code for daily sessions

#### Key Components
- `components/church/SectionRenderer.tsx` — Dispatches to 8 section type components
- `components/church/sections/` — SectionHero, SectionTexteImage, SectionLive, SectionAnnoncesRecentes, SectionEvenementsAVenir, SectionContact, SectionDepartements, SectionGalerie
- `components/church/ChurchNavbar.tsx` — Responsive hamburger nav with custom pages
- `components/church/ChurchFooter.tsx` — SVG social icons, contact info
- `components/gestion/GestionPagesClient.tsx` — Page manager
- `components/gestion/GestionPageDetailClient.tsx` — Section editor with up/down reorder
- `components/gestion/GestionApparenceClient.tsx` — Branding editor with color picker
- `components/gestion/GestionVideosClient.tsx` — YouTube live manager with thumbnails
- `components/gestion/GestionAnnoncesClient.tsx` — Annonces CRUD (image, video, categorie, priorite, visibilite)
- `components/gestion/GestionEvenementsClient.tsx` — Evenements CRUD (image, video, categorie, lienInscription, visibilite)
- `components/gestion/ImagePicker.tsx` — Image upload (Cloudinary, drag & drop, 5 Mo max)
- `components/gestion/VideoPicker.tsx` — Video upload (Cloudinary, drag & drop, 100 Mo max, MP4/MOV/WebM)
- `lib/sanitize-url.ts` — `safeUrl()` for config-sourced URLs (social links, CTAs, YouTube)

#### Security
- `safeUrl()` from `lib/sanitize-url.ts` applied to all config-sourced URLs
- CSS var values whitelisted against injection
- `cssPersonnalise` sanitized against `</style>`, `<script>`, `javascript:`, `@import`, `expression()`
- All gestion API routes check `isSuperAdmin` OR church-level `hasPermission`

### API Server (`artifacts/api-server/`)
- Express 5 API, port 8080 (not currently used)

### Mockup Sandbox (`artifacts/mockup-sandbox/`)
- Vite dev server for canvas component previews, port 8081

## Replit Migration Notes

- `pnpm.onlyBuiltDependencies` added to root `package.json` to allow Prisma, Clerk, sharp, and esbuild postinstall scripts to run
- Dev/start scripts updated to use `${PORT:-3000} -H 0.0.0.0` for Replit proxy compatibility
- `server.allowedHosts: true` in Vite configs

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/ceec-website exec prisma db push` — push CEEC DB schema changes
- `pnpm --filter @workspace/ceec-website exec prisma generate` — regenerate Prisma client

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (Neon)
- `CLERK_SECRET_KEY` — Clerk secret (server-side)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
- `CLERK_WEBHOOK_SECRET` — Webhook secret for Clerk events
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` — /sign-in (platform)
