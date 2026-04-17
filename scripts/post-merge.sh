#!/bin/bash
set -e
pnpm install --frozen-lockfile
# Regenerate Prisma client after any schema changes
pnpm --filter @workspace/ceec-website exec prisma generate
# Push schema changes to database (additive only — fails safely if destructive)
pnpm --filter @workspace/ceec-website exec prisma db push
