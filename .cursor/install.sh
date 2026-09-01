#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for my-hikaku-memo.
# Runs after the repository is checked out. Safe to run repeatedly.
set -euo pipefail

cd "$(dirname "$0")/.."

# 1. Install dependencies with the pinned pnpm version (via corepack) and lockfile.
corepack pnpm install --frozen-lockfile

# 2. Install the Chromium build Playwright pins, for E2E tests.
corepack pnpm exec playwright install chromium

# 3. Provide dev-safe env vars so `next dev` / build can boot without real
#    Google OAuth credentials. Only created if absent, so real secrets a user
#    adds later are preserved. Google OAuth cannot be exercised in a Cloud Agent
#    anyway; login-dependent E2E tests inject a session directly into local D1.
if [ ! -f .env.local ]; then
  cat > .env.local <<EOF
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_GOOGLE_ID=dev-google-client-id
AUTH_GOOGLE_SECRET=dev-google-client-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
fi

# 4. Apply migrations to the local D1 (miniflare) database. Idempotent: wrangler
#    tracks already-applied migrations. `pnpm dev` also re-applies on boot.
corepack pnpm db:migrate:local
