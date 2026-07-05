#!/usr/bin/env bash
# =============================================================
# scripts/dev-local.sh — Arranca frontend + API juntos
# =============================================================
# Lanza ambos procesos en una sola terminal con salida coloreada.
# Pulsa Ctrl+C para parar los dos.
#
# USO: ./scripts/dev-local.sh
# =============================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# ─── Colores para diferenciar salidas ────────────────────────
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Verificar que .env existe
if [[ ! -f ".env" ]]; then
  echo "Error: .env no encontrado. Ejecuta primero: ./scripts/setup-local.sh"
  exit 1
fi

# Cargar variables
set -a
source .env
if [[ -f "artifacts/lloroapp/.env.local" ]]; then
  source artifacts/lloroapp/.env.local
fi
set +a

API_PORT="${PORT:-8080}"
WEB_PORT="${VITE_PORT:-3000}"

echo -e "${BOLD}LloroLog — Modo desarrollo local${NC}"
echo "  API  → http://localhost:${API_PORT}/api/healthz"
echo "  Web  → http://localhost:${WEB_PORT}"
echo ""
echo "Pulsa Ctrl+C para parar."
echo ""

# Función para prefixar salida con color
prefix_output() {
  local prefix="$1"
  local color="$2"
  while IFS= read -r line; do
    echo -e "${color}${prefix}${NC} $line"
  done
}

# Compilar API antes de arrancar (necesario para el build de esbuild)
echo "Compilando API..."
pnpm --filter @workspace/api-server run build

# Arrancar API en background
(
  export PORT="$API_PORT"
  node --enable-source-maps artifacts/api-server/dist/index.mjs 2>&1 | prefix_output "[api] " "$BLUE"
) &
API_PID=$!

# Pequeña pausa para que la API esté lista antes del frontend
sleep 1

# Arrancar frontend en background
(
  export PORT="$WEB_PORT"
  export BASE_PATH="${BASE_PATH:-/}"
  export API_PORT="$API_PORT"
  pnpm --filter @workspace/lloroapp exec vite --config vite.config.local.ts 2>&1 | prefix_output "[web] " "$PURPLE"
) &
WEB_PID=$!

# Esperar a que cualquiera de los dos muera, y luego matar al otro
cleanup() {
  echo ""
  echo "Parando servidores..."
  kill "$API_PID" 2>/dev/null || true
  kill "$WEB_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
  wait "$WEB_PID" 2>/dev/null || true
  echo "Hasta luego 💧"
}

trap cleanup EXIT INT TERM
wait "$API_PID" "$WEB_PID"
