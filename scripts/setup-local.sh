#!/usr/bin/env bash
# =============================================================
# scripts/setup-local.sh — Configuración inicial para Mac M1
# =============================================================
# Ejecuta este script UNA SOLA VEZ cuando clones el proyecto.
# Después usa scripts/dev-local.sh para arrancar en desarrollo.
#
# USO:
#   chmod +x scripts/setup-local.sh
#   ./scripts/setup-local.sh
# =============================================================

set -euo pipefail

# ─── Colores ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✓${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
error()   { echo -e "${RED}✗${NC}  $*" >&2; }
header()  { echo -e "\n${BOLD}$*${NC}"; }

# Raíz del repo (donde está este script)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

header "=== LloroLog — Setup local ==="

# ─── 1. Detectar arquitectura ────────────────────────────────
header "1. Verificando sistema..."
ARCH=$(uname -m)
OS=$(uname -s)

if [[ "$OS" == "Darwin" && "$ARCH" == "arm64" ]]; then
  success "Mac con Apple Silicon (M1/M2/M3) detectado"
elif [[ "$OS" == "Darwin" && "$ARCH" == "x86_64" ]]; then
  success "Mac con Intel detectado"
elif [[ "$OS" == "Linux" ]]; then
  success "Linux detectado (arch: $ARCH)"
else
  warn "Sistema no reconocido ($OS $ARCH). Continuando de todas formas..."
fi

# ─── 2. Verificar Node.js ────────────────────────────────────
header "2. Verificando Node.js..."
if ! command -v node &>/dev/null; then
  error "Node.js no encontrado."
  echo "   Instálalo con Homebrew: brew install node@24"
  echo "   O descárgalo de: https://nodejs.org/en/download"
  exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//' | cut -d'.' -f1)
if [[ "$NODE_VERSION" -lt 20 ]]; then
  error "Node.js $NODE_VERSION encontrado, se requiere v20+."
  echo "   Actualiza con: brew install node@24"
  exit 1
fi
success "Node.js $(node --version) ✓"

# ─── 3. Verificar pnpm ───────────────────────────────────────
header "3. Verificando pnpm..."
if ! command -v pnpm &>/dev/null; then
  error "pnpm no encontrado."
  echo "   Instálalo con: npm install -g pnpm"
  exit 1
fi
success "pnpm $(pnpm --version) ✓"

# ─── 4. Verificar Docker ─────────────────────────────────────
header "4. Verificando Docker..."
if ! command -v docker &>/dev/null; then
  warn "Docker no encontrado. Lo necesitarás para la base de datos."
  echo "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
  echo "   (Puedes continuar si tienes PostgreSQL instalado directamente)"
  DOCKER_AVAILABLE=false
else
  if ! docker info &>/dev/null 2>&1; then
    warn "Docker instalado pero no está corriendo."
    echo "   Abre Docker Desktop y espera a que arranque completamente."
    DOCKER_AVAILABLE=false
  else
    success "Docker $(docker --version | awk '{print $3}' | tr -d ',') ✓"
    DOCKER_AVAILABLE=true
  fi
fi

# ─── 5. Crear .env si no existe ──────────────────────────────
header "5. Configurando variables de entorno..."
if [[ ! -f ".env" ]]; then
  cp .env.example .env
  success "Archivo .env creado desde .env.example"
  warn "IMPORTANTE: Edita .env con tus claves reales antes de continuar:"
  echo "   → CLERK_PUBLISHABLE_KEY  (https://dashboard.clerk.com)"
  echo "   → CLERK_SECRET_KEY       (https://dashboard.clerk.com)"
  echo "   → AI_INTEGRATIONS_ANTHROPIC_API_KEY (https://console.anthropic.com)"
  echo ""
  read -rp "¿Ya has editado .env con tus claves? (s/N): " CONFIRM
  if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" && "$CONFIRM" != "si" && "$CONFIRM" != "sí" ]]; then
    warn "Abriendo .env para editar..."
    "${EDITOR:-nano}" .env
  fi
else
  success ".env ya existe, omitiendo"
fi

# Frontend env
if [[ ! -f "artifacts/lloroapp/.env.local" ]]; then
  cp artifacts/lloroapp/.env.local.example artifacts/lloroapp/.env.local
  # Copiar el VITE_CLERK_PUBLISHABLE_KEY desde .env principal
  CLERK_KEY=$(grep "^CLERK_PUBLISHABLE_KEY=" .env 2>/dev/null | cut -d'=' -f2- || echo "")
  if [[ -n "$CLERK_KEY" ]]; then
    if [[ "$OS" == "Darwin" ]]; then
      sed -i '' "s|pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|$CLERK_KEY|g" artifacts/lloroapp/.env.local
    else
      sed -i "s|pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|$CLERK_KEY|g" artifacts/lloroapp/.env.local
    fi
  fi
  success "artifacts/lloroapp/.env.local creado"
else
  success "artifacts/lloroapp/.env.local ya existe, omitiendo"
fi

# ─── 6. Instalar dependencias con workspace local ────────────
header "6. Instalando dependencias (con binarios nativos para $ARCH)..."

WORKSPACE_BACKUP=""
if [[ -f "pnpm-workspace.local.yaml" ]]; then
  info "Detectado pnpm-workspace.local.yaml — usando para instalación local"
  info "Haciendo backup de pnpm-workspace.yaml → pnpm-workspace.replit.yaml"
  cp pnpm-workspace.yaml pnpm-workspace.replit.yaml
  cp pnpm-workspace.local.yaml pnpm-workspace.yaml
  WORKSPACE_BACKUP=true
fi

# Instalar
pnpm install --no-frozen-lockfile

if [[ "$WORKSPACE_BACKUP" == "true" ]]; then
  info "Restaurando pnpm-workspace.yaml original"
  cp pnpm-workspace.replit.yaml pnpm-workspace.yaml
  rm -f pnpm-workspace.replit.yaml
fi

success "Dependencias instaladas ✓"

# ─── 7. Levantar PostgreSQL con Docker ───────────────────────
header "7. Levantando base de datos PostgreSQL..."
if [[ "$DOCKER_AVAILABLE" == "true" ]]; then
  docker compose up -d db
  info "Esperando a que PostgreSQL esté listo..."
  RETRIES=20
  while [[ $RETRIES -gt 0 ]]; do
    if docker compose exec -T db pg_isready -U llorouser -d lloroLog &>/dev/null 2>&1; then
      success "PostgreSQL listo ✓"
      break
    fi
    sleep 2
    RETRIES=$((RETRIES - 1))
  done
  if [[ $RETRIES -eq 0 ]]; then
    warn "PostgreSQL tardó demasiado en arrancar. Comprueba: docker compose logs db"
  fi
else
  warn "Docker no disponible. Asegúrate de tener PostgreSQL corriendo en localhost:5432"
  warn "y que DATABASE_URL en .env sea correcto."
fi

# ─── 8. Crear tablas en la BD ────────────────────────────────
header "8. Creando tablas en la base de datos..."
if pnpm --filter @workspace/db run push; then
  success "Tablas creadas correctamente ✓"
else
  error "Error al crear las tablas. Verifica que DATABASE_URL en .env sea correcto"
  error "y que PostgreSQL esté corriendo."
  exit 1
fi

# ─── Fin ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}¡Setup completado!${NC}"
echo ""
echo "Para arrancar en desarrollo:"
echo -e "  ${BOLD}./scripts/dev-local.sh${NC}"
echo ""
echo "O manualmente en dos terminales:"
echo -e "  Terminal 1 (API):     ${BOLD}./scripts/start-api.sh${NC}"
echo -e "  Terminal 2 (Web):     ${BOLD}./scripts/start-web.sh${NC}"
echo ""
echo "URLs locales:"
echo "  → Frontend:  http://localhost:3000"
echo "  → API:       http://localhost:8080/api/healthz"
echo "  → Adminer:   http://localhost:8888  (usuario: llorouser / pwd: lloropassword)"
