# Guide de déploiement CEEC sur Vercel

## Prérequis

- Compte Vercel connecté à GitHub (`github.com/GateCtr/ceec`)
- Base de données PostgreSQL hébergée sur **Neon** (`neon.tech`) — obligatoire pour le middleware Edge
- Compte Clerk avec domaine de production autorisé

---

## 1. Connexion du dépôt sur Vercel

1. Dans le tableau de bord Vercel, cliquez **"Add New Project"**
2. Importez le dépôt `GateCtr/ceec`
3. Dans les paramètres du projet, configurez :

| Paramètre Vercel | Valeur |
|---|---|
| **Framework Preset** | Next.js |
| **Root Directory** | `artifacts/ceec-website` _(à définir dans l'interface Vercel)_ |
| **Install Command** | `cd ../.. && pnpm install --frozen-lockfile` |
| **Build Command** | `pnpm run prisma:generate && next build` |
| **Output Directory** | `.next` _(par défaut)_ |

> **Note** : Le **Root Directory** se configure uniquement dans l'interface Vercel (pas dans `vercel.json`).
> Les commandes d'installation et de build sont également prédéfinies dans `artifacts/ceec-website/vercel.json`
> et seront détectées automatiquement par Vercel une fois le Root Directory configuré.

---

## 2. Variables d'environnement à configurer sur Vercel

Allez dans **Project Settings → Environment Variables** et ajoutez :

### Base de données (Neon)
| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion Neon (format : `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`) |

> **Important** : L'URL doit être une URL Neon (`*.neon.tech`) pour que le middleware Edge fonctionne sans latence HTTP.

### Clerk (authentification)
| Variable | Description |
|---|---|
| `CLERK_SECRET_KEY` | Clé secrète Clerk (commençant par `sk_live_...`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk (commençant par `pk_live_...`) |
| `CLERK_WEBHOOK_SECRET` | Secret du webhook Clerk (si utilisé) |

### Domaine & sécurité
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_ROOT_DOMAIN` | `ceec-rdc.org` |
| `INTERNAL_RESOLVE_SECRET` | Chaîne secrète aléatoire pour sécuriser l'API interne de résolution d'église (ex: `openssl rand -hex 32`) |

---

## 3. Configuration DNS pour les sous-domaines

Pour que chaque église ait son sous-domaine (`nom.ceec-rdc.org`), configurez chez votre registrar DNS :

```
*.ceec-rdc.org   CNAME   cname.vercel-dns.com
ceec-rdc.org     A       76.76.21.21
```

Puis dans Vercel **Project Settings → Domains**, ajoutez :
- `ceec-rdc.org`
- `*.ceec-rdc.org`

---

## 4. Configuration Clerk pour la production

Dans le tableau de bord Clerk :
1. Allez dans **Domains** → ajoutez `ceec-rdc.org` et `*.ceec-rdc.org`
2. Remplacez les clés de développement (`pk_test_`) par les clés de production (`pk_live_`)
3. Configurez le **Redirect URL** : `https://ceec-rdc.org/sign-in`

---

## 5. Première migration de la base de données

Après le premier déploiement, exécutez la migration initiale depuis votre machine locale :

```bash
# Depuis le dossier artifacts/ceec-website/
DATABASE_URL="votre-url-neon" pnpm prisma:push
```

---

## 6. Ce qui N'est PAS déployé sur Vercel

| Service | Hébergement recommandé |
|---|---|
| **API Server** (`artifacts/api-server`) | Railway, Render, ou Fly.io (serveur Node.js persistant) |
| **Mockup Sandbox** (`artifacts/mockup-sandbox`) | Replit uniquement (développement) |

---

## Architecture de production

```
ceec-rdc.org          → Vercel (Next.js — page d'accueil plateforme)
nom.ceec-rdc.org      → Vercel (Next.js — espace église via wildcard + middleware)
nom.ceec-rdc.org/gestion → Vercel (Next.js — admin église)
ceec-rdc.org/admin    → Vercel (Next.js — super admin plateforme)
```
