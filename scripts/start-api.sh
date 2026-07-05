#!/usr/bin/env bash
# =============================================================
# scripts/start-api.sh — Arranca el servidor Express en local
# =============================================================
# USO: ./scripts/start-api.sh
# =============================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Cargar .env si existe
if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Valores por defecto para entorno local
export PORT="${PORT:-8080}"
export NODE_ENV="${NODE_ENV:-development}"

echo "▶ Compilando API server..."
pnpm --filter @workspace/api-server run build

echo "▶ Arrancando API server en http://localhost:${PORT}"
node --enable-source-maps artifacts/api-server/dist/index.mjs
