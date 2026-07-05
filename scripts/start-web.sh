#!/usr/bin/env bash
# =============================================================
# scripts/start-web.sh — Arranca el frontend Vite en local
# =============================================================
# USO: ./scripts/start-web.sh
# =============================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Cargar .env del frontend si existe
if [[ -f "artifacts/lloroapp/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source artifacts/lloroapp/.env.local
  set +a
fi

# Valores por defecto para entorno local
export PORT="${PORT:-3000}"
export BASE_PATH="${BASE_PATH:-/}"
export API_PORT="${API_PORT:-8080}"

echo "▶ Arrancando frontend en http://localhost:${PORT}"
pnpm --filter @workspace/lloroapp exec vite --config vite.config.local.ts
